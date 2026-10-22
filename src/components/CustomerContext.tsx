import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import type { FieldValues } from '../lib/customerForms';
export interface DemoAddress { id: string; values: FieldValues }
export interface CabinetEntry { owned?: boolean; tested?: boolean; opinion?: 'liked' | 'disliked' }
export interface CustomerReview { productId: string; score: number; text: string }
interface CustomerState { profile: FieldValues; addresses: DemoAddress[]; cabinet: Record<string, CabinetEntry>; preferences: string[]; reviews: CustomerReview[]; notifications: string[]; showDemoOrders: boolean; cancelled: string[]; requests: { subject: string; message: string }[]; checkout: { contact: FieldValues; address: FieldValues; shipping: string } }
const initial: CustomerState = { profile: {}, addresses: [], cabinet: {}, preferences: [], reviews: [], notifications: [], showDemoOrders: false, cancelled: [], requests: [], checkout: { contact: {}, address: {}, shipping: 'standard' } };
const Context = createContext<{ customer: CustomerState; setCustomer: Dispatch<SetStateAction<CustomerState>> } | null>(null);
export function CustomerProvider({ children }: { children: ReactNode }) { const [customer, setCustomer] = useState(initial); return <Context.Provider value={{ customer, setCustomer }}>{children}</Context.Provider>; }
export function useCustomer() { const value = useContext(Context); if (!value) throw new Error('CustomerProvider is required'); return value; }
