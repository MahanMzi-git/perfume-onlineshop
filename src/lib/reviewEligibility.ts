import { demoOrders } from '../data/demoOrders';
export interface ReviewSession { showDemoOrders: boolean; cancelled: string[] }
// Frontend fixtures only. Real eligibility must be authorized from paid purchases on the server.
export function canReviewDemoProduct(session: ReviewSession, productId: string) {
 return session.showDemoOrders && demoOrders.some(order => order.productId === productId && order.stage === 'delivered' && !session.cancelled.includes(order.id));
}
export function validReviewDraft(score: number, text: string) {
 return Number.isInteger(score) && score >= 1 && score <= 5 && text.trim().length >= 10 && text.trim().length <= 500;
}
