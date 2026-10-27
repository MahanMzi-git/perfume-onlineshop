import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CustomerProvider } from './components/CustomerContext';
import './styles/tailwind.css';
const root = document.getElementById('root')!;
root.dataset.fieldStyle = 'capsule-sage';
createRoot(root).render(<StrictMode><CustomerProvider><App /></CustomerProvider></StrictMode>);
