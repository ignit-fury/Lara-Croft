import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

interface ReviewFormProps {
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ onReviewSubmitted }: ReviewFormProps) {
  const { slug } = useParams();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!comment.trim()) { toast.error('Comment is required'); return; }
    if (submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/products/${slug}/reviews`, { rating, title: title.trim(), comment: comment.trim() });
      toast.success('Review submitted!');
      setRating(0);
      setTitle('');
      setComment('');
      onReviewSubmitted();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text block mb-2">Rating</label>
        <StarRating value={rating} onChange={setRating} size={24} />
      </div>
      <div>
        <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text block mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title"
          className="w-full border border-brand-border bg-brand-card px-3 py-2 text-[14px] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent"
        />
      </div>
      <div>
        <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text block mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review..."
          rows={4}
          className="w-full border border-brand-border bg-brand-card px-3 py-2 text-[14px] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand-accent text-brand-cream px-6 py-2.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
