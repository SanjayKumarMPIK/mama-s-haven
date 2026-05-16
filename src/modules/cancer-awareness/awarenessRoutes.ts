export const AWARENESS_ROUTES = {
  home: "/cancer-awareness",
  earlySymptoms: "/cancer-awareness/early-symptoms",
  selfExamGuide: "/cancer-awareness/self-exam-guide",
  mythsFacts: "/cancer-awareness/myths-facts",
  prevention: "/cancer-awareness/prevention",
  familyHistory: "/cancer-awareness/family-history",
  screeningAwareness: "/cancer-awareness/screening-awareness",
  emotionalSupport: "/cancer-awareness/emotional-support",
} as const;

export const AWARENESS_ROUTE_LIST = Object.values(AWARENESS_ROUTES);
