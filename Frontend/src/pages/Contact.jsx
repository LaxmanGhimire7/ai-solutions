import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Clock3, Mail, MapPin, MessageSquareText, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHero from '@/components/shared/PageHero';
import { submitInquiry } from '@/api/inquiries';

const contactItems = [
  { icon: Mail, label: 'Email', value: 'info@ai-solutions.com' },
  { icon: Phone, label: 'Phone', value: '+44 1234 567890' },
  { icon: MapPin, label: 'Location', value: 'London, United Kingdom' },
  { icon: Clock3, label: 'Response time', value: 'Usually within 1-2 business days' },
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      await submitInquiry(values);
      toast.success('Inquiry submitted successfully. Our team will review it shortly.');
      reset();
    } catch (error) {
      toast.error(error.message || 'Unable to submit inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you need. We will take it from there."
        description="Share your project details using the structured form and the team will review your inquiry with the right context."
        icon={MessageSquareText}
        highlights={['Clear requirements form', 'Secure inquiry storage', 'Direct admin notification']}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.42fr] lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.07)] md:p-10">
            <div className="border-b border-slate-100 pb-7">
              <p className="text-xs font-semibold uppercase text-indigo-600">Project inquiry</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Send your requirements</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Fields marked with an asterisk are required so the team can understand and respond to your request.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5 md:grid-cols-2">
              <Input
                label="Name *"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required', maxLength: 100 })}
              />
              <Input
                label="Email *"
                type="email"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' },
                })}
              />
              <Input
                label="Phone *"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone is required', maxLength: 30 })}
              />
              <Input
                label="Company *"
                error={errors.companyName?.message}
                {...register('companyName', { required: 'Company is required', maxLength: 150 })}
              />
              <Input
                label="Country *"
                error={errors.country?.message}
                {...register('country', { required: 'Country is required', maxLength: 100 })}
              />
              <Input
                label="Job Title *"
                error={errors.jobTitle?.message}
                {...register('jobTitle', { required: 'Job title is required', maxLength: 150 })}
              />
              <div className="md:col-span-2">
                <label htmlFor="jobDetails" className="block text-sm font-medium text-slate-700">
                  Job Details *
                </label>
                <textarea
                  id="jobDetails"
                  rows="7"
                  placeholder="Describe the problem, workflow, or system you would like to discuss..."
                  className={`mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-slate-100-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.jobDetails ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : ''
                  }`}
                  {...register('jobDetails', {
                    required: 'Job details are required',
                    maxLength: { value: 2000, message: 'Job details cannot exceed 2000 characters' },
                  })}
                />
                {errors.jobDetails && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.jobDetails.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-4 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  Your information is used only to respond to this inquiry.
                </p>
                <Button type="submit" size="lg" isLoading={isSubmitting}>
                  Submit Inquiry
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase text-indigo-600">Contact information</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Speak with the team</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Use the form for project enquiries or contact us directly using the details below.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:p-8">
              <div className="space-y-6">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-indigo-600">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">{item.label}</p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Contact;
