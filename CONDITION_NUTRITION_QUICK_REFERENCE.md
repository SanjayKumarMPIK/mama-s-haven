# QUICK REFERENCE GUIDE
# Condition-Based Nutrition Intelligence

---

## FILES AT A GLANCE

### New Files Created

**1. `src/lib/nutrition/conditionNutrientMapping.ts`**
- Maps 7 medical conditions → nutrients + foods
- Exports: CONDITION_NUTRIENT_MAP + 7 helper functions
- No dependencies: Pure utility functions
- Size: ~145 lines

**2. `src/hooks/useConditionBasedNutrients.ts`**
- React hook for condition processing
- Returns: conditions, nutrientIds, configs, foods, isActive
- Maternity-only gate: phase + mode checks
- Size: ~87 lines

### Modified Files

**3. `src/components/nutrition/PriorityNutritionOverview.tsx`**
- Added hook import
- Added dynamic condition card insertion
- Badge colors: Amber (condition) / Rose (symptom+condition)
- Impact: May show 5-11 cards instead of 4

**4. `src/pages/nutrition/NutritionIntelligencePage.tsx`**
- Added hook import
- Updated dietInput.deficiencies array
- Added condition guidance text block
- Impact: Meals include condition foods, text explains conditions

**5. `src/components/nutrition/DeficiencyInsightsSection.tsx`**
- Added hook import
- Added "Condition-Linked Nutritional Support" section
- Positioned after "Top Deficiency Insights"
- Impact: New amber section if conditions exist

---

## KEY FUNCTIONS

### In conditionNutrientMapping.ts

```typescript
// Get nutrient IDs from conditions
getConditionNutrientIds(["Anemia", "PCOS"])
→ ["iron", "vitamin_d"]

// Get full configs
getConditionNutrientConfigs(["Anemia"])
→ [{ nutrient: "Iron", nutrientId: "iron", emoji: "🩸", foods: {...} }]

// Get foods for diet preference
getConditionFoods("Anemia", "veg")
→ ["Spinach", "Dates", "Beetroot", "Sesame seeds"]

// Get weight boost for nutrient
getConditionNutrientModifier("iron", ["Anemia"])
→ 25 (priority P1 nutrients get +25)

// Get which condition for nutrient
getConditionForNutrient("vitamin_d", ["PCOS", "PCOD"])
→ "PCOS" (or "PCOD" - first match)
```

### In useConditionBasedNutrients.ts

```typescript
// Hook usage
const { 
  conditions,     // ["Anemia", "PCOS"]
  nutrientIds,    // ["iron", "vitamin_d"]
  configs,        // Full config objects
  foods,          // Aggregated foods
  isActive,       // boolean - maternity phase only
  getModifier,    // (nutrientId) => weight boost
  getConditionLabel // (nutrientId) => condition name
} = useConditionBasedNutrients();
```

---

## DATA MAPPINGS (Spec Reference)

### Condition → Nutrient
| Condition | Nutrient | Nutrient ID |
|-----------|----------|-------------|
| Hypothyroidism | Iodine | `iodine` |
| Hyperthyroidism | Calcium | `calcium` |
| PCOD | Vitamin D | `vitamin_d` |
| PCOS | Vitamin D | `vitamin_d` |
| Diabetes | Magnesium | `magnesium` |
| Anemia | Iron | `iron` |
| Osteoporosis | Calcium | `calcium` |

### Foods (Vegetarian + Mixed)

**Anemia (Iron):**
- Veg: Spinach, Dates, Beetroot, Sesame seeds
- Mixed: Red meat, Liver, Eggs

**PCOS (Vitamin D):**
- Veg: Fortified dairy, Mushrooms
- Mixed: Eggs, Tuna, Salmon

**Diabetes (Magnesium):**
- Veg: Spinach, Almonds, Pumpkin seeds
- Mixed: Fish, Chicken

**Osteoporosis (Calcium):**
- Veg: Ragi, Milk, Paneer, Sesame seeds
- Mixed: Sardines, Salmon, Eggs

**Hypothyroidism (Iodine):**
- Veg: Iodized salt, Dairy, Yogurt
- Mixed: Fish, Eggs

**Hyperthyroidism (Calcium):**
- Veg: Ragi, Milk, Paneer, Sesame
- Mixed: Sardines, Salmon, Eggs

**PCOD (Vitamin D):**
- Veg: Fortified milk, Mushrooms
- Mixed: Eggs, Salmon

---

## 4 LOCATIONS ENHANCED

### Location 1: Priority Nutrition Overview
**File:** `src/components/nutrition/PriorityNutritionOverview.tsx`
**What Changed:**
- Added dynamic condition nutrient cards
- Uses `useConditionBasedNutrients` to get configs
- Inserts condition cards if not in stage nutrients
- Badge shows: "Condition Support" (amber)

**User Sees:**
- 4 stage nutrients + condition cards (if any)
- Condition cards show recommended foods
- Condition cards have amber badge

### Location 2: Top Deficiency Insights
**File:** `src/components/nutrition/DeficiencyInsightsSection.tsx`
**What Changed:**
- Added "Condition-Linked Nutritional Support" section
- Positioned after "Top Deficiency Insights"
- Shows all condition configs
- Includes safety disclaimer

