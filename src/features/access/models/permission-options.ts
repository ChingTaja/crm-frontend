import type { PermissionResponse } from '../../../api/Api';
const quoteUpdateCodes = new Set(['quotes.update', 'quotes.new-version', 'quotes.request-approval', 'quotes.approve', 'quotes.send', 'quotes.convert', 'quotes.record-decision']);
export function permissionOptions(catalog: PermissionResponse[]) {
  const quoteUpdates = catalog.filter(p => quoteUpdateCodes.has(p.code));
  const options = catalog.filter(p => !quoteUpdateCodes.has(p.code)).map(p => ({ ...p, codes: [p.code] }));
  if (quoteUpdates.length) options.push({ code: 'quotes.update', name: '修改報價', entity: 'quotes', groupName: quoteUpdates[0].groupName, description: '包含送出、審批、客戶回覆及轉單。', codes: quoteUpdates.map(p => p.code) });
  return options;
}
