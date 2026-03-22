export type Region = "north" | "south" | "east" | "west";

export interface MealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

export interface RegionNutrition {
  region: Region;
  trimester1: MealPlan;
  trimester2: MealPlan;
  trimester3: MealPlan;
  culturalNotes: string[];
  foodsToAvoid: string[];
}

export const NUTRITION_DATA: Record<Region, RegionNutrition> = {
  north: {
    region: "north",
    trimester1: {
      breakfast: ["Poha with vegetables and peanuts", "Stuffed paratha with curd (light)", "Daliya (broken wheat) khichdi", "Besan chilla with mint chutney"],
      lunch: ["Dal, roti, seasonal sabzi, salad", "Rajma chawal with raita", "Chole with chapati and cucumber", "Mixed vegetable pulao with dal"],
      dinner: ["Light khichdi with ghee", "Roti with palak paneer", "Moong dal with chapati", "Vegetable soup with bread"],
      snacks: ["Roasted makhana (fox nuts)", "Fruit chaat with chaat masala", "Lassi (sweet or salted)", "Dry fruits mix (almonds, walnuts, dates)"],
    },
    trimester2: {
      breakfast: ["Paneer paratha with curd", "Aloo stuffed paratha with butter", "Idli with sambhar (North Indian style)", "Oats upma with vegetables"],
      lunch: ["Dal makhani (light cream), roti, sabzi", "Chicken curry with rice (non-veg)", "Kadhi pakora with jeera rice", "Stuffed capsicum with dal and roti"],
      dinner: ["Palak dal with chapati", "Egg curry with rice (non-veg option)", "Mixed dal with roti and salad", "Mushroom matar with chapati"],
      snacks: ["Fruit smoothie with dry fruits", "Sattu drink (protein-rich)", "Chana chaat", "Paneer tikka bites"],
    },
    trimester3: {
      breakfast: ["Sooji halwa (semolina) light", "Methi paratha with curd", "Sprout salad with lemon", "Ragi porridge with jaggery"],
      lunch: ["Light dal, roti, lauki sabzi", "Fish curry with rice (non-veg)", "Arhar dal with jeera rice", "Bhindi masala with chapati"],
      dinner: ["Moong dal khichdi (easy to digest)", "Light vegetable stew with chapati", "Dalia with vegetables", "Tomato soup with bread"],
      snacks: ["Dates (6 per day)", "Warm milk with turmeric", "Apple with peanut butter", "Mixed nuts and seeds"],
    },
    culturalNotes: [
      "Ghee is encouraged in moderation — provides good fats and vitamin A",
      "Sattu (roasted gram flour) drink is an excellent pregnancy superfood in North India",
      "During Navratri fasting, ensure adequate nutrition — consult doctor about modified fasts",
      "Makhana (fox nuts) are protein-rich snacks perfect during pregnancy",
    ],
    foodsToAvoid: [
      "Raw papaya (can cause contractions)",
      "Excessive ajinomoto (MSG)",
      "Unpasteurized dairy products",
      "Raw or undercooked eggs and meat",
      "Excessive caffeine (limit to 1 cup tea/day)",
      "Raw sprouts in first trimester",
      "Street food (hygiene concerns)",
    ],
  },
  south: {
    region: "south",
    trimester1: {
      breakfast: ["Idli with sambar and chutney", "Dosa with podi and ghee", "Upma with vegetables", "Pongal with coconut chutney"],
      lunch: ["Rice, rasam, kootu, poriyal", "Sambar rice with papad and buttermilk", "Curd rice with pickle (light)", "Bisi bele bath with raita"],
      dinner: ["Ragi mudde with soppu saaru", "Chapati with kurma", "Rice with dal and palya", "Idiappam with stew"],
      snacks: ["Coconut water fresh", "Sundal (chickpea salad)", "Banana (nendran/Kerala banana)", "Murukku with filter coffee (limit 1 cup)"],
    },
    trimester2: {
      breakfast: ["Pesarattu (moong dal dosa) with ginger chutney", "Rava idli with chutney", "Adai with avial", "Set dosa with potato filling"],
      lunch: ["Meals — rice, sambar, rasam, poriyal, kootu, buttermilk", "Fish curry with rice (non-veg option)", "Bisibele bath with boondi raita", "Puliyogare with appalam"],
      dinner: ["String hoppers with vegetable curry", "Chapati with egg roast (non-veg)", "Ragi dosa with chutney", "Rice with molagootal"],
      snacks: ["Tender coconut", "Ellu podi (sesame mix) with banana", "Fruit salad", "Ragi laddu"],
    },
    trimester3: {
      breakfast: ["Ragi porridge with jaggery and milk", "Wheat dosa with coconut chutney", "Oats pongal", "Kambu (pearl millet) dosa"],
      lunch: ["Light curd rice", "Drumstick sambar with rice", "Vazhaipoo (banana flower) kootu with rice", "Simple rasam rice with papad"],
      dinner: ["Chapati with dal and poriyal", "Idiyappam with vegetable stew", "Light uppittu with vegetables", "Ragi mudde with light saaru"],
      snacks: ["Dates with warm milk", "Dry fruit laddu", "Panakam (jaggery drink)", "Fresh fruits (sapota, guava)"],
    },
    culturalNotes: [
      "Ragi (finger millet) is a South Indian superfood — rich in calcium and iron, perfect for pregnancy",
      "Drumstick leaves (moringa) are excellent iron and calcium source traditionally used in pregnancy",
      "Coconut in all forms (water, milk, oil, fresh) provides healthy fats",
      "Traditional Seemantham ceremony — good time for community pregnancy support",
      "Buttermilk (mor/majjige) aids digestion and provides probiotics",
    ],
    foodsToAvoid: [
      "Raw papaya and pineapple",
      "Excessive tamarind in first trimester",
      "Raw eggs (avoid half-boiled eggs)",
      "Unpasteurized dairy",
      "Too much coffee (limit to 1 filter coffee/day)",
      "Street food and raw salads from outside",
      "Avoid excessive sesame in first trimester",
    ],
  },
  east: {
    region: "east",
    trimester1: {
      breakfast: ["Luchi with aloo dum (light)", "Chirer pulao (flattened rice)", "Muri mix (puffed rice) with vegetables", "Roti with sabzi"],
      lunch: ["Rice, dal, maacher jhol (fish curry — non-veg)", "Shukto (mixed vegetable), dal, rice", "Khichuri with egg (non-veg option)", "Rice with cholar dal and sabzi"],
      dinner: ["Chapati with mixed vegetable", "Light fish stew with rice (non-veg)", "Moong dal with rice", "Roti with paneer bhurji"],
      snacks: ["Coconut naru (laddu)", "Seasonal fruits (mango, litchi in season)", "Muri and chanachur mix", "Mishti doi (sweet curd — moderate)"],
    },
    trimester2: {
      breakfast: ["Vegetable paratha with curd", "Poha with peanuts", "Suji upma with vegetables", "Bread with egg bhurji (non-veg)"],
      lunch: ["Traditional Bengali thali — rice, dal, shukto, fish", "Dhokar dalna with rice", "Panch mishali tarkari with roti", "Chingri malaikari with rice (non-veg)"],
      dinner: ["Light khichuri", "Roti with mixed sabzi", "Moong dal soup with bread", "Rice with shorshe ilish (non-veg)"],
      snacks: ["Ghugni (dried peas curry)", "Jhal muri", "Banana with jaggery", "Sattu sherbet"],
    },
    trimester3: {
      breakfast: ["Ragi porridge", "Daliya with milk and nuts", "Moong sprout chaat", "Oats with banana"],
      lunch: ["Light dal, rice, and poriyal", "Khichuri with vegetables", "Fish curry light (non-veg)", "Simple dal-bhaat with sabzi"],
      dinner: ["Soup with bread", "Light khichuri with ghee", "Chapati with paneer", "Rice with moong dal"],
      snacks: ["Dates and dry fruits", "Warm milk with haldi", "Fresh coconut water", "Fruit chaat"],
    },
    culturalNotes: [
      "Fish is an important protein source in East India — well-cooked fish is safe during pregnancy",
      "Posto (poppy seeds) should be consumed in very small quantities during pregnancy",
      "Nolen gur (date palm jaggery) in winter provides iron but limit quantity",
      "Shukto (bitter mixed vegetable) is believed to cleanse and aid digestion",
    ],
    foodsToAvoid: [
      "Raw fish or sushi",
      "Excessive mustard oil (use in moderation)",
      "Raw papaya",
      "Too much sweets (gestational diabetes risk)",
      "Street food (hygiene concern)",
      "Large quantities of posto (poppy seeds)",
      "Alcohol-based preparations",
    ],
  },
  west: {
    region: "west",
    trimester1: {
      breakfast: ["Poha with onions and peanuts", "Thepla with curd", "Misal pav (mild version)", "Upma with coconut"],
      lunch: ["Dal-rice with sabzi and salad", "Undhiyu with rotla (seasonal)", "Pav bhaji (home-made, less oil)", "Gujarati dal, rice, roti, shaak"],
      dinner: ["Bhakri with pitla (besan curry)", "Dal and roti", "Vegetable khichdi", "Chapati with matar paneer"],
      snacks: ["Dhokla", "Fruit plate", "Chana jor garam", "Dry fruit chikki (moderate)"],
    },
    trimester2: {
      breakfast: ["Thalipeeth with butter", "Sabudana khichdi (non-fasting)", "Methi thepla with pickle", "Vegetable uttapam"],
      lunch: ["Maharashtrian thali — varan-bhaat, bhaji, chapati", "Bharli vangi with jowar bhakri", "Gujarati kadhi with rice", "Kolhapuri misal (mild version)"],
      dinner: ["Jowar bhakri with zunka", "Chapati with mixed dal", "Rice with amti dal", "Pav with usal"],
      snacks: ["Khandvi", "Shrikhand (moderate)", "Sprouted moong salad", "Coconut barfi"],
    },
    trimester3: {
      breakfast: ["Nachni (ragi) porridge", "Besan chilla with vegetables", "Oats with dry fruits", "Light poha"],
      lunch: ["Simple dal-chawal", "Khichdi with kadhi", "Jowar roti with palak sabzi", "Light pithla bhakri"],
      dinner: ["Soup with bread", "Light dal with chapati", "Vegetable pulao", "Moong dal khichdi"],
      snacks: ["Dates", "Warm milk with saffron", "Seasonal fruits", "Dry fruit laddu (homemade)"],
    },
    culturalNotes: [
      "Jowar (sorghum) and bajra (pearl millet) bhakris are excellent iron-rich alternatives to wheat roti",
      "Gujarati thali philosophy of balanced flavors works well for pregnancy nutrition",
      "During Shravan fasting month, consult doctor — modified fasts may be appropriate",
      "Kokum sherbet is a cooling drink safe and beneficial during pregnancy",
      "Amba dal (mango dal) provides good nutrition and taste in summer",
    ],
    foodsToAvoid: [
      "Raw papaya and pineapple",
      "Excessive farsaan (fried snacks)",
      "Very spicy preparations (Kolhapuri/Malvani style)",
      "Excessive jaggery sweets",
      "Unpasteurized paneer from street vendors",
      "Raw sprouts in first trimester",
      "Alcohol and tobacco in any form",
    ],
  },
};
