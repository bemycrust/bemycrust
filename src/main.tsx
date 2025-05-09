
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById("root")!).render(<App />);
});
