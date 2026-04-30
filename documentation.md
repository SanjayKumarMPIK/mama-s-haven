# MomBloom: Maternal Health Assistant
**Comprehensive Project Documentation**

---

## 1. Introduction
**MomBloom** is an AI-powered, multilingual maternal health companion designed to provide safe, accessible, and personalized pregnancy guidance to women across urban and rural India. Aligned with public health guidelines (such as the National Health Mission), it serves as a reliable digital health assistant that prioritizes safety, cultural relevance, and accessibility.

---

## 2. Technologies Used
- **Frontend Framework**: React 18, Vite, TypeScript
- **Styling & UI**: Tailwind CSS, shadcn/ui, Lucide Icons (for lightweight, scalable vector graphics)
- **Data Persistence**: `localStorage` (Offline-lite architecture for caching user profiles and gamification stats without needing a constant database connection)
- **Voice Interface**: Web Speech API (Native browser APIs for Speech-to-Text and Text-to-Speech) ensuring hands-free and inclusive accessibility.
- **AI & Backend Integration**: Supabase (Database, Auth, and Edge Functions for handling AI chat streams).
- **Internationalization (i18n)**: Custom lightweight i18n implementation tailored for Indian regional languages.
- **Routing**: React Router DOM for seamless Single Page Application (SPA) navigation.

---

## 3. Core Features
- **🌐 Multilingual Support**: Supports 6 Indian languages (English, Hindi, Tamil, Telugu, Kannada, Bengali) with live, state-driven UI translation.
- **📅 Personalized Weekly Guide**: Dynamically calculates the current pregnancy week based on the user's expected due date, offering week-by-week baby development updates, maternal bodily changes, and actionable tips.
- **🍛 Region-Specific Nutrition**: Trimester-specific meal plans (Breakfast, Lunch, Dinner, Snacks) and cultural notes tailored to North, South, East, and West Indian regional diets.
- **🔍 Non-Diagnostic Symptom Checker**: Categorizes 18+ common symptoms into 4 severity tiers (Normal, Monitor, Visit Center, Emergency). Automatically triggers red emergency cards and helpline numbers (104/102) for high-risk inputs.
- **🏆 Gamified Wellness Dashboard**: Promotes healthy maternal behaviors through daily habit tracking (e.g., Hydration, Supplements, Rest), streaks, XP, level progressions (Seedling to Lotus), and milestone badges.
- **🎙️ AI-Powered Voice Assistant**: A context-aware conversational AI that knows the mother's pregnancy week. It supports voice input/output and features safety guardrails with emergency keyword detection to prevent medical misinformation.
- **👓 Simple Mode**: An accessibility toggle that increases typography size, simplifies layouts, and enhances contrast for low-literacy users.

---

## 4. Feasibility
### Technical Feasibility
- **Offline-Lite Capabilities**: By storing the pregnancy profile, gamification stats, and localized content data client-side, the app remains partially usable in rural areas with spotty internet connectivity.
- **Low-End Device Compatibility**: Built with Vite and native CSS, the application is highly performant. It avoids heavy 3D renders or massive libraries, ensuring it runs smoothly on budget smartphones.
- **Scalable Architecture**: The dictionary-based translation logic and modular component structure mean adding new languages (like Marathi or Gujarati) or new features takes minimal developer effort.

### Operational Feasibility
- **Cost-Effective Intervention**: Reduces the burden on Primary Health Centres (PHCs) by answering basic queries, allowing doctors and ASHA workers to focus on high-risk patients.
- **Ease of Distribution**: As a web application, it bypasses app store friction. It can be shared as a simple URL via WhatsApp and installed on the home screen as a PWA (Progressive Web App).

---

## 5. Uses and Applications
- **For Expectant Mothers**: A daily reassuring companion to track pregnancy milestones, remember daily iron/folic acid (IFA) supplements, and self-triage minor discomforts safely.
- **For ASHA & Anganwadi Workers**: Can be used as a visual aid during house visits to explain fetal development to rural mothers in their native language and log community wellness.
- **For Government Health Programs**: Acts as a digital distribution channel to push NHM policies, vaccination reminders, and maternal health incentive awareness.

---

## 6. Impact on the Real World
### Reducing Maternal Mortality Rates (MMR)
By clearly distinguishing between normal pregnancy symptoms and critical warning signs (such as heavy bleeding, severe headaches, or premature water breaking), the app bridges the delay in seeking care. Immediate routing to 102/104 helplines directly saves lives in obstetric emergencies.

