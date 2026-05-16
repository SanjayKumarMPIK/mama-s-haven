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

import { RoleProvider } from "@/hooks/useRole";

import AuthGate from "@/components/AuthGate";
import HillstationDeliveryAlertPublisher from "@/components/HillstationDeliveryAlertPublisher";
import RequireMotherSession from "@/components/RequireMotherSession";

import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

import Index from "./pages/Index";

import Tools from "./pages/Tools";

import Shopping from "./pages/Shopping";

import StressRelief from "./pages/StressRelief";



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

import MenopauseOnboarding from "./pages/menopause/MenopauseOnboarding";

import SymptomAnalytics from "./pages/menopause/SymptomAnalytics";

import WellnessPlan from "./pages/menopause/WellnessPlan";

import DailyGoals from "./pages/menopause/DailyGoals";


import FunActivity from "./pages/menopause/FunActivity";

import { lazy, Suspense } from "react";



const MenopauseDashboard = lazy(() => import("./pages/menopause/MenopauseDashboard"));

const MenoBoneHealth = lazy(() => import("./pages/menopause/MenoBoneHealth"));

const MenoSleepMood = lazy(() => import("./pages/menopause/MenoSleepMood"));

const MenoWeightMetabolism = lazy(() => import("./pages/menopause/MenoWeightMetabolism"));

const MenoHeartHealth = lazy(() => import("./pages/menopause/MenoHeartHealth"));

const MenoPHCSupport = lazy(() => import("./pages/menopause/MenoPHCSupport"));
const MenoTools = lazy(() => import("./pages/menopause/MenoTools"));
const MenoHotFlashTracker = lazy(() => import("./pages/menopause/MenoHotFlashTracker"));
const MenoCoolingPlanBuilder = lazy(() => import("./pages/menopause/MenoCoolingPlanBuilder"));
const MenoCalmRoutineGenerator = lazy(() => import("./pages/menopause/MenoCalmRoutineGenerator"));
const MenoBrainFogHelper = lazy(() => import("./pages/menopause/MenoBrainFogHelper"));

import BabySupportiveHelper from "./pages/BabySupportiveHelper";
import MaternalGuideHub from "./pages/MaternalGuideHub";
import PregnancyGuide from "./pages/PregnancyGuide";
import PrematureCare from "./pages/PrematureCare";
import PostpartumGuide from "./pages/PostpartumGuide";

import FPToolPage from "./pages/FPToolPage";

import FitnessHealthCalculatorPage from "./pages/maternity/FitnessHealthCalculatorPage";

import PersonalizedDietPage from "./pages/nutrition/PersonalizedDietPage";

import NutritionChecklistPage from "./pages/nutrition/NutritionChecklistPage";

import NutritionIntelligencePage from "./pages/nutrition/NutritionIntelligencePage";

import PostpartumDashboard from "./modules/postpartum/pages/PostpartumDashboard";

import RoleEntry from "./modules/role-selection/RoleEntry";

import DoctorDashboard from "./modules/doctor/pages/DoctorDashboard";

import DoctorAlerts from "./modules/doctor/pages/DoctorAlerts";
import DoctorQuestions from "./modules/doctor/pages/DoctorNotifications";
import DoctorSchedules from "./modules/doctor/pages/DoctorSchedules";
import DoctorCalendar from "./modules/doctor/pages/DoctorCalendar";
import DoctorProfile from "./modules/doctor/pages/DoctorProfile";
import DoctorRequests from "./modules/doctor/pages/DoctorRequests";
import DoctorHistory from "./modules/doctor/pages/DoctorHistory";
import DoctorHotspots from "./modules/doctor/pages/DoctorHotspots";
import PatientsPage from "./modules/doctor/patients/pages/PatientsPage";
import ConnectPage from "./pages/ConnectPage";
import RequestSchedulePage from "./pages/RequestSchedulePage";
import AskDoctorPage from "./pages/AskDoctorPage";
import ConnectionStatusPage from "./pages/ConnectionStatusPage";
import DoctorReportsPage from "./pages/DoctorReportsPage";

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

import FPNutritionGuidePage from "./pages/familyplanning/FPNutritionGuidePage";

