import type { Customer } from '../../customer/models/customer-model';

export interface Contact {
  id: string;
  customerId: Customer['id'];
  name: string;
  title: string;
  email: string;
  phone: string;
  createdAt: string;
}

export const contacts: Contact[] = [
  {
    id: 'p1',
    customerId: 'c1',
    name: '許子晴',
    title: '專案經理',
    email: 'zoe@example.com',
    phone: '02-5550-0101',
    createdAt: '2026-09-20',
  },
  {
    id: 'p2',
    customerId: 'c2',
    name: '張家豪',
    title: '技術總監',
    email: 'leo@example.com',
    phone: '03-555-0102',
    createdAt: '2026-09-19',
  },
  {
    id: 'p3',
    customerId: 'c3',
    name: '黃詩涵',
    title: '採購經理',
    email: 'mia@example.com',
    phone: '04-5550-0103',
    createdAt: '2026-09-18',
  },
  {
    id: 'p4',
    customerId: 'c4',
    name: '李承恩',
    title: '品牌企劃',
    email: 'ian@example.com',
    phone: '02-5550-0104',
    createdAt: '2026-09-17',
  },
  {
    id: 'p5',
    customerId: 'c5',
    name: '周品妤',
    title: '營運主管',
    email: 'amy@example.com',
    phone: '03-555-0105',
    createdAt: '2026-09-16',
  },
];

const surnames = ['林', '陳', '王', '李', '張', '黃', '吳', '劉', '蔡', '楊'];
const givenNames = [
  '子晴',
  '家豪',
  '詩涵',
  '承恩',
  '品妤',
  '宇軒',
  '雅筑',
  '柏翰',
  '佳穎',
  '冠廷',
  '怡君',
  '書瑋',
  '思妍',
  '彥廷',
  '欣儀',
];
const titles = ['專案經理', '技術總監', '採購經理', '品牌企劃', '營運主管', '業務專員'];

for (let number = 6; number <= 150; number++) {
  const index = number - 1;
  const suffix = String(number).padStart(3, '0');
  const createdAt = new Date(Date.UTC(2026, 8, 20 - index)).toISOString().slice(0, 10);
  const customerId = `c${number}`;

  contacts.push({
    id: `p${number}`,
    customerId,
    name: `${surnames[index % surnames.length]}${givenNames[Math.floor(index / surnames.length) % givenNames.length]}`,
    title: titles[index % titles.length],
    email: `contact${suffix}@example.com`,
    phone: `02-5550-${String(number).padStart(4, '0')}`,
    createdAt,
  });
}

let contactSnapshot = contacts;
const contactListeners = new Set<() => void>();
export const contactRepository = {
  getSnapshot: () => contactSnapshot,
  subscribe(listener: () => void) {
    contactListeners.add(listener);
    return () => {
      contactListeners.delete(listener);
    };
  },
  create(contact: Omit<Contact, 'id'>) {
    const record = { ...contact, id: `p-${crypto.randomUUID()}` };
    contactSnapshot = [record, ...contactSnapshot];
    contactListeners.forEach((listener) => listener());
    return record;
  },
  removeMany(ids: string[]) {
    const selected = new Set(ids);
    const next = contactSnapshot.filter(record => !selected.has(record.id));
    if (next.length === contactSnapshot.length) return;
    contactSnapshot = next;
    contactListeners.forEach(listener => listener());
  },
  update(contact: Contact) {
    contactSnapshot = contactSnapshot.map((item) => (item.id === contact.id ? { ...contact } : item));
    contactListeners.forEach((listener) => listener());
  },
};