### Bridging the Literacy and Digital Divide
The combination of "Simple Mode" (larger fonts, reduced cognitive load) and full Voice Interface (TTS and STT) empowers illiterate or low-literacy mothers to access vital health information independently, breaking down traditional barriers to medical knowledge.

### Improving Nutritional Outcomes
Combating widespread issues like gestational anemia and low birth weight, the app provides region-specific, highly accessible diet charts. It promotes locally available, affordable, and culturally acceptable nutritious foods rather than generic, expensive western diets.

### Driving Behavioral Shifts
The gamified wellness tracker leverages proven behavioral psychology. By rewarding streaks and giving positive reinforcement (badges, encouraging nudges), it transforms tedious tasks—like drinking 8 glasses of water or taking daily supplements—into engaging, consistent habits, leading to healthier pregnancies and healthier babies.

---

## 7. Component Documentation

The application's UI is divided into several feature-based domains and reusable elements. Below is a structured overview of the components present in `src/components`:

### Core / Shared Components
Found at the root of `src/components/`:
- **AuthGate**: Manages authentication state and protects routes.
- **Navbar / Footer / NavLink**: Application-wide layout and routing links.
- **HealthCalendar**: A generalized calendar interface for health tracking.
- **DayLogModal / MissedLogReminder**: Generic log entry prompts and modalities.
- **EmergencyCard / SafetyDisclaimer**: Critical safety alerts and legal/health disclaimers.
- **LanguageSwitcher**: Toggles the custom i18n locale.
- **MedicineAlertPopup**: Reminders for medicine.
- **ScrollReveal**: Scroll-based animation wrapper.
- **SymptomQuickLogger / VoiceButton**: Quick access logging and voice-driven input components.

### Calendar Phase Components (`/calendar`)
Phase-specific calendar implementations.
- **MaternityCalendar**: Core calendar specifically tailored for pregnancy.
- **MaternityDayCell / MaternityDayDetails**: Deep dives into daily maternal logs.
- **PubertyCalendar**: Calendar tailored for the puberty phase.
- **SymptomLogModal**: Specific modal handling symptom data entry.

### Dashboard & Analytics (`/dashboard`)
Widgets and wrappers visualizing health data.
- **ActionList / AnalyticsList / VisualAnalytics**: Render charts and tasks.
- **DiabetesDashboardWidget**: Specialized widget for tracking gestational diabetes.
- **HealthScoreHero / InsightsCard / StatusCard / WeightGauge**: Track wellness and show progress metrics.
- **TimelineOverview / PrematureCareView**: Timelines of pregnancy and specific premature care logs.

### Gamification (`/gamification`)
Handles user rewards and motivation.
- **BadgeGrid / HabitCard / LevelProgress / MotivationalNudge / StreakBadge**: Visual components detailing gamification, levels, and user habit strengths.

### Guidance (`/guidance`)
Content components aimed at educating users.
- **MaternalGuide.tsx**, **MenstrualGuide.tsx**, **WeeklyGuidance.tsx**: Dynamic articles and advice based on phase.
- **MaternalGuide/ (Subdirectory)**: Contains structural parts for maternal guidance (`Timeline.tsx`, `WeekDetailsCard.tsx`, `WeekNode.tsx`, `data.ts`).

### Health Logs (`/healthlog`)
Forms for users to manually submit health statuses.
- **FamilyPlanningLogForm**, **MaternityLogForm**, **MenopauseLogForm**, **PubertyLogForm**: Distinct forms tailored to the tracking requirements of each phase.

### Navigation (`/navigation`)
Specific navigation elements.
- **HamburgerMenu**, **NavItem**, **PhaseSelector**: Managing site-wide phase switching and mobile navigation.

### Onboarding & Setup (`/onboarding`)
- **OnboardingFlow**, **PubertyQuestions**: Initial setup and questionnaire to build the user profile.

### Educational Features (`/puberty`)
- **EducationCards**: Readily accessible cards explaining puberty-related body changes.

### UI Toolkit (`/ui`)
A comprehensive collection of 50 highly reusable base elements (like Shadcn/ui) including generic Buttons, Inputs, Dialogs, Selects, Toasts, Cards, Carousels, Charts, Forms, etc. that handle fundamental styling and accessibility.
