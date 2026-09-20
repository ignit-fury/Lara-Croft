import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

interface SizeGuideData {
  columns: string[];
  rows: string[][];
}

interface Props {
  categorySlug: string;
  onClose: () => void;
}

export default function SizeGuide({ categorySlug, onClose }: Props) {
  const [data, setData] = useState<SizeGuideData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/size-guide/${categorySlug}`)
      .then((res) => setData(res.data.data.sizeGuide))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-muted hover:text-brand-text">
          <X size={20} />
        </button>
        <h2 className="text-[18px] font-extrabold uppercase tracking-wide text-brand-text mb-4">Size Guide</h2>
        {loading ? (
          <p className="text-brand-muted text-[13px]">Loading...</p>
        ) : !data ? (
          <p className="text-brand-muted text-[13px]">No size guide available for this category.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-brand-border">
                  {data.columns.map((col, i) => (
                    <th key={i} className="py-2 pr-4 font-bold uppercase tracking-wide text-brand-text whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-brand-border last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 pr-4 text-brand-muted whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
