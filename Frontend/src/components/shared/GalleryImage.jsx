const GalleryImage = ({ src, alt, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      aria-label={`Open ${alt}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square w-full rounded-xl object-cover transition-opacity group-hover:opacity-90"
        />
      ) : (
        <div className="aspect-square rounded-xl bg-slate-100 transition-opacity group-hover:opacity-90" />
      )}
    </button>
  );
};

export default GalleryImage;
