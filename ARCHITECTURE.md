# Project Architecture & File Structure

This document provides a complete overview of the `mom` project architecture, including the full `src` directory tree and a detailed inventory of components used in every page.

## Full `src` Directory Structure

```text
src/
├── api/                # API service definitions
├── assets/             # Static assets (images, icons)
├── components/         # Reusable UI components
│   ├── dashboard/      # Dashboard-specific UI elements
│   ├── guidance/       # Guidance and educational modules
│   ├── maternity/      # Maternity UI components
│   ├── navigation/     # Nav bars, sidebars, menus
│   ├── nutrition/      # Nutrition-related components
│   ├── onboarding/     # Onboarding flow components
│   └── shared/         # Global shared components (StatCard, etc.)
├── hooks/              # Custom React hooks (usePhase, useAuth, etc.)
├── integrations/       # Supabase and other 3rd party integrations
├── lib/                # Utilities, constants, and engine logic
├── modules/            # Feature-based modular architecture
│   ├── doctor/         # Doctor portal (pages, components, logic)
│   ├── maternity/      # Maternity module (analytics, dashboard cards)
│   ├── postpartum/     # Postpartum module (recovery tracking)
│   ├── premature/      # Premature care module
│   ├── puberty/        # Puberty module (isolated guides)
│   └── role-selection/ # Role/Phase selection logic
├── pages/              # Primary application pages
│   ├── familyplanning/ # Family Planning specific pages
│   ├── maternity/      # Maternity specific sub-pages
│   ├── menopause/      # Menopause specific sub-pages
│   ├── nutrition/      # Nutrition Intelligence sub-pages
│   └── puberty/        # Puberty specific sub-pages
├── services/           # Business logic and analytics engines
├── shared/             # Shared resources across modules
├── App.tsx             # Main routing and entry component
├── main.tsx            # React DOM entry point
└── index.css           # Global styles
```

## Complete Page Component Inventory

Below is a detailed list of every `.tsx` file identified as a "Page" and the key components/icons imported within them.

### General Pages (`src/pages/`)
*   **About.tsx**: `Link`, `ArrowLeft`, `Heart`, `Leaf`, `Shield`, `ScrollReveal`
*   **Articles.tsx**: `Link`, `ArrowLeft`, `BookOpen`, `Clock`, `ScrollReveal`
*   **Assistant.tsx**: `Send`, `Stethoscope`, `Heart`, `Bot`, `VoiceButton`, `EmergencyCard`, `SafetyDisclaimer`
*   **BabySupportiveHelper.tsx**: `Sparkles`, `ArrowLeft`, `ArrowRight`, `CheckCircle2`, `Heart`, `Thermometer`, `Moon`, `Activity`, `AlertTriangle`
*   **Calendar.tsx**: `MaternityCalendar`, `GlobalSymptomCustomizer`, `DateSymptomCustomizer`, `BarChart`, `PieChart`
*   **ConnectPage.tsx**: `ArrowLeft`, `Stethoscope`, `Send`, `MyDoctorDashboard`
*   **EmergencyGuidance.tsx**: `ScrollReveal`, `Phone`, `MapPin`, `AlertTriangle`, `Ambulance`, `ShieldAlert`
*   **FamilyPlanning.tsx**: `FamilyPlanningOnboarding`, `ContraceptionGuide`, `DynamicToolsPanel`, `ArrowLeft`, `CalendarDays`
*   **FPToolPage.tsx**: `FertilityWindowTracker`, `BestDaysToTry`, `CycleRegularityAnalyzer`, `OvulationSupport`, `SafeRiskDays`, `ContraceptionGuidanceTool`
*   **HealthLog.tsx**: `HealthCalendar`, `DayLogModal`, `ScrollReveal`, `SafetyDisclaimer`
*   **NutritionGuide.tsx**: `SymptomSearchBar`, `SymptomAnalysisCard`, `NutrientCard`, `FoodRecommendationCard`, `DeficiencySummaryInline`, `FitnessCalculatorInline`
*   **PhcNearby.tsx**: `MapPin`, `ExternalLink`, `Building2`, `MapView`, `SafetyDisclaimer`
*   **PregnancyDashboard.tsx**: `MaternityRouteGuard`, `TimelineOverview`, `PrematureCareView`, `DiabetesDashboardWidget`, `DueDateChecker`, `CelebrationFlow`, `TodayTipCard`, `AnalyticsCarousel`, `WeeklyProgressCard`, `UpcomingAppointmentsCard`, `SymptomsOverviewCard`, `GDMSuggestionsCard`, `VisualAnalyticsSplitPanel`, `HealthSummaryCards`
*   **Profile.tsx**: `User`, `Calendar`, `Phone`, `Mail`, `MapPin`, `Scale`, `Ruler`, `Heart`, `Activity`
*   **Puberty.tsx**: `PubertyGuide`, `ScrollReveal`, `ArrowLeft`, `Calendar`, `Heart`, `Utensils`, `Activity`, `Stethoscope`
*   **SymptomChecker.tsx**: `SymptomGuideSearch`, `KnowYourSymptomsCard`, `Activity`, `TrendingUp`, `Brain`, `StatCard`, `AreaChart`
*   **WellnessDashboard.tsx**: `VisualAnalytics`, `ScrollReveal`, `SafetyDisclaimer`, `ScoreRing`, `SetupForm`, `Sparkles`, `Droplets`, `Moon`, `Activity`

### Module Pages (`src/modules/`)
*   **Doctor Dashboard (`modules/doctor/pages/DoctorDashboard.tsx`)**: `Users`, `Calendar`, `FileText`, `AlertCircle`, `Search`, `Clock`, `ChevronRight`, `Bell`, `Stethoscope`
*   **Doctor Schedules (`modules/doctor/pages/DoctorSchedules.tsx`)**: `ScheduleStats`, `ScheduleForm`, `ScheduleFilters`, `ScheduleCard`, `DoctorProposeSchedule`
*   **Postpartum Dashboard (`modules/postpartum/pages/PostpartumDashboard.tsx`)**: `PostpartumGuard`, `PostpartumOverviewCard`, `RecoverySummaryCards`, `PostpartumRecoveryCard`, `PostpartumTimeline`, `NutritionTipsCard`, `ActiveAlertsCard`, `VisualAnalytics`

### Sub-Module Pages
*   **Menopause Dashboard (`pages/menopause/MenopauseDashboard.tsx`)**: `Activity`, `Bone`, `Apple`, `Moon`, `Scale`, `Heart`, `Bot`, `Building2`, `Target`, `Sparkles`
*   **Menopause Bone Health (`pages/menopause/MenoBoneHealth.tsx`)**: `Bone`, `Sun`, `AlertTriangle`
*   **Puberty Nutrition (`pages/puberty/PubertyNutritionalInsightsPage.tsx`)**: `Heart`, `Zap`, `Sparkles`, `Info`, `ChevronDown`
*   **Nutrition Intelligence (`pages/nutrition/NutritionIntelligencePage.tsx`)**: `PriorityNutritionOverview`, `NutrientCard`, `FoodRecommendationCard`, `DeficiencySummaryInline`, `DeficiencyInsightsSection`, `NutritionChecklistSection`

---
*Note: This document is automatically generated to reflect the current codebase state.*
