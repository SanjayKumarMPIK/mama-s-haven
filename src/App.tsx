import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Profile from "./pages/Profile";
import MedicineReminder from "./pages/MedicineReminder";
import MissedLogReminder from "@/components/MissedLogReminder";
import MedicineAlertPopup from "@/components/MedicineAlertPopup";
import MaternityPhaseGatedReminders from "@/components/MaternityPhaseGatedReminders";

import BabySupportiveHelper from "./pages/BabySupportiveHelper";
import FPToolPage from "./pages/FPToolPage";
import FitnessHealthCalculatorPage from "./pages/maternity/FitnessHealthCalculatorPage";
import PersonalizedDietPage from "./pages/nutrition/PersonalizedDietPage";
import NutritionChecklistPage from "./pages/nutrition/NutritionChecklistPage";
import NutritionIntelligencePage from "./pages/nutrition/NutritionIntelligencePage";
import PostpartumDashboard from "./modules/postpartum/pages/PostpartumDashboard";
import PubertyNutritionGuide from "./modules/puberty/nutrition-guide/pages/PubertyNutritionGuide";
import PubertyActivitiesPage from "./modules/puberty/nutrition-guide/pages/PubertyActivitiesPage";
import PubertyFitnessHealthCalculatorPage from "./modules/puberty/nutrition-guide/pages/PubertyFitnessHealthCalculatorPage";
import PubertyPersonalizedDietPage from "./modules/puberty/nutrition-guide/pages/PubertyPersonalizedDietPage";
import PubertyNutritionIntelligencePage from "./modules/puberty/nutrition-guide/pages/PubertyNutritionIntelligencePage";
import FPDeficiencyInsightsPage from "./pages/familyplanning/FPDeficiencyInsightsPage";
import FPHormonalNutritionPage from "./pages/familyplanning/FPHormonalNutritionPage";
import FPCycleNutritionPage from "./pages/familyplanning/FPCycleNutritionPage";
import FPLifestyleMetabolismPage from "./pages/familyplanning/FPLifestyleMetabolismPage";
import FPFoodsToAvoidPage from "./pages/familyplanning/FPFoodsToAvoidPage";
import CareLog from "./pages/familyplanning/CareLog";
import MaternityDeficiencyInsightsPage from "./pages/maternity/MaternityDeficiencyInsightsPage";
import { CustomSymptomsProvider } from "./hooks/useCustomSymptoms";


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
                      <CustomSymptomsProvider>
                        <Navbar />
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/tools" element={<Tools />} />
                          <Route path="/tools/fp/:toolId" element={<FPToolPage />} />
                          <Route path="/shopping" element={<Shopping />} />
                          <Route path="/stress-relief" element={<StressRelief />} />
                          <Route path="/articles" element={<Articles />} />
                          <Route path="/postpartum-guide" element={<Postpartum />} />
                          <Route path="/assistant" element={<Assistant />} />
                          <Route path="/dashboard" element={<WeeklyGuide />} />
                          <Route path="/nutrition" element={<NutritionGuide />} />
                          <Route path="/nutrition-intelligence" element={<NutritionIntelligencePage />} />
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
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/medicine-reminder" element={<MedicineReminder />} />
                          <Route path="/baby-supportive-helper" element={<BabySupportiveHelper />} />
                          <Route path="/maternity/nutrition/deficiency-insights" element={<MaternityDeficiencyInsightsPage />} />
                          <Route path="/maternity/nutrition/fitness-health-calculator" element={<FitnessHealthCalculatorPage />} />
                          <Route path="/maternity/nutrition/personalized-diet" element={<PersonalizedDietPage />} />
                          <Route path="/maternity/nutrition/checklist" element={<NutritionChecklistPage />} />
                          <Route path="/postpartum-dashboard" element={<PostpartumDashboard />} />
                          {/* Puberty nutrition sub-pages */}
                          <Route path="/puberty/nutrition-guide" element={<PubertyNutritionGuide />} />
                          <Route path="/puberty/nutrition-guide/activities" element={<PubertyActivitiesPage />} />
                          <Route path="/puberty/nutrition-guide/fitness-health-calculator" element={<PubertyFitnessHealthCalculatorPage />} />
                          <Route path="/puberty/nutrition-guide/personalized-diet" element={<PubertyPersonalizedDietPage />} />
                          <Route path="/puberty/nutrition-guide/intelligence" element={<PubertyNutritionIntelligencePage />} />
                          {/* Family Planning nutrition sub-pages */}
                          <Route path="/family-planning/nutrition/deficiency-insights" element={<FPDeficiencyInsightsPage />} />
                          <Route path="/family-planning/nutrition/hormonal-balance" element={<FPHormonalNutritionPage />} />
                          <Route path="/family-planning/nutrition/cycle-plan" element={<FPCycleNutritionPage />} />
                          <Route path="/family-planning/nutrition/lifestyle" element={<FPLifestyleMetabolismPage />} />
                          <Route path="/family-planning/nutrition/foods-to-avoid" element={<FPFoodsToAvoidPage />} />
                          <Route path="/family-planning/care-log" element={<CareLog />} />


                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <MissedLogReminder />
                        <MedicineAlertPopup />
                        <MaternityPhaseGatedReminders />
                        <Footer />
                      </CustomSymptomsProvider>
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
