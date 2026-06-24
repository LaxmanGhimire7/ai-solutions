import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="public-theme site-grid relative min-h-screen overflow-hidden bg-[#020706] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[4%] top-[10%] h-72 w-72 rounded-full bg-[#E95520]/12 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[6%] right-[4%] h-80 w-80 rounded-full bg-[#5B2412]/20 blur-[140px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-white/10 bg-[#06100e]/90 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
          <section
            className="relative hidden min-h-[690px] overflow-hidden border-r border-white/10 bg-cover bg-[70%_center] p-10 lg:flex lg:flex-col lg:justify-between"
            style={{ backgroundImage: "url('/images/orange-platform-hero.png')" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,7,6,0.98)_0%,rgba(2,7,6,0.88)_46%,rgba(2,7,6,0.35)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020706] via-transparent to-transparent" />

            <div className="relative">
              <Link to="/" className="inline-flex items-center gap-3 text-lg font-semibold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E95520] text-sm text-white">AI</span>
                AI-Solutions
              </Link>
              <h1 className="mt-16 text-4xl font-semibold text-white">
                Manage client communication <span className="text-gradient">with clarity.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">
                Review inquiries, monitor trends, publish company content, and manage support from one secure dashboard.
              </p>
            </div>

            <div className="relative space-y-3">
              {[
                { icon: BarChart3, text: 'Real inquiry analytics' },
                { icon: CheckCircle2, text: 'Content publishing workflows' },
                { icon: ShieldCheck, text: 'JWT-protected admin access' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
                    <Icon className="h-5 w-5 text-[#F37A49]" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-200">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <main className="bg-[#06100e]/90 p-6 sm:p-10 lg:p-14">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-[#F37A49]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to website
            </Link>

            <div className="mx-auto mt-10 max-w-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E95520] text-white shadow-[0_12px_30px_rgba(233,85,32,0.2)]">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-white">Admin sign in</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Enter your administrator credentials to continue.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200">Email address</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="admin@ai-solutions.com"
                      className={`login-field h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-[#E95520]/20 ${
                        errors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200">Password</label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password', { required: 'Password is required' })}
                      placeholder="Enter your password"
                      className={`login-field h-12 w-full rounded-xl border bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-[#E95520]/20 ${
                        errors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#E95520] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                  Sign In
                </Button>
              </form>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F37A49]" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-slate-500">
                  This area is restricted to authorised administrators. Sessions are protected using JWT authentication.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
