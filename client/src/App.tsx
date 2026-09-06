import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<div className="text-2xl text-brand-brown p-8">Prima Facie — LARA CROFT</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
