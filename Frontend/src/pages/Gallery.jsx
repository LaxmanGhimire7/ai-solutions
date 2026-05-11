import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import GalleryImage from '@/components/shared/GalleryImage';
import { gallery } from '@/data/siteData';

const Gallery = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const activeImage = activeIndex !== null ? gallery[activeIndex] : null;

  const showPrevious = () => {
    setActiveIndex((index) => (index === 0 ? gallery.length - 1 : index - 1));
  };

  const showNext = () => {
    setActiveIndex((index) => (index === gallery.length - 1 ? 0 : index + 1));
  };

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="accent">Gallery</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">Photo Gallery</h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600">
            Event and activity images arranged for quick browsing.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map((image, index) => (
            <GalleryImage
              key={image.id}
              src={image.src}
              alt={image.alt}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={Boolean(activeImage)} onClose={() => setActiveIndex(null)} title={activeImage?.alt}>
        <div className="space-y-5">
          <div className="aspect-square rounded-xl bg-slate-100" aria-hidden="true" />
          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={showPrevious} aria-label="Previous image">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <Button variant="secondary" onClick={showNext} aria-label="Next image">
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Gallery;
