import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, User, 
  MapPin, HeartPulse, CheckSquare, Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const registerSchema = z.object({
  basic: z.object({
    fullName: z.string().min(2, "Full name is required"),
    age: z.string().min(1, "Age is required"),
    dob: z.string().min(1, "Date of birth is required"),
    mobile: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  location: z.object({
    state: z.string().min(2, "State is required"),
    district: z.string().min(2, "District is required"),
    village: z.string().min(2, "Village/City is required"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Enter a valid 6-digit pincode"),
  }),
  health: z.object({
    lifeStage: z.string().min(1, "Please select an option"),
    expectedDueDate: z.string().optional(),
    trimester: z.string().optional(),
    lastPeriodDate: z.string().optional(),
    cycleLength: z.string().optional(),
    haemoglobin: z.string().optional(),
    knownConditions: z.string().optional(),
  }),
  consent: z.object({
    terms: z.boolean().refine(v => v === true, "You must agree to the Terms & Conditions"),
    healthData: z.boolean().refine(v => v === true, "You must consent to storing health data"),
  }),
});

type RegistrationData = z.infer<typeof registerSchema>;

const STEPS = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Health Profile", icon: HeartPulse },
  { id: 4, title: "Consent", icon: CheckSquare },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      basic: { fullName: "", age: "", dob: "", mobile: "", email: "", password: "", confirmPassword: "" },
      location: { state: "", district: "", village: "", pincode: "" },
      health: { lifeStage: "", expectedDueDate: "", trimester: "", lastPeriodDate: "", cycleLength: "", haemoglobin: "", knownConditions: "" },
      consent: { terms: false, healthData: false }
    },
    mode: "onChange",
  });

  const { formState: { errors }, trigger, watch } = form;
  const watchLifeStage = watch("health.lifeStage");

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger("basic");
    if (currentStep === 2) isValid = await trigger("location");
    if (currentStep === 3) isValid = await trigger("health");

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegistrationData) => {
    setIsLoading(true);
    const success = await register(data);
    if (success) {
      setShowSuccess(true);
      // Auto-redirect after showing success
      setTimeout(() => navigate("/wellness"), 3500);
    }
    setIsLoading(false);
  };

  // Helper for error casting
  const getErrorFields = (stepName: keyof typeof errors) => errors[stepName] as Record<string, any>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center bg-fixed font-sans">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
      
      {/* ─── Success Screen ─── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-500">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Profile Created Successfully! 🎉
            </h2>
            <p className="mt-4 text-lg text-emerald-700 font-semibold">
              Your profile has been securely saved on this device
            </p>
            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Data is stored locally on your device for privacy
              </p>
            </div>
            <p className="mt-6 text-sm text-slate-500 animate-pulse">
              Redirecting to your personalized dashboard…
            </p>
            <button 
              onClick={() => navigate("/wellness")} 
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Go to Dashboard now →
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-3xl mx-auto z-10 w-full pt-8">
        <div className="mb-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center p-3 mb-4 shadow-sm border border-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create your Health Profile</h1>
          <p className="mt-2 text-lg text-slate-600">Join SwasthyaSakhi for personalized maternal guidance</p>
        </div>

        {/* Improved Progress bar with titles */}
        <div className="mb-10 w-full hidden sm:block">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary/80 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
            
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary text-white border-primary shadow-primary/30' 
                    : 'bg-white text-slate-400 border-slate-200'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${currentStep === step.id ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span className={`absolute -bottom-7 w-24 text-center text-xs font-semibold ${
                  currentStep >= step.id ? 'text-primary' : 'text-slate-500'
                }`}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-8 sm:p-10">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                      <User className="text-primary w-6 h-6" /> Personal Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="basic.fullName" className="text-slate-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
                        <Input id="basic.fullName" placeholder="Anjali Sharma" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.fullName")} />
                        {getErrorFields('basic')?.fullName && <p className="text-red-500 text-sm">{getErrorFields('basic').fullName.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4 space-y-0">
                         <div className="space-y-2">
                          <Label htmlFor="basic.age" className="text-slate-700 font-medium">Age <span className="text-red-500">*</span></Label>
                          <Input id="basic.age" type="number" placeholder="28" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.age")} />
                          {getErrorFields('basic')?.age && <p className="text-red-500 text-sm">{getErrorFields('basic').age.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basic.dob" className="text-slate-700 font-medium">Date of Birth <span className="text-red-500">*</span></Label>
                          <Input id="basic.dob" type="date" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.dob")} />
                          {getErrorFields('basic')?.dob && <p className="text-red-500 text-sm">{getErrorFields('basic').dob.message}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="basic.mobile" className="text-slate-700 font-medium">Mobile Number <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+91</span>
                          <Input id="basic.mobile" placeholder="10-digit number" className="pl-12 h-12 bg-slate-50 border-slate-200" {...form.register("basic.mobile")} />
                        </div>
                        {getErrorFields('basic')?.mobile && <p className="text-red-500 text-sm">{getErrorFields('basic').mobile.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basic.email" className="text-slate-700 font-medium">Email ID (Optional)</Label>
                        <Input id="basic.email" type="email" placeholder="email@example.com" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.email")} />
                        {getErrorFields('basic')?.email && <p className="text-red-500 text-sm">{getErrorFields('basic').email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="basic.password" className="text-slate-700 font-medium">Password <span className="text-red-500">*</span></Label>
                        <Input id="basic.password" type="password" placeholder="••••••••" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.password")} />
                        {getErrorFields('basic')?.password && <p className="text-red-500 text-sm">{getErrorFields('basic').password.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basic.confirmPassword" className="text-slate-700 font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                        <Input id="basic.confirmPassword" type="password" placeholder="••••••••" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.confirmPassword")} />
                        {getErrorFields('basic')?.confirmPassword && <p className="text-red-500 text-sm">{getErrorFields('basic').confirmPassword.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                      <MapPin className="text-primary w-6 h-6" /> Location Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="location.state" className="text-slate-700 font-medium">State <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => form.setValue("location.state", v)} defaultValue={form.getValues("location.state")}>
                          <SelectTrigger id="state-trigger" className="h-12 bg-slate-50 border-slate-200 focus:ring-primary shadow-sm">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="uttarpradesh">Uttar Pradesh</SelectItem>
                          </SelectContent>
                        </Select>
                        {getErrorFields('location')?.state && <p className="text-red-500 text-sm">{getErrorFields('location').state.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location.district" className="text-slate-700 font-medium">District <span className="text-red-500">*</span></Label>
                        <Input id="location.district" placeholder="District name" className="h-12 bg-slate-50 border-slate-200" {...form.register("location.district")} />
                        {getErrorFields('location')?.district && <p className="text-red-500 text-sm">{getErrorFields('location').district.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="location.village" className="text-slate-700 font-medium">Village/City <span className="text-red-500">*</span></Label>
                        <Input id="location.village" placeholder="Town, village or city" className="h-12 bg-slate-50 border-slate-200" {...form.register("location.village")} />
                        {getErrorFields('location')?.village && <p className="text-red-500 text-sm">{getErrorFields('location').village.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location.pincode" className="text-slate-700 font-medium">Pincode <span className="text-red-500">*</span></Label>
                        <Input id="location.pincode" placeholder="6-digit pincode" maxLength={6} className="h-12 bg-slate-50 border-slate-200 tracking-widest text-lg" {...form.register("location.pincode")} />
                        {getErrorFields('location')?.pincode && <p className="text-red-500 text-sm">{getErrorFields('location').pincode.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Health Profile */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                      <HeartPulse className="text-primary w-6 h-6" /> Health Profile
                    </h2>
                    
                    <div className="space-y-3 bg-primary/5 p-5 rounded-xl border border-primary/10 shadow-sm">
                      <Label className="text-lg text-slate-800 font-semibold mb-2 block">Current Life Stage <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(v) => form.setValue("health.lifeStage", v)} defaultValue={watchLifeStage}>
                        <SelectTrigger className="h-14 text-base bg-white border-primary/20 shadow-sm font-medium">
                          <SelectValue placeholder="Select your current stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="puberty" className="py-3">Adolescence / Puberty</SelectItem>
                          <SelectItem value="reproductive" className="py-3">Reproductive Age (Not Pregnant)</SelectItem>
                          <SelectItem value="pregnant" className="py-3 bg-rose-50 font-medium text-rose-700">Currently Pregnant</SelectItem>
                          <SelectItem value="postpartum" className="py-3">Postpartum (Recently delivered)</SelectItem>
                          <SelectItem value="menopause" className="py-3">Perimenopause / Menopause</SelectItem>
                        </SelectContent>
                      </Select>
                      {getErrorFields('health')?.lifeStage && <p className="text-red-500 text-sm">{getErrorFields('health').lifeStage.message}</p>}
                    </div>

                    {watchLifeStage === "pregnant" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-4 fade-in bg-rose-50/50 p-5 rounded-xl border border-rose-100">
                        <div className="space-y-2">
                          <Label htmlFor="health.expectedDueDate" className="text-slate-700 font-medium">Expected Due Date</Label>
                          <Input id="health.expectedDueDate" type="date" className="h-12 bg-white" {...form.register("health.expectedDueDate")} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="health.trimester" className="text-slate-700 font-medium">Current Trimester</Label>
                          <Select onValueChange={(v) => form.setValue("health.trimester", v)}>
                            <SelectTrigger className="h-12 bg-white">
                              <SelectValue placeholder="Select trimester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">First Trimester (1-3 months)</SelectItem>
                              <SelectItem value="2">Second Trimester (4-6 months)</SelectItem>
                              <SelectItem value="3">Third Trimester (7-9 months)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="health.lastPeriodDate" className="text-slate-700 font-medium">Last Period Date (LMP)</Label>
                        <Input id="health.lastPeriodDate" type="date" className="h-12 bg-slate-50 border-slate-200" {...form.register("health.lastPeriodDate")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="health.cycleLength" className="text-slate-700 font-medium">Average Cycle Length (Days)</Label>
                        <Input id="health.cycleLength" type="number" placeholder="e.g. 28" className="h-12 bg-slate-50 border-slate-200" {...form.register("health.cycleLength")} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="health.haemoglobin" className="text-slate-700 font-medium">Haemoglobin Level (if known)</Label>
                        <Input id="health.haemoglobin" type="number" step="0.1" placeholder="e.g. 11.5" className="h-12 bg-slate-50 border-slate-200" {...form.register("health.haemoglobin")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="health.knownConditions" className="text-slate-700 font-medium">Any known conditions?</Label>
                        <Input id="health.knownConditions" placeholder="e.g. PCOS, Thyroid, Anaemia" className="h-12 bg-slate-50 border-slate-200" {...form.register("health.knownConditions")} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Consent & Privacy */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                      <CheckSquare className="text-primary w-6 h-6" /> User Consent
                    </h2>
                    
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-6 shadow-sm">
                      <p className="text-sm text-amber-900 font-medium leading-relaxed">
                        <strong className="text-amber-950 font-bold block mb-1">Disclaimer:</strong> 
                        This platform provides guidance and awareness regarding women's health. 
                        It is NOT a medical diagnosis tool. Please always consult your doctor or nearest PHC for severe concerns.
                      </p>
                    </div>

                    <div className="space-y-5 px-1">
                      <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-white focus-within:ring-2 focus-within:ring-primary/20">
                        <Checkbox 
                          id="consent.terms" 
                          checked={form.watch("consent.terms")}
                          onCheckedChange={(c: boolean) => form.setValue("consent.terms", c, { shouldValidate: true })} 
                          className="mt-1 w-5 h-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300" 
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="consent.terms" className="text-sm font-semibold text-slate-800 cursor-pointer pt-1">
                            I agree to the Terms & Conditions
                          </Label>
                          {getErrorFields('consent')?.terms && <p className="text-red-500 text-xs mt-1">{getErrorFields('consent').terms.message}</p>}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-white focus-within:ring-2 focus-within:ring-primary/20">
                        <Checkbox 
                          id="consent.healthData" 
                          checked={form.watch("consent.healthData")}
                          onCheckedChange={(c: boolean) => form.setValue("consent.healthData", c, { shouldValidate: true })} 
                          className="mt-1 w-5 h-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="consent.healthData" className="text-sm font-semibold text-slate-800 cursor-pointer pt-1">
                            I provide explicit consent for storing my health data securely to enable personalized guidance
                          </Label>
                          <p className="text-xs text-slate-500 mt-1">Your data is encrypted and strictly private in adherence to government guidelines.</p>
                          {getErrorFields('consent')?.healthData && <p className="text-red-500 text-xs mt-1">{getErrorFields('consent').healthData.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Navigation Controls */}
              <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={handlePrev} className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                </div>
                
                {currentStep < 4 ? (
                  <Button type="button" onClick={handleNext} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all">
                    Next Step <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                    Complete Setup
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          <div className="bg-slate-50 px-8 py-5 text-center text-sm border-t border-slate-100">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Log in securely
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
