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
