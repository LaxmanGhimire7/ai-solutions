import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { submitInquiry } from '@/api/inquiries';

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
      toast.success('Inquiry submitted successfully');
      reset();
    } catch (error) {
      toast.error(error.message || 'Unable to submit inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.42fr] lg:px-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">Contact Us</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600">
            Share your project details and the team will review your inquiry.
          </p>

          <Card className="mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
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
                  rows="6"
                  className={`mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
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
              <div className="md:col-span-2">
                <Button type="submit" size="lg" isLoading={isSubmitting}>
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="lg:pt-44">
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Contact Information</h2>
            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <span className="text-sm text-slate-600">info@ai-solutions.com</span>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <span className="text-sm text-slate-600">+44 1234 567890</span>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <span className="text-sm text-slate-600">London, United Kingdom</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default Contact;
