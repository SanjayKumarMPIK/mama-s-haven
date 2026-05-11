import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useRole } from '@/hooks/useRole';
import { useDoctorAuth } from '@/modules/doctor/hooks/useDoctorAuth';

const loginSchema = z.object({
  emailOrMobile: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loginWithPassword } = useAuth();
  const { loginAsDoctor } = useDoctorAuth();
  const { role } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const isDoctor = role === 'doctor';

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrMobile: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setIsLoading(true);

    if (isDoctor) {
      // Doctor flow — validates against doctor_profiles table
      const success = await loginAsDoctor(values.emailOrMobile, values.password);
      if (success) navigate('/doctor/dashboard');
    } else {
      // Regular user flow
      const success = await loginWithPassword(values.emailOrMobile, values.password);
      if (success) navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center flex-col items-center">
          <div className="h-14 w-14 rounded-full flex items-center justify-center p-3 mb-4 shadow-sm border">
            {isDoctor ? (
              <div className="h-full w-full flex items-center justify-center bg-teal-100 rounded-full border border-teal-200">
                <Stethoscope className="w-7 h-7 text-teal-700" />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/20 rounded-full border border-primary/30">
                <ShieldCheck className="w-full h-full text-primary" />
              </div>
            )}
          </div>

          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            {isDoctor ? 'Doctor Portal Login' : 'Welcome to SwasthyaSakhi'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {isDoctor
              ? 'Sign in to access your patient dashboard'
              : 'Sign in to your maternal health dashboard'}
          </p>
        </div>

        <div className="mt-8 bg-white/90 backdrop-blur pb-8 pt-6 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          {isDoctor && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
              <Stethoscope className="h-4 w-4 text-teal-600 shrink-0" />
              <p className="text-xs text-teal-700 font-medium">
                Doctor accounts are verified against the PHC registry.
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="emailOrMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          placeholder={isDoctor ? 'doctor@phc.in' : 'Enter your registered email'}
                          className="pl-10 h-12 rounded-xl"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-slate-700">Password</FormLabel>
                      <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80">
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 h-12 rounded-xl font-medium tracking-wider"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={`w-full h-12 text-base font-semibold rounded-xl shadow-lg ${
                  isDoctor
                    ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
                    : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isDoctor ? 'Sign In to Doctor Portal' : 'Sign In Securely'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          {!isDoctor && (
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500">Don't have an account? </span>
              <Link to="/register" className="font-bold text-primary hover:text-primary/80 hover:underline">
                Create an account now
              </Link>
            </div>
          )}

          <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />
              {isDoctor
                ? 'Doctor sessions are secured via Supabase Auth'
                : 'Data is stored locally on your device for privacy'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
