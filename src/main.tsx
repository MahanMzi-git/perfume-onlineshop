import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CustomerProvider } from './components/CustomerContext';
import './styles/tokens.css';
import './styles/global.css';
import './styles/mobile-island.css';
createRoot(document.getElementById('root')!).render(<StrictMode><CustomerProvider><App /></CustomerProvider></StrictMode>);
