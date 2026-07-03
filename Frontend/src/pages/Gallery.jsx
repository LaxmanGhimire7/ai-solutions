import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import GalleryImage from '@/components/shared/GalleryImage';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import { gallery as sampleGallery, getFallbackImage } from '@/data/siteData';
import { usePublicContent, mergePublishedWithSamples } from '@/hooks/usePublicContent';
import { adaptGalleryItem } from '@/utils/contentAdapters';

const Gallery = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { items: publishedGallery } = usePublicContent('gallery', {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const gallery = useMemo(
    () =>
      mergePublishedWithSamples(
        publishedGallery.map(adaptGalleryItem),
        sampleGallery,
        (image) => image.id || image.alt
      ),
    [publishedGallery]
  );
  const activeImage = activeIndex !== null ? gallery[activeIndex] : null;

  const showPrevious = () => {
    setActiveIndex((index) => (index === 0 ? gallery.length - 1 : index - 1));
  };

  const showNext = () => {
    setActiveIndex((index) => (index === gallery.length - 1 ? 0 : index + 1));
  };

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="A visual record of workshops, events, and project activity."
        description="Browse company moments and event images in a clean, responsive gallery experience."
        icon={Images}
        highlights={['Responsive image grid', 'Accessible image lightbox', 'Event and activity archive']}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Photo archive"
            title="Inside AI-Solutions"
            description="Select any image to open the larger lightbox view and move through the gallery."
          />

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((image, index) => (
              <div key={image.id} className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}>
                <GalleryImage
                  src={image.src}
                  alt={image.alt}
                  onClick={() => setActiveIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal isOpen={Boolean(activeImage)} onClose={() => setActiveIndex(null)} title={activeImage?.alt}>
        {activeImage && (
          <div className="space-y-5">
            {activeImage.src || getFallbackImage('gallery', activeIndex) ? (
              <img
                src={activeImage.src || getFallbackImage('gallery', activeIndex)}
                alt={activeImage.alt}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="absolute -left-14 top-12 h-32 w-56 rounded-2xl border border-indigo-100 bg-indigo-50" />
                <div className="absolute -right-12 bottom-12 h-28 w-52 rounded-2xl border border-slate-200 bg-white" />
                <Images className="relative h-10 w-10 text-indigo-500" aria-hidden="true" />
              </div>
            )}
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
        )}
      </Modal>
    </>
  );
};

export default Gallery;
