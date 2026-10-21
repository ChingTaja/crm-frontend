import { useEffect, useRef, useState } from 'react';
import { customerApi } from '../models/customer-service';
import { cacheCustomer } from '../models/customer-model';
import { createCustomerImportTemplate, parseCustomerImport, validateCustomerImportFile, type CustomerImportRow } from '../models/customer-import';
import { ApiError } from '@/api/api-error';
import { createCustomerImportBatch, applyCustomerImportResult, type CustomerImportBatch } from '../models/customer-import-runner';

export function useCustomerImport(onImported: () => void) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CustomerImportRow[]>([]);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'idle' | 'reading' | 'importing' | 'retry' | 'done'>('idle');
  const [downloading, setDownloading] = useState(false);
  const active = useRef<AbortController | null>(null);
  const running = useRef(false);
  const batchRef = useRef<{ batch: CustomerImportBatch; rows: CustomerImportRow[]; completed: boolean } | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; active.current?.abort(); }; }, []);
  const isImporting = phase === 'importing';

  function changeOpen(next: boolean) {
    if (running.current) return;
    if (!next) active.current?.abort();
    setOpen(next);
    if (next && (!batchRef.current || batchRef.current.completed)) { batchRef.current = null; setRows([]); setFilename(''); setError(''); setPhase('idle'); }
  }
  async function selectFile(file: File) {
    if (running.current) return;
    active.current?.abort();
    batchRef.current = null;
    const controller = new AbortController();
    active.current = controller;
    setRows([]); setFilename(file.name); setError(''); setPhase('reading');
    try {
      validateCustomerImportFile(file);
      const buffer = await file.arrayBuffer();
      controller.signal.throwIfAborted();
      const parsed = await parseCustomerImport(buffer);
      controller.signal.throwIfAborted();
      setRows(parsed);
    } catch (cause) {
      if (!controller.signal.aborted && mounted.current) setError(cause instanceof Error ? cause.message : '無法讀取檔案。');
    } finally {
      if (!controller.signal.aborted && mounted.current) setPhase('idle');
    }
  }
  async function startImport() {
    if (running.current || phase === 'reading' || (!rows.some(row => row.status === 'ready') && phase !== 'retry')) return;
    let job = batchRef.current;
    if (!job) {
      try {
        job = { batch: createCustomerImportBatch(rows, crypto.randomUUID()), rows: structuredClone(rows), completed: false };
        batchRef.current = job;
      } catch (cause) { setError(cause instanceof Error ? cause.message : '無法準備匯入。'); return; }
    }
    if (job.completed) return;
    running.current = true;
    const controller = new AbortController(); active.current = controller;
    setError(''); setPhase('importing');
    try {
      const response = await customerApi.importBatch(controller.signal, job.batch.request, job.batch.idempotencyKey);
      controller.signal.throwIfAborted();
      const updated = applyCustomerImportResult(job.rows, job.batch, response);
      for (const result of response.results) {
        const row = job.rows.find(item => item.rowNumber === result.rowNumber);
        if (result.status === 'success' && result.customerId && row) cacheCustomer({ ...row.customer, id: result.customerId });
      }
      job.completed = true;
      if (mounted.current) { setRows(updated); setPhase('done'); }
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted) {
        const uncertain = !(cause instanceof ApiError) || cause.status >= 500;
        const message = cause instanceof Error ? cause.message : '匯入失敗。';
        const sent = new Set(job.batch.request.rows.map(row => row.rowNumber));
        setRows(job.rows.map(row => sent.has(row.rowNumber) ? {
          ...row, status: uncertain ? 'uncertain' : 'failed', messages: [message],
        } : row));
        setError(uncertain ? `${message} 可按「重新取得匯入結果」以原批次識別碼確認結果。` : message);
        job.completed = !uncertain;
        setPhase(uncertain ? 'retry' : 'done');
      }
    } finally {
      running.current = false;
      if (mounted.current) onImported();
    }
  }
  async function downloadTemplate(includeExample = false) {
    if (downloading) return;
    setDownloading(true);
    try {
      const buffer = await createCustomerImportTemplate(includeExample);
      if (!mounted.current) return;
      const url = URL.createObjectURL(new Blob([buffer], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = includeExample ? '客戶批次匯入範例.csv' : '客戶批次匯入範本.csv';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : '範本下載失敗，請重試。');
    } finally { if (mounted.current) setDownloading(false); }
  }
  return { open, changeOpen, rows, filename, error, phase, isImporting, downloading, selectFile, startImport, downloadTemplate };
}