import FPNutritionLifestylePage from "./pages/familyplanning/FPNutritionLifestylePage";

import FPNutritionFitnessCalculatorPage from "./pages/familyplanning/FPNutritionFitnessCalculatorPage";

import FPNutritionPersonalizedDietPage from "./pages/familyplanning/FPNutritionPersonalizedDietPage";

import FPNutritionIntelligencePage from "./pages/familyplanning/FPNutritionIntelligencePage";

import CareLog from "./pages/familyplanning/CareLog";

import CancerAwarenessHome from "./modules/cancer-awareness/CancerAwarenessHome";
import EarlySymptomsPage from "./modules/cancer-awareness/EarlySymptomsPage";
import SelfExamGuidePage from "./modules/cancer-awareness/SelfExamGuidePage";
import MythsFactsPage from "./modules/cancer-awareness/MythsFactsPage";
import PreventionPage from "./modules/cancer-awareness/PreventionPage";
import FamilyHistoryPage from "./modules/cancer-awareness/FamilyHistoryPage";
import ScreeningAwarenessPage from "./modules/cancer-awareness/ScreeningAwarenessPage";
import EmotionalSupportPage from "./modules/cancer-awareness/EmotionalSupportPage";

import MaternityDeficiencyInsightsPage from "./pages/maternity/MaternityDeficiencyInsightsPage";
import { SchemesPage } from "./modules/maternity/schemes/SchemesPage";

import { CustomSymptomsProvider } from "./hooks/useCustomSymptoms";

import { NotificationProvider } from "@/hooks/useNotificationStore";

import { DoctorAuthProvider } from "./modules/doctor/context/DoctorAuthContext";
import DoctorGuard from "./modules/doctor/components/DoctorGuard";





const queryClient = new QueryClient();





