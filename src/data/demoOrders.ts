/** Deliberately fictional fixtures, never created by checkout or tied to customer data. */
import { products } from './products';
import type { FulfillmentStage } from '../components/OrderProgress';
export const demoOrders = [
  { id: 'DEMO-1001', date: '۱۴۰۵/۰۱/۱۲', stage: 'packing' as FulfillmentStage, status: 'در حال بسته‌بندی · نمایشی', productId: products[0].id, volume: '۵۰ میلی‌لیتر', quantity: 1, total: 4800000, cancellable: true },
  { id: 'DEMO-1002', date: '۱۴۰۵/۰۱/۰۳', stage: 'delivered' as FulfillmentStage, status: 'تحویل‌شده · نمایشی', productId: products[4].id, volume: '۵۰ میلی‌لیتر', quantity: 1, total: 5400000, cancellable: false },
];
