export type MaternityStage = "trimester1" | "trimester2" | "trimester3" | "postpartum" | "premature";

export interface PriorityNutrient {
  id: string;
  name: string;
  description: string;
  foods: string[];
  emoji: string;
}

export const MATERNITY_PRIORITY_NUTRIENTS: Record<MaternityStage, PriorityNutrient[]> = {
  trimester1: [
    { id: "folate", name: "Folate (B9)", description: "Crucial for neural tube development.", foods: ["Spinach", "Lentils", "Avocado"], emoji: "🥬" },
    { id: "vitamin_b6", name: "Vitamin B6", description: "Helps reduce nausea and supports brain development.", foods: ["Bananas", "Chickpeas", "Chicken"], emoji: "🍌" },
    { id: "iron", name: "Iron", description: "Supports blood production and oxygen transport.", foods: ["Spinach", "Lentils", "Dates"], emoji: "🩸" },
    { id: "protein", name: "Protein", description: "Essential for baby's tissue and organ growth.", foods: ["Eggs", "Greek Yogurt", "Dal"], emoji: "🥚" }
  ],
  trimester2: [
    { id: "iron", name: "Iron", description: "Supports blood production and oxygen transport.", foods: ["Spinach", "Lentils", "Dates"], emoji: "🩸" },
    { id: "calcium", name: "Calcium", description: "Builds baby's bones and teeth.", foods: ["Milk", "Yogurt", "Almonds"], emoji: "🥛" },
    { id: "protein", name: "Protein", description: "Essential for baby's tissue and organ growth.", foods: ["Eggs", "Greek Yogurt", "Dal"], emoji: "🥚" },
    { id: "omega3", name: "Omega-3", description: "Crucial for brain and eye development.", foods: ["Walnuts", "Chia Seeds", "Flaxseeds"], emoji: "🐟" }
  ],
  trimester3: [
    { id: "protein", name: "Protein", description: "Essential for baby's tissue and organ growth.", foods: ["Eggs", "Greek Yogurt", "Dal"], emoji: "🥚" },
    { id: "fiber", name: "Fiber", description: "Helps prevent constipation and aids digestion.", foods: ["Oats", "Apples", "Beans"], emoji: "🌾" },
    { id: "potassium", name: "Potassium", description: "Helps manage blood pressure and cramps.", foods: ["Bananas", "Sweet Potatoes", "Coconut Water"], emoji: "🥑" },
    { id: "omega3", name: "Omega-3", description: "Crucial for brain and eye development.", foods: ["Walnuts", "Chia Seeds", "Flaxseeds"], emoji: "🐟" }
  ],
  postpartum: [
    { id: "protein", name: "Protein", description: "Aids tissue repair and supports milk production.", foods: ["Eggs", "Greek Yogurt", "Dal"], emoji: "🥚" },
    { id: "iron", name: "Iron", description: "Replenishes blood lost during childbirth.", foods: ["Spinach", "Lentils", "Dates"], emoji: "🩸" },
    { id: "calcium", name: "Calcium", description: "Protects maternal bone density while nursing.", foods: ["Milk", "Yogurt", "Almonds"], emoji: "🥛" },
    { id: "hydration", name: "Hydration", description: "Essential for breast milk and overall recovery.", foods: ["Water", "Coconut Water", "Soups"], emoji: "💧" }
  ],
  premature: [
    { id: "protein", name: "Protein", description: "Aids tissue repair and supports milk production.", foods: ["Eggs", "Greek Yogurt", "Dal"], emoji: "🥚" },
    { id: "iron", name: "Iron", description: "Replenishes blood lost during childbirth.", foods: ["Spinach", "Lentils", "Dates"], emoji: "🩸" },
    { id: "omega3", name: "Omega-3", description: "Reduces inflammation and supports mood.", foods: ["Walnuts", "Chia Seeds", "Flaxseeds"], emoji: "🐟" },
    { id: "calcium", name: "Calcium", description: "Protects maternal bone density while nursing.", foods: ["Milk", "Yogurt", "Almonds"], emoji: "🥛" }
  ]
};
