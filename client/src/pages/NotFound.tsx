import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
      {/* Big 404 */}
      <div className="mb-6">
        <span className="text-[120px] md:text-[160px] font-black leading-none tracking-tight">
          4<span className="text-brand-accent">0</span>4
        </span>
      </div>

      {/* Kicker badge */}
      <div className="inline-block bg-brand-accent text-brand-cream text-[11px] font-bold uppercase tracking-[3px] px-4 py-1.5 mb-6">
        Off The Map
      </div>

      {/* Title */}
      <h1 className="text-[clamp(24px,4vw,40px)] font-extrabold uppercase tracking-wide mb-4">
        You've Wandered Off Course
      </h1>

      {/* Description */}
      <p className="text-brand-muted text-[15px] max-w-[480px] mx-auto leading-relaxed mb-10">
        The page you're looking for has been lost to the ruins. Let's get you back to familiar territory.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <Link
          to="/"
          className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]"
        >
          Back To Home
        </Link>
        <Link
          to="/contact"
          className="inline-block border border-brand-border text-brand-text py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-card transition-all"
        >
          Contact Us
        </Link>
      </div>

      {/* Help text */}
      <p className="text-brand-muted text-[13px]">
        Need help? Email{' '}
        <a
          href="mailto:laracroft0710@outlook.com"
          className="text-brand-accent underline hover:no-underline"
        >
          laracroft0710@outlook.com
        </a>
      </p>
    </div>
  );
}