const App = () => (

  <QueryClientProvider client={queryClient}>

    <LanguageProvider>

      <PhaseProvider>

        <PregnancyProfileProvider>

          <AuthProvider>

            <DoctorAuthProvider>

            <RoleProvider>

              <HillstationDeliveryAlertPublisher />

              <HealthLogProvider>

                <OnboardingProvider>

                  <TooltipProvider>

                    <Toaster />

                    <Sonner />

                    <BrowserRouter>

                  <AuthGate>

                    <NotificationProvider>

                    <CustomSymptomsProvider>

                        <Navbar />

                        <Routes>

                          <Route path="/" element={<RoleEntry />} />

                          <Route path="/home" element={<Index />} />

                          <Route path="/doctor/schedules" element={<DoctorGuard><DoctorSchedules /></DoctorGuard>} />

                          <Route path="/doctor/calendar" element={<DoctorGuard><DoctorCalendar /></DoctorGuard>} />

                          <Route path="/doctor/profile" element={<DoctorGuard><DoctorProfile /></DoctorGuard>} />

                          <Route path="/doctor/requests" element={<DoctorGuard><DoctorRequests /></DoctorGuard>} />

                          <Route path="/doctor/patients" element={<DoctorGuard><PatientsPage /></DoctorGuard>} />

                          <Route path="/doctor/history" element={<DoctorGuard><DoctorHistory /></DoctorGuard>} />
                          <Route path="/doctor/questions" element={<DoctorGuard><DoctorQuestions /></DoctorGuard>} />

                          <Route path="/doctor/alerts" element={<DoctorGuard><DoctorAlerts /></DoctorGuard>} />

                          <Route path="/doctor/hotspots" element={<DoctorGuard><DoctorHotspots /></DoctorGuard>} />

                          <Route path="/doctor/dashboard" element={<DoctorGuard><DoctorDashboard /></DoctorGuard>} />

                          <Route path="/doctor/*" element={<DoctorGuard><DoctorDashboard /></DoctorGuard>} />

                          <Route path="/login" element={<Login />} />

                          <Route path="/register" element={<Register />} />

                          <Route path="/tools" element={<Tools />} />

                          <Route path="/tools/fp/:toolId" element={<FPToolPage />} />

                          <Route path="/shopping" element={<Shopping />} />

                          <Route path="/stress-relief" element={<StressRelief />} />



                          <Route path="/postpartum-guide" element={<Postpartum />} />

                          <Route path="/assistant" element={<Assistant />} />

                          <Route path="/dashboard" element={<RequireMotherSession><WeeklyGuide /></RequireMotherSession>} />

                          <Route path="/maternal-guide" element={<MaternalGuideHub />} />

                          <Route path="/maternal-guide/pregnancy" element={<PregnancyGuide />} />

                          <Route path="/maternal-guide/premature" element={<PrematureCare />} />

                          <Route path="/maternity/postpartum-guide" element={<PostpartumGuide />} />

                          <Route path="/nutrition" element={<NutritionGuide />} />

                          <Route path="/nutrition-intelligence" element={<NutritionIntelligencePage />} />

                          <Route path="/symptom-checker" element={<SymptomChecker />} />

                          <Route path="/emergency" element={<EmergencyGuidance />} />

                          <Route path="/wellness" element={<WellnessDashboard />} />

                          <Route path="/puberty" element={<Puberty />} />

                          <Route path="/maternity" element={<Maternity />} />

                          <Route path="/maternity/schemes" element={<SchemesPage />} />

                          <Route path="/family-planning" element={<FamilyPlanning />} />

                          <Route path="/phc-nearby" element={<PhcNearby />} />

                          <Route path="/vaccine-tracker" element={<VaccineTracker />} />

                          <Route path="/connect" element={<ConnectPage />} />

                          <Route path="/request-schedule" element={<RequestSchedulePage />} />

                          <Route path="/ask-doctor" element={<AskDoctorPage />} />

                          <Route path="/connection-status" element={<ConnectionStatusPage />} />

                          <Route path="/connect/reports" element={<DoctorReportsPage />} />

                          <Route path="/pregnancy-dashboard" element={<RequireMotherSession><PregnancyDashboard /></RequireMotherSession>} />

                          <Route path="/health-log" element={<HealthLog />} />

                          <Route path="/calendar" element={<Calendar />} />

                          <Route path="/profile" element={<Profile />} />

                          <Route path="/medicine-reminder" element={<MedicineReminder />} />

                          <Route path="/baby-supportive-helper" element={<BabySupportiveHelper />} />

                          <Route path="/maternity/nutrition/deficiency-insights" element={<MaternityDeficiencyInsightsPage />} />

                          <Route path="/maternity/nutrition/fitness-health-calculator" element={<FitnessHealthCalculatorPage />} />

                          <Route path="/maternity/nutrition/personalized-diet" element={<PersonalizedDietPage />} />

                          <Route path="/maternity/nutrition/checklist" element={<NutritionChecklistPage />} />

                          <Route path="/postpartum-dashboard" element={<RequireMotherSession><PostpartumDashboard /></RequireMotherSession>} />

                          {/* Puberty nutrition sub-pages */}

                          <Route path="/puberty/nutrition-guide" element={<PubertyNutritionGuide />} />

                          <Route path="/puberty/nutrition-guide/activities" element={<PubertyActivitiesPage />} />

                          <Route path="/puberty/nutrition-guide/fitness-health-calculator" element={<PubertyFitnessHealthCalculatorPage />} />

                          <Route path="/puberty/nutrition-guide/personalized-diet" element={<PubertyPersonalizedDietPage />} />

                          <Route path="/puberty/nutrition-guide/intelligence" element={<PubertyNutritionIntelligencePage />} />

                          {/* Family Planning nutrition sub-pages */}

                          <Route path="/family-planning/nutrition-guide" element={<FPNutritionGuidePage />} />

                          <Route path="/family-planning/nutrition-guide/lifestyle" element={<FPNutritionLifestylePage />} />

                          <Route path="/family-planning/nutrition-guide/fitness-health-calculator" element={<FPNutritionFitnessCalculatorPage />} />

                          <Route path="/family-planning/nutrition-guide/personalized-diet" element={<FPNutritionPersonalizedDietPage />} />

                          <Route path="/family-planning/nutrition-guide/nutrition-intelligence" element={<FPNutritionIntelligencePage />} />

                          <Route path="/family-planning/nutrition/deficiency-insights" element={<FPDeficiencyInsightsPage />} />

                          <Route path="/family-planning/nutrition/hormonal-balance" element={<FPHormonalNutritionPage />} />

                          <Route path="/family-planning/nutrition/cycle-plan" element={<FPCycleNutritionPage />} />

                          <Route path="/family-planning/nutrition/lifestyle" element={<FPLifestyleMetabolismPage />} />

                          <Route path="/family-planning/nutrition/foods-to-avoid" element={<FPFoodsToAvoidPage />} />

                          <Route path="/family-planning/care-log" element={<CareLog />} />



                        {/* Menopause phase routes */}

                        <Route path="/menopause" element={<Index />} />

                        <Route path="/menopause/connect" element={<ConnectPage />} />

                        <Route path="/menopause/onboarding" element={<MenopauseOnboarding />} />

                        <Route path="/menopause/dashboard" element={<RequireMotherSession><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenopauseDashboard /></Suspense></RequireMotherSession>} />

                        <Route path="/menopause/symptoms" element={<SymptomChecker />} />

                        <Route path="/menopause/bone-health" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoBoneHealth /></Suspense>} />

                        <Route path="/menopause/nutrition" element={<NutritionGuide />} />

                        <Route path="/menopause/sleep-mood" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoSleepMood /></Suspense>} />

                        <Route path="/menopause/weight-metabolism" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoWeightMetabolism /></Suspense>} />

                        <Route path="/menopause/heart-health" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoHeartHealth /></Suspense>} />

                        <Route path="/menopause/ai-assistant" element={<Assistant />} />

                        <Route path="/menopause/phc-support" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoPHCSupport /></Suspense>} />

                        <Route path="/menopause/analytics" element={<SymptomAnalytics />} />

                        <Route path="/menopause/wellness" element={<WellnessDashboard />} />
                        <Route path="/menopause/tools" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoTools /></Suspense>} />
                        <Route path="/menopause/tools/cooling-plan" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoCoolingPlanBuilder /></Suspense>} />
                        <Route path="/menopause/tools/calm-routine" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoCalmRoutineGenerator /></Suspense>} />
                        <Route path="/menopause/tools/brain-fog-helper" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoBrainFogHelper /></Suspense>} />
                        <Route path="/menopause/hot-flash-tracker" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>}><MenoHotFlashTracker /></Suspense>} />





                        <Route path="/menopause/goals" element={<DailyGoals />} />

                        <Route path="/menopause/fun" element={<FunActivity />} />



                          {/* Cancer Awareness module - centralized, shared across all phases */}

                          <Route path="/cancer-awareness" element={<CancerAwarenessHome />} />

                          <Route path="/cancer-awareness/early-symptoms" element={<EarlySymptomsPage />} />

                          <Route path="/cancer-awareness/self-exam-guide" element={<SelfExamGuidePage />} />

                          <Route path="/cancer-awareness/myths-facts" element={<MythsFactsPage />} />

                          <Route path="/cancer-awareness/prevention" element={<PreventionPage />} />

                          <Route path="/cancer-awareness/family-history" element={<FamilyHistoryPage />} />

                          <Route path="/cancer-awareness/screening-awareness" element={<ScreeningAwarenessPage />} />

                          <Route path="/cancer-awareness/emotional-support" element={<EmotionalSupportPage />} />



                          <Route path="/about" element={<About />} />

                          <Route path="/contact" element={<Contact />} />

                          <Route path="*" element={<NotFound />} />

                        </Routes>

                        <MissedLogReminder />

                        <MedicineAlertPopup />

                        <MaternityPhaseGatedReminders />

                        <Footer />

                      </CustomSymptomsProvider>

                      </NotificationProvider>

                    </AuthGate>

                  </BrowserRouter>

                </TooltipProvider>

              </OnboardingProvider>

            </HealthLogProvider>

            </RoleProvider>

            </DoctorAuthProvider>

          </AuthProvider>

        </PregnancyProfileProvider>

      </PhaseProvider>

    </LanguageProvider>

  </QueryClientProvider>

);



export default App;

