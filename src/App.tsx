import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, BrowserRouter, Routes, Route } from "react-router-dom";
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
import MenopauseOnboarding from "./pages/menopause/MenopauseOnboarding";
import MenopauseCalendar from "./components/calendar/MenopauseCalendar";
import SymptomAnalytics from "./pages/menopause/SymptomAnalytics";
import WellnessPlan from "./pages/menopause/WellnessPlan";
import DailyGoals from "./pages/menopause/DailyGoals";
import MenopauseCareEssentials from "./pages/menopause/MenopauseCareEssentials";
import FunActivity from "./pages/menopause/FunActivity";
import BabySupportiveHelper from "./pages/BabySupportiveHelper";
import DeficiencyInsights from "./pages/DeficiencyInsights";
import FPToolPage from "./pages/FPToolPage";
import FitnessHealthCalculatorPage from "./pages/maternity/FitnessHealthCalculatorPage";
import PersonalizedDietPage from "./pages/nutrition/PersonalizedDietPage";
import NutritionChecklistPage from "./pages/nutrition/NutritionChecklistPage";
import PostpartumDashboard from "./modules/postpartum/pages/PostpartumDashboard";
import PubertyDeficiencyPage from "./pages/puberty/PubertyDeficiencyPage";
import PubertyNutrientRecommendationsPage from "./pages/puberty/PubertyNutrientRecommendationsPage";
import PubertyHydrationPage from "./pages/puberty/PubertyHydrationPage";
import PubertyFoodRestrictionsPage from "./pages/puberty/PubertyFoodRestrictionsPage";
import PubertyCaloriePage from "./pages/puberty/PubertyCaloriePage";
import PubertyProteinPage from "./pages/puberty/PubertyProteinPage";
import PubertyMealPlanPage from "./pages/puberty/PubertyMealPlanPage";
import PubertyNutritionalInsightsPage from "./pages/puberty/PubertyNutritionalInsightsPage";
import FPDeficiencyInsightsPage from "./pages/familyplanning/FPDeficiencyInsightsPage";
import FPHormonalNutritionPage from "./pages/familyplanning/FPHormonalNutritionPage";
import FPCycleNutritionPage from "./pages/familyplanning/FPCycleNutritionPage";
import FPLifestyleMetabolismPage from "./pages/familyplanning/FPLifestyleMetabolismPage";
import FPFoodsToAvoidPage from "./pages/familyplanning/FPFoodsToAvoidPage";
import { CustomSymptomsProvider } from "./hooks/useCustomSymptoms";


const queryClient = new QueryClient();

