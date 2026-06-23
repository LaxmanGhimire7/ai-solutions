import { Expand, Image as ImageIcon } from 'lucide-react';

const GalleryImage = ({ src, alt, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.05)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      aria-label={`Open ${alt}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
          <div className="absolute -left-10 top-8 h-24 w-40 rounded-xl border border-indigo-100 bg-indigo-50" />
          <div className="absolute -right-10 bottom-8 h-24 w-40 rounded-xl border border-slate-200 bg-white" />
          <div className="relative flex flex-col items-center text-slate-400">
            <ImageIcon className="h-7 w-7 text-[#E95520]" aria-hidden="true" />
            <span className="mt-3 text-xs font-semibold uppercase">Event image</span>
          </div>
        </div>
      )}
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        <Expand className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
};

export default GalleryImage;