**User Sees:**
- New amber section if conditions exist
- Condition nutrient cards with foods
- Supportive language (not diagnostic)

### Location 3: Food Guidance
**File:** `src/pages/nutrition/NutritionIntelligencePage.tsx`
**What Changed:**
- Added intro text about conditions
- Positioned before "Nutritional Highlights"
- Shows which conditions are active
- Explains food emphasis

**User Sees:**
- Blue/amber box with condition message
- "Based on your selected conditions (Anemia, PCOS)..."
- Food recommendations naturally emphasize condition nutrients

### Location 4: Daily Meal Plan
**File:** `src/pages/nutrition/NutritionIntelligencePage.tsx` + `src/lib/nutrition/dietGenerator.ts`
**What Changed:**
- Updated `dietInput.deficiencies` to include condition nutrients
- Meals now prioritize condition-linked foods
- No UI changes (uses existing meal display)

**User Sees:**
- More iron foods in meals if Anemia selected
- More calcium foods if Osteoporosis selected
- More Vitamin D foods if PCOS selected
- Meals adapt automatically

---

## ACTIVATION LOGIC

```typescript
// Maternity-only safeguard
const isActive = 
  phase === "maternity" &&           // Only during maternity
  mode !== "postpartum" &&            // NOT after delivery
  mode !== "premature";               // NOT premature care

// If not active: return empty object
if (!isActive) {
  return {
    conditions: [],
    nutrientIds: [],
    configs: [],
    foods: [],
    isActive: false,
    getModifier: () => 0,
    getConditionLabel: () => null
  };
}
```

### Protection Matrix

| Phase | Mode | Active? |
|-------|------|---------|
| maternity | pregnancy | ✅ YES |
| maternity | postpartum | ❌ NO |
| maternity | premature | ❌ NO |
| puberty | any | ❌ NO |
| menopause | any | ❌ NO |
| family-planning | any | ❌ NO |

---

## TESTING QUICK START

### 5-Minute Smoke Test
1. Create maternity profile with "Anemia" selected
2. Go to Nutrition Intelligence page
3. ✅ See Iron card in Priority Nutrition (amber badge)
4. ✅ See iron foods in Nutritional Highlights
5. ✅ See "Condition-Linked Nutritional Support" in Deficiency Insights
6. ✅ See condition message before "Nutritional Highlights"
7. Switch to puberty phase
8. ✅ Verify NO condition cards appear
9. Done!

### Full Test Coverage
See: `CONDITION_NUTRITION_TESTING.md` (43 test cases)

---

## LANGUAGE & SAFETY

### ✅ Allowed Language
- "support"
- "may require"
- "associated with"
- "priority nutrition"
- "recommended foods"
- "consult healthcare provider"

### ❌ Forbidden Language
- "deficiency" (use "support" instead)
- "diagnosis"
- "treatment"
- "must"
- "cure"
- "proven"

### ✅ Always Include
- Disclaimer: "Based on your selected conditions..."
- Caveat: "...not a substitute for medical advice"
- CTA: "Consult your healthcare provider"

---

## DEBUGGING TIPS

**Condition cards not showing?**
1. Check medical conditions in profile
2. Verify phase === "maternity"
3. Check browser console for errors
4. Clear cache + refresh

**Foods not matching spec?**
1. Check CONDITION_NUTRIENT_MAP
2. Verify diet preference is set
3. Check aggregateConditionFoods function
4. Verify deduplicated correctly

**Layout broken?**
1. Check Tailwind CSS loaded
2. Verify grid classes: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
3. Check for CSS conflicts
4. Test on different screen sizes

**Performance issues?**
1. Check useMemo dependencies
2. Verify no infinite loops
3. Profile with DevTools
4. Check for memory leaks

---

## COMPILATION STATUS

✅ All 5 files compile without errors
✅ No TypeScript errors
✅ All imports resolve
✅ Ready for testing

---

## BACKWARD COMPATIBILITY

✅ Works with/without conditions
✅ No props changed
✅ No API changes
✅ No database changes
✅ Other phases unaffected
✅ Existing tests still pass

---

## KEY STATISTICS

| Metric | Value |
|--------|-------|
| **Files Created** | 2 |
| **Files Modified** | 3 |
| **Lines Added** | ~500 |
| **Breaking Changes** | 0 |
| **New Dependencies** | 0 |
| **Conditions Supported** | 7 |
| **Foods Mapped** | 50+ |
| **Test Cases** | 43 |
| **Compilation Errors** | 0 |

---

## QUICK LINKS

- **Main Architecture:** [CONDITION_NUTRITION_ARCHITECTURE.md](CONDITION_NUTRITION_ARCHITECTURE.md)
- **Testing Guide:** [CONDITION_NUTRITION_TESTING.md](CONDITION_NUTRITION_TESTING.md)
- **Condition Mapping:** `src/lib/nutrition/conditionNutrientMapping.ts`
- **Hook Implementation:** `src/hooks/useConditionBasedNutrients.ts`

---

**Ready?** → Start with the 5-minute smoke test above!