function AppShell() {
  return (
    <AuthGate>
      <CustomSymptomsProvider>
        <Navbar />
        <Outlet />
        <MissedLogReminder />
      </CustomSymptomsProvider>
    </AuthGate>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppShell />,
      children: [
        { index: true, element: <Index /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "tools", element: <Tools /> },
        { path: "tools/fp/:toolId", element: <FPToolPage /> },
        { path: "shopping", element: <Shopping /> },
        { path: "stress-relief", element: <StressRelief /> },
        { path: "articles", element: <Articles /> },
        { path: "postpartum-guide", element: <Postpartum /> },
        { path: "assistant", element: <Assistant /> },
        { path: "dashboard", element: <WeeklyGuide /> },
        { path: "nutrition", element: <NutritionGuide /> },
        { path: "symptom-checker", element: <SymptomChecker /> },
        { path: "emergency", element: <EmergencyGuidance /> },
        { path: "wellness", element: <WellnessDashboard /> },
        { path: "puberty", element: <Puberty /> },
                { path: "maternity", element: <Maternity /> },
        { path: "family-planning", element: <FamilyPlanning /> },
        { path: "phc-nearby", element: <PhcNearby /> },
        { path: "vaccine-tracker", element: <VaccineTracker /> },
        { path: "pregnancy-dashboard", element: <PregnancyDashboard /> },
        { path: "health-log", element: <HealthLog /> },
        { path: "calendar", element: <Calendar /> },
        { path: "profile", element: <Profile /> },
        { path: "medicine-reminder", element: <MedicineReminder /> },
        { path: "deficiency-insights", element: <DeficiencyInsights /> },
        { path: "maternity/nutrition/fitness-health-calculator", element: <FitnessHealthCalculatorPage /> },
        { path: "maternity/nutrition/personalized-diet", element: <PersonalizedDietPage /> },
        { path: "maternity/nutrition/checklist", element: <NutritionChecklistPage /> },
        { path: "postpartum-dashboard", element: <PostpartumDashboard /> },
        // Puberty nutrition sub-pages
        { path: "puberty/nutrition/deficiency-insights", element: <PubertyDeficiencyPage /> },
        { path: "puberty/nutrition/nutrient-recommendations", element: <PubertyNutrientRecommendationsPage /> },
        { path: "puberty/nutrition/hydration", element: <PubertyHydrationPage /> },
        { path: "puberty/nutrition/food-restrictions", element: <PubertyFoodRestrictionsPage /> },
        { path: "puberty/nutrition/calories", element: <PubertyCaloriePage /> },
        { path: "puberty/nutrition/protein", element: <PubertyProteinPage /> },
        { path: "puberty/nutrition/meal-plan", element: <PubertyMealPlanPage /> },
        { path: "puberty/nutrition/insights", element: <PubertyNutritionalInsightsPage /> },

        // Family Planning nutrition sub-pages
        { path: "family-planning/nutrition/deficiency-insights", element: <FPDeficiencyInsightsPage /> },
        { path: "family-planning/nutrition/hormonal-balance", element: <FPHormonalNutritionPage /> },
        { path: "family-planning/nutrition/cycle-plan", element: <FPCycleNutritionPage /> },
        { path: "family-planning/nutrition/lifestyle", element: <FPLifestyleMetabolismPage /> },
        { path: "family-planning/nutrition/foods-to-avoid", element: <FPFoodsToAvoidPage /> },

        // Menopause phase routes
        { path: "menopause/onboarding", element: <MenopauseOnboarding /> },
        { path: "menopause/calendar", element: <MenopauseCalendar /> },
        { path: "menopause/analytics", element: <SymptomAnalytics /> },
        { path: "menopause/wellness", element: <WellnessPlan /> },
        { path: "menopause/goals", element: <DailyGoals /> },
        { path: "menopause/care", element: <MenopauseCareEssentials /> },
        { path: "menopause/fun", element: <FunActivity /> },

        { path: "about", element: <About /> },
        { path: "contact", element: <Contact /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);

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
                        <Route path="/deficiency-insights" element={<DeficiencyInsights />} />
                        <Route path="/maternity/nutrition/fitness-health-calculator" element={<FitnessHealthCalculatorPage />} />
                        <Route path="/maternity/nutrition/personalized-diet" element={<PersonalizedDietPage />} />
                        <Route path="/maternity/nutrition/checklist" element={<NutritionChecklistPage />} />
                        <Route path="/postpartum-dashboard" element={<PostpartumDashboard />} />
                        {/* Puberty nutrition sub-pages */}
                        <Route path="/puberty/nutrition/deficiency-insights" element={<PubertyDeficiencyPage />} />
                        <Route path="/puberty/nutrition/nutrient-recommendations" element={<PubertyNutrientRecommendationsPage />} />
                        <Route path="/puberty/nutrition/hydration" element={<PubertyHydrationPage />} />
                        <Route path="/puberty/nutrition/food-restrictions" element={<PubertyFoodRestrictionsPage />} />
                        <Route path="/puberty/nutrition/calories" element={<PubertyCaloriePage />} />
                        <Route path="/puberty/nutrition/protein" element={<PubertyProteinPage />} />
                        <Route path="/puberty/nutrition/meal-plan" element={<PubertyMealPlanPage />} />
                        <Route path="/puberty/nutrition/insights" element={<PubertyNutritionalInsightsPage />} />
                        {/* Family Planning nutrition sub-pages */}
                        <Route path="/family-planning/nutrition/deficiency-insights" element={<FPDeficiencyInsightsPage />} />
                        <Route path="/family-planning/nutrition/hormonal-balance" element={<FPHormonalNutritionPage />} />
                        <Route path="/family-planning/nutrition/cycle-plan" element={<FPCycleNutritionPage />} />
                        <Route path="/family-planning/nutrition/lifestyle" element={<FPLifestyleMetabolismPage />} />
                        <Route path="/family-planning/nutrition/foods-to-avoid" element={<FPFoodsToAvoidPage />} />

                        {/* Menopause phase routes */}
                        <Route path="/menopause/onboarding" element={<MenopauseOnboarding />} />
                        <Route path="/menopause/calendar" element={<MenopauseCalendar />} />
                        <Route path="/menopause/analytics" element={<SymptomAnalytics />} />
                        <Route path="/menopause/wellness" element={<WellnessPlan />} />
                        <Route path="/menopause/goals" element={<DailyGoals />} />
                        <Route path="/menopause/care" element={<MenopauseCareEssentials />} />
                        <Route path="/menopause/fun" element={<FunActivity />} />

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
