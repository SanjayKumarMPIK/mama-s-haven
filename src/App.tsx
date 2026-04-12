import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { PhaseProvider } from "@/hooks/usePhase";
import { PregnancyProfileProvider } from "@/hooks/usePregnancyProfile";
import { AuthProvider } from "@/hooks/useAuth";
import { HealthLogProvider } from "@/hooks/useHealthLog";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import AuthGate from "@/components/AuthGate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Tools from "./pages/Tools";
import Shopping from "./pages/Shopping";
import StressRelief from "./pages/StressRelief";
import Articles from "./pages/Articles";
import Postpartum from "./pages/Postpartum";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Assistant from "./pages/Assistant";
import WeeklyGuide from "./pages/WeeklyGuide";
import NutritionGuide from "./pages/NutritionGuide";
import SymptomChecker from "./pages/SymptomChecker";
import EmergencyGuidance from "./pages/EmergencyGuidance";
import WellnessDashboard from "./pages/WellnessDashboard";
import Puberty from "./pages/Puberty";
import Maternity from "./pages/Maternity";
import FamilyPlanning from "./pages/FamilyPlanning";
import PhcNearby from "./pages/PhcNearby";
import VaccineTracker from "./pages/VaccineTracker";
import NotFound from "./pages/NotFound";
import PregnancyDashboard from "./pages/PregnancyDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HealthLog from "./pages/HealthLog";
import Calendar from "./pages/Calendar";
import WeeklyBodyReport from "./pages/WeeklyBodyReport";
import Profile from "./pages/Profile";
import MissedLogReminder from "@/components/MissedLogReminder";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PhaseProvider>
        <PregnancyProfileProvider>
          <AuthProvider>
            <HealthLogProvider>
              <OnboardingProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AuthGate>
                      <Navbar />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/tools" element={<Tools />} />
                        <Route path="/shopping" element={<Shopping />} />
                        <Route path="/stress-relief" element={<StressRelief />} />
                        <Route path="/articles" element={<Articles />} />
                        <Route path="/postpartum" element={<Postpartum />} />
                        <Route path="/assistant" element={<Assistant />} />
                        <Route path="/weekly-guide" element={<WeeklyGuide />} />
                        <Route path="/nutrition" element={<NutritionGuide />} />
                        <Route path="/symptom-checker" element={<SymptomChecker />} />
                        <Route path="/emergency" element={<EmergencyGuidance />} />
                        <Route path="/wellness" element={<WellnessDashboard />} />
                        <Route path="/puberty" element={<Puberty />} />
                        <Route path="/maternity" element={<Maternity />} />
                        <Route path="/family-planning" element={<FamilyPlanning />} />
                        <Route path="/phc-nearby" element={<PhcNearby />} />
                        <Route path="/vaccine-tracker" element={<VaccineTracker />} />
                        <Route path="/pregnancy-dashboard" element={<PregnancyDashboard />} />
                        <Route path="/health-log" element={<HealthLog />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/weekly-report" element={<WeeklyBodyReport />} />
                        <Route path="/profile" element={<Profile />} />

                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <MissedLogReminder />
                      <Footer />
                    </AuthGate>
                  </BrowserRouter>
                </TooltipProvider>
              </OnboardingProvider>
            </HealthLogProvider>
          </AuthProvider>
        </PregnancyProfileProvider>
      </PhaseProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
