import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

const AdminLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">AI-Solutions</h1>
          <p className="mt-2 text-sm text-slate-500">Admin Login</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default AdminLogin;
