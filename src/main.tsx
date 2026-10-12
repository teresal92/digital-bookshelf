import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/styles.css';
import './styles/global.css';
import { Library } from './components/Library';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Library />
  </StrictMode>,
);
