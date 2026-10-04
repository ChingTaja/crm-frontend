import type { PermissionResponse } from '../../../api/Api';
const quoteUpdateCodes = new Set(['quotes.update', 'quotes.new-version', 'quotes.request-approval', 'quotes.approve', 'quotes.send', 'quotes.convert', 'quotes.record-decision']);
export function permissionOptions(catalog: PermissionResponse[]) {
  const quoteUpdates = catalog.filter(p => quoteUpdateCodes.has(p.code));
  const options = catalog.filter(p => !quoteUpdateCodes.has(p.code)).map(p => ({ ...p, codes: [p.code] }));
  if (quoteUpdates.length) options.push({ code: 'quotes.update', name: '修改報價', entity: 'quotes', groupName: quoteUpdates[0].groupName, description: '包含送出、審批、客戶回覆及轉單。', codes: quoteUpdates.map(p => p.code) });
  return options;
}

export function hasPermission(codes: readonly string[], code: string) {
  const entity = code.split('.')[0];
  return codes.includes(code) && (code.endsWith('.read') || codes.includes(`${entity}.read`));
}

export function togglePermission(selected: string[], codes: string[], checked: boolean) {
  const next = new Set(selected);
  for (const code of codes) {
    const entity = code.split('.')[0];
    if (checked) {
      next.add(`${entity}.read`);
      next.add(code);
    } else if (code.endsWith('.read')) {
      for (const existing of next) if (existing.startsWith(`${entity}.`)) next.delete(existing);
    } else next.delete(code);
  }
  return [...next];
}

export function canGrantPermission(codes: string[], catalogCodes: string[], actorCodes: readonly string[]) {
  return codes.every(code => actorCodes.includes(code) && catalogCodes.includes(code) &&
    actorCodes.includes(`${code.split('.')[0]}.read`) && catalogCodes.includes(`${code.split('.')[0]}.read`));
}
