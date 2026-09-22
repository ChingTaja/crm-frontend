export interface Customer {
  id: string;
  name: string;
  industry: string;
  owner: string;
  createdAt: string;
  address: string;
}

// Preview fixtures only. Replace with API data when the backend is ready.
export const customers: Customer[] = [
  {
    id: 'c1',
    name: '青禾設計',
    industry: '設計服務',
    owner: '林雅婷',
    createdAt: '2026-09-20',
    address: '台北市大安區信義路三段 88 號',
  },
  {
    id: 'c2',
    name: '遠山科技',
    industry: '資訊科技',
    owner: '陳柏宇',
    createdAt: '2026-09-19',
    address: '新竹市東區光復路一段 120 號',
  },
  {
    id: 'c3',
    name: '日光生活',
    industry: '零售電商',
    owner: '林雅婷',
    createdAt: '2026-09-18',
    address: '台中市西區公益路 66 號',
  },
  {
    id: 'c4',
    name: '森嶼品牌',
    industry: '品牌顧問',
    owner: '王怡安',
    createdAt: '2026-09-17',
    address: '台北市松山區民生東路四段 25 號',
  },
  {
    id: 'c5',
    name: '方舟物流',
    industry: '物流運輸',
    owner: '陳柏宇',
    createdAt: '2026-09-16',
    address: '桃園市桃園區中正路 300 號',
  },
];

// Deterministic demo records keep IDs and relationships stable across refreshes.
const industries = ['設計服務', '資訊科技', '零售電商', '品牌顧問', '物流運輸', '餐飲服務', '教育培訓', '製造業'];
const owners = ['林雅婷', '陳柏宇', '王怡安', '李冠廷', '吳佳蓉'];
const companyNames = ['青禾', '遠山', '日光', '森嶼', '方舟', '星河', '沐光', '雲川', '禾田', '新境'];
const locations = [
  '台北市大安區信義路',
  '新竹市東區光復路',
  '台中市西區公益路',
  '桃園市桃園區中正路',
  '高雄市苓雅區四維路',
  '台南市東區東門路',
];
for (let number = 6; number <= 150; number++) {
  const index = number - 1;
  const suffix = String(number).padStart(3, '0');
  const createdAt = new Date(Date.UTC(2026, 8, 20 - index)).toISOString().slice(0, 10);
  const customerId = `c${number}`;

  customers.push({
    id: customerId,
    name: `${companyNames[index % companyNames.length]}${industries[index % industries.length]} ${suffix}`,
    industry: industries[index % industries.length],
    owner: owners[index % owners.length],
    createdAt,
    address: `${locations[index % locations.length]} ${number} 號`,
  });
}
// In-memory preview repository. Refreshing restores the sample data.
let customerSnapshot = customers;
const listeners = new Set<() => void>();
export const customerRepository = {
  getSnapshot: () => customerSnapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  create(customer: Omit<Customer, 'id'>) {
    const record = { ...customer, id: `c-${crypto.randomUUID()}` };
    customerSnapshot = [record, ...customerSnapshot];
    listeners.forEach((listener) => listener());
    return record;
  },
  removeMany(ids: string[]) {
    const selected = new Set(ids);
    const next = customerSnapshot.filter(record => !selected.has(record.id));
    if (next.length === customerSnapshot.length) return;
    customerSnapshot = next;
    listeners.forEach(listener => listener());
  },
  update(customer: Customer) {
    customerSnapshot = customerSnapshot.map((item) => (item.id === customer.id ? { ...customer } : item));
    listeners.forEach((listener) => listener());
  },
};

