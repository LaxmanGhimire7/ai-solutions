import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MessageSquareQuote, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import TestimonialCard from '@/components/shared/TestimonialCard';
import { submitTestimonial } from '@/api/content';
import { testimonials as sampleTestimonials } from '@/data/siteData';
import { usePublicContent, mergePublishedWithSamples } from '@/hooks/usePublicContent';
import { adaptTestimonial } from '@/utils/contentAdapters';

const Testimonials = () => {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items: publishedTestimonials } = usePublicContent('testimonials', {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const testimonials = useMemo(
    () =>
      mergePublishedWithSamples(
        publishedTestimonials.map(adaptTestimonial),
        sampleTestimonials.map((item, index) => ({ ...item, id: `sample-${index}` })),
        (item) => item.id || `${item.name}-${item.quote}`
      ),
    [publishedTestimonials]
  );

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      await submitTestimonial({ ...values, rating });
      toast.success('Thank you. Your review is awaiting administrator approval.');
      reset();
      setRating(5);
    } catch (error) {
      toast.error(error.message || 'Unable to submit your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Customer experiences, shared honestly."
        description="Read published customer feedback or submit your own review for administrator approval."
        icon={MessageSquareQuote}
        highlights={['Verified moderation workflow', 'One-to-five star ratings', 'Published customer feedback']}
      />

      <section className="bg-black py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Published reviews"
            title="What customers say"
            description="The latest approved reviews appear first, followed by the existing project examples."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5ECE6] py-20 text-black md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase text-[#E95520]">Share feedback</p>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Review your experience</h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#625952]">
              Reviews are stored securely as drafts. An administrator checks each submission before it becomes visible publicly.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5 rounded-2xl border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:grid-cols-2 md:p-8"
          >
            <Input
              label="Your name *"
              error={errors.authorName?.message}
              {...register('authorName', { required: 'Name is required', maxLength: 100 })}
            />
            <Input
              label="Job title"
              {...register('authorTitle', { maxLength: 100 })}
            />
            <div className="md:col-span-2">
              <Input
                label="Company"
                {...register('authorCompany', { maxLength: 100 })}
              />
            </div>

            <div className="md:col-span-2">
              <span className="block text-sm font-medium text-slate-700">Rating *</span>
              <div className="mt-2 flex gap-2">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-lg p-1 text-slate-300 transition-colors hover:text-[#E95520] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
                      aria-label={`Rate ${value} out of 5`}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          value <= rating ? 'fill-[#E95520] text-[#E95520]' : ''
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="testimonial-quote" className="block text-sm font-medium text-slate-700">
                Your review *
              </label>
              <textarea
                id="testimonial-quote"
                rows="5"
                maxLength="1000"
                placeholder="Tell us about your experience"
                className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#E95520] focus:ring-2 focus:ring-[#E95520]/15 ${
                  errors.quote ? 'border-red-300' : 'border-slate-200'
                }`}
                {...register('quote', {
                  required: 'Review is required',
                  minLength: { value: 10, message: 'Review must contain at least 10 characters' },
                  maxLength: 1000,
                })}
              />
              {errors.quote && <p className="mt-1.5 text-sm text-red-500">{errors.quote.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Button type="submit" isLoading={isSubmitting}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
