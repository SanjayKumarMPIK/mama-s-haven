import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  basic: z.object({
    fullName: z.string().min(2, "Full name is required"),
    age: z.string().min(1, "Age is required"),
    dob: z.string().min(1, "Date of birth is required"),
    contact: z.string().min(5, "Email or phone is required"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Blood group is required" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  location: z.object({
    region: z.enum(["north", "south", "east", "west"], { message: "Region is required" }),
  }),
  health: z.object({
    lastPeriodDate: z.string().optional(),
    cycleLength: z.string().optional(),
    haemoglobin: z.string().optional(),
    dietType: z.enum(["veg", "non-veg", "mixed"], { message: "Diet type is required" }),
    knownConditions: z.string().optional(),
    medicalConditions: z.array(z.string()).optional(),
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
  const [contactVerified, setContactVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      basic: { fullName: "", age: "", dob: "", contact: "", bloodGroup: "O+", password: "", confirmPassword: "" },
      location: { region: "north" },
      health: { lastPeriodDate: "", cycleLength: "", haemoglobin: "", dietType: "mixed", knownConditions: "", medicalConditions: [] },
      consent: { terms: false, healthData: false }
    },
    mode: "onChange",
  });

  const { formState: { errors }, trigger } = form;
  const dob = form.watch("basic.dob");

  useEffect(() => {
    if (!dob) return;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return;
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) computedAge--;
    form.setValue("basic.age", computedAge > 0 ? String(computedAge) : "", { shouldValidate: true });
  }, [dob, form]);

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger("basic");
    if (currentStep === 2) isValid = await trigger("location");
    if (currentStep === 3) isValid = await trigger("health");

    if (isValid && currentStep === 1 && !contactVerified) {
      toast.error("Please verify your email/phone before continuing.");
      return;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegistrationData) => {
    setIsLoading(true);
    const contact = data.basic.contact.trim();
    const isPhone = /^[0-9]{10}$/.test(contact);
    const mappedData = {
      ...data,
      basic: {
        ...data.basic,
        mobile: isPhone ? contact : "",
        email: isPhone ? "" : contact.toLowerCase(),
      },
      health: {
        ...data.health,
        lifeStage: "puberty",
      },
    };
    const success = await register(mappedData);
    if (success) {
      setShowSuccess(true);
      // Auto-redirect after showing success
      setTimeout(() => navigate("/profile?setup=true"), 3500);
    }
    setIsLoading(false);
  };

  // Helper for error casting
  const getErrorFields = (stepName: keyof typeof errors) => errors[stepName] as Record<string, any>;

  const contactValue = form.watch("basic.contact");
  const sendVerification = () => {
    if (!contactValue || contactValue.length < 5) {
      toast.error("Enter a valid email or 10-digit phone first.");
      return;
    }
    setVerificationSent(true);
    setContactVerified(false);
    toast.success("Verification sent. Use 123456 for demo verification.");
  };

  const verifyContact = () => {
    if (verificationCode.trim() !== "123456") {
      toast.error("Invalid verification code.");
      return;
    }
    setContactVerified(true);
    toast.success("Contact verified successfully.");
  };

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
              Redirecting to your profile setup…
            </p>
            <button 
              onClick={() => navigate("/profile?setup=true")} 
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Go to Profile Setup now →
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
                          <Input id="basic.age" readOnly className="h-12 bg-slate-100 border-slate-200 cursor-not-allowed" {...form.register("basic.age")} />
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
                        <Label htmlFor="basic.contact" className="text-slate-700 font-medium">Email / Phone <span className="text-red-500">*</span></Label>
                        <div className="flex gap-2">
                          <Input id="basic.contact" placeholder="email@example.com or 9876543210" className="h-12 bg-slate-50 border-slate-200" {...form.register("basic.contact")} />
                          <Button type="button" variant="outline" className="h-12" onClick={sendVerification}>Verify</Button>
                        </div>
                        {getErrorFields('basic')?.contact && <p className="text-red-500 text-sm">{getErrorFields('basic').contact.message}</p>}
                        {verificationSent && (
                          <div className="flex gap-2">
                            <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Enter code" className="h-10 bg-slate-50 border-slate-200" />
                            <Button type="button" variant="outline" className="h-10" onClick={verifyContact}>Confirm</Button>
                          </div>
                        )}
                        <p className={cn("text-xs", contactVerified ? "text-emerald-600" : "text-slate-500")}>
                          {contactVerified ? "Verified" : "Verification required before next step"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="basic.bloodGroup" className="text-slate-700 font-medium">Blood Group <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(v) => form.setValue("basic.bloodGroup", v as any)} defaultValue={form.getValues("basic.bloodGroup")}>
                        <SelectTrigger id="blood-trigger" className="h-12 bg-slate-50 border-slate-200 focus:ring-primary shadow-sm">
                          <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <MapPin className="text-primary w-6 h-6" /> Region
                    </h2>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location.region" className="text-slate-700 font-medium">Region <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(v) => form.setValue("location.region", v as any)} defaultValue={form.getValues("location.region")}>
                        <SelectTrigger id="region-trigger" className="h-12 bg-slate-50 border-slate-200 focus:ring-primary shadow-sm">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north">North India</SelectItem>
                          <SelectItem value="south">South India</SelectItem>
                          <SelectItem value="east">East India</SelectItem>
                          <SelectItem value="west">West India</SelectItem>
                        </SelectContent>
                      </Select>
                      {getErrorFields('location')?.region && <p className="text-red-500 text-sm">{getErrorFields('location').region.message}</p>}
                      <p className="text-xs text-slate-500">Used for food, lifestyle, and climate-based personalized suggestions.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Health Profile */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                      <HeartPulse className="text-primary w-6 h-6" /> Health Profile
                    </h2>
                    

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
                        <Label htmlFor="health.dietType" className="text-slate-700 font-medium">Diet Type <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => form.setValue("health.dietType", v as any)} defaultValue={form.getValues("health.dietType")}>
                          <SelectTrigger id="diet-type-trigger" className="h-12 bg-slate-50 border-slate-200 focus:ring-primary shadow-sm">
                            <SelectValue placeholder="Select Diet Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="veg">Veg</SelectItem>
                            <SelectItem value="non-veg">Non-veg</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        {getErrorFields('health')?.dietType && <p className="text-red-500 text-sm">{getErrorFields('health').dietType.message}</p>}
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
