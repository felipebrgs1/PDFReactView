import { createRoot } from 'react-dom/client';

import PDFViewer from './components/PDFViewer.js';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

createRoot(root).render(<PDFViewer />);
