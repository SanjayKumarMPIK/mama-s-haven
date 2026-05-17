# VALIDATION & TESTING CHECKLIST
# Condition-Based Nutrient Deficiency Intelligence

---

## PART 1: FUNCTIONAL VALIDATION

### Location 1: Priority Nutrition Overview ✅

**Test Case 1.1: Without Conditions**
- [ ] Login to maternity phase WITHOUT selecting medical conditions
- [ ] Navigate to Nutrition Intelligence page
- [ ] Verify: PriorityNutritionOverview shows 4 stage-specific nutrients
- [ ] Verify: All badges show "Top Priority (Symptom + Stage)" or "Stage Priority"
- [ ] Verify: No extra condition cards appear

**Test Case 1.2: With Single Condition (Anemia)**
- [ ] Login to maternity phase
- [ ] Go to Profile → Medical Conditions
- [ ] Select "Anemia"
- [ ] Navigate to Nutrition Intelligence page
- [ ] Verify: Iron card appears (if not already in stage nutrients)
- [ ] Verify: Iron card shows "Condition Support: Anemia" badge (amber)
- [ ] Verify: Iron description reflects condition awareness
- [ ] Verify: Top sources include: Spinach, Dates, Beetroot, Sesame

**Test Case 1.3: With Multiple Conditions**
- [ ] Select: Anemia + PCOS + Osteoporosis
- [ ] Navigate to Nutrition Intelligence page
- [ ] Verify: 3 condition cards appear (Iron, Vitamin D, Calcium)
- [ ] Verify: Each shows correct "Condition Support" badge
- [ ] Verify: Total cards = 4 stage + condition cards (may deduplicate if overlap)

**Test Case 1.4: Condition Overlapping with Stage Nutrients**
- [ ] Select: Osteoporosis (maps to Calcium)
- [ ] Navigate to Nutrition Intelligence page
- [ ] Verify: Calcium appears only ONCE (not duplicated)
- [ ] Verify: Calcium badge shows "Condition Support" or merged state
- [ ] Verify: No duplicate cards

**Test Case 1.5: Responsive Layout**
- [ ] View on mobile (< 640px)
- [ ] Verify: Grid switches to 1 column (not broken)
- [ ] View on tablet (640px - 1024px)
- [ ] Verify: Grid shows 2 columns
- [ ] View on desktop (> 1024px)
- [ ] Verify: Grid shows 4 columns

---

### Location 2: Top Deficiency Insights ✅

**Test Case 2.1: Without Conditions**
- [ ] Login to maternity phase WITHOUT conditions
- [ ] Navigate to Deficiency Insights section
- [ ] Verify: Only symptom-based deficiency cards appear
- [ ] Verify: NO "Condition-Linked Nutritional Support" section visible

**Test Case 2.2: With Single Condition**
- [ ] Select: Anemia
- [ ] Log some symptoms (fatigue, dizziness) to trigger insights
- [ ] Navigate to Deficiency Insights section
- [ ] Verify: "Condition-Linked Nutritional Support" section appears below "Top Deficiency Insights"
- [ ] Verify: Iron card appears in condition section
- [ ] Verify: Shows:
  - [ ] Emoji: 🩸
  - [ ] Title: "Iron Nutritional Support"
  - [ ] Description: References thyroid function/blood production
  - [ ] Foods: Spinach, Dates, Beetroot, Sesame (vegetarian)

**Test Case 2.3: Condition Foods Respect Diet Preference**
- [ ] Create profile with Anemia + vegetarian diet
- [ ] Check condition foods: Should show vegetarian list (no red meat)
- [ ] Create profile with Anemia + mixed diet
- [ ] Check condition foods: Should show mixed list (red meat, liver, eggs)

**Test Case 2.4: Multiple Conditions in Insights**
- [ ] Select: PCOS + Diabetes
- [ ] Navigate to Deficiency Insights
- [ ] Verify: TWO condition support cards appear
- [ ] Verify: Vitamin D card + Magnesium card both visible

**Test Case 2.5: Safety Disclaimer**
- [ ] Check condition support section
- [ ] Verify: Contains disclaimer: "These are supportive nutrition recommendations..."
- [ ] Verify: Language uses "support" NOT "treatment"

---

### Location 3: Food Guidance (Nutritional Highlights) ✅

**Test Case 3.1: Condition Guidance Text**
- [ ] Select: Anemia
- [ ] Navigate to Nutrition Intelligence page
- [ ] Click "Tips" tab
- [ ] Verify: Before "Nutritional Highlights", a box appears:
  - [ ] Text: "Based on your selected conditions (Anemia), the food recommendations below emphasize supportive nutrients throughout your pregnancy."
- [ ] Verify: Box has amber/condition color scheme

**Test Case 3.2: Without Conditions**
- [ ] Remove all conditions from profile
- [ ] Navigate to Nutrition Intelligence page
- [ ] Verify: NO condition guidance box appears
- [ ] Verify: Nutritional Highlights shows normally

**Test Case 3.3: Nutritional Highlights Include Condition Foods**
- [ ] Select: Anemia
- [ ] Navigate to Nutrition Intelligence page
- [ ] Check "Nutritional Highlights" list
- [ ] Verify: Highlights mention iron-supportive foods naturally
- [ ] Example expected: "Iron-rich foods like spinach and dates are essential..."

---

### Location 4: Daily Meal Plan (Meal Generation) ✅

**Test Case 4.1: Meals Include Condition-Linked Foods**
- [ ] Select: Anemia
- [ ] Scroll to "Recommended Foods" section
- [ ] Verify: More iron-rich foods appear:
  - [ ] Spinach
  - [ ] Dates
  - [ ] Lentils
  - [ ] Beetroot

**Test Case 4.2: Without Conditions**
- [ ] Remove conditions
- [ ] Check "Recommended Foods"
- [ ] Verify: Standard trimester-based foods (not condition-specific)

**Test Case 4.3: Multiple Condition Foods**
- [ ] Select: Anemia + PCOS
- [ ] Check "Recommended Foods"
- [ ] Verify: Mix of iron foods + Vitamin D foods
  - [ ] Iron: Spinach, Dates, Beetroot
  - [ ] Vitamin D: Eggs, Fortified milk, Mushrooms
  - [ ] No duplicates

**Test Case 4.4: Region-Aware**
- [ ] Set region: North
- [ ] Select: Anemia
- [ ] Check meals: Should include North Indian staples + iron foods
  - [ ] Expected: Roti with Spinach, Dal, Lentils
- [ ] Change region: South
- [ ] Check meals: Should include South Indian staples + iron foods
  - [ ] Expected: Idli with Iron supplement, Sambar with lentils

---

## PART 2: MATERNITY-ONLY SAFEGUARD VALIDATION

### Test Case 5.1: Puberty Phase (NO Condition Logic)
- [ ] Switch to puberty phase
- [ ] Select: Anemia
- [ ] Navigate to nutrition page
- [ ] Verify: NO condition cards appear
- [ ] Verify: NO "Condition-Linked Nutritional Support" section
- [ ] Verify: Standard puberty nutrition shows

### Test Case 5.2: Menopause Phase (NO Condition Logic)
- [ ] Switch to menopause phase
- [ ] Select: PCOS (if profile allows)
- [ ] Navigate to nutrition page
- [ ] Verify: NO condition intelligence injected
- [ ] Verify: Standard menopause nutrition shows

### Test Case 5.3: Family Planning Phase (NO Condition Logic)
- [ ] Switch to family planning phase
- [ ] Select: Diabetes
- [ ] Navigate to nutrition page
- [ ] Verify: NO condition cards or sections visible
- [ ] Verify: Standard family planning nutrition shows

### Test Case 5.4: Pregnancy → Postpartum (Toggle Off)
- [ ] During pregnancy with Anemia selected:
  - [ ] Verify condition cards appear
- [ ] Deliver baby (switch to postpartum mode)
- [ ] Navigate to nutrition page
- [ ] Verify: Condition cards DISAPPEAR
- [ ] Verify: Postpartum nutrition shows instead
- [ ] Verify: Condition logic OFF during postpartum

### Test Case 5.5: Premature Birth (Toggle Off)
- [ ] Switch to premature mode with conditions selected
- [ ] Navigate to nutrition page
- [ ] Verify: Condition logic OFF
- [ ] Verify: Premature care nutrition shows

---

## PART 3: REGRESSION TESTING

### Test Case 6.1: Existing Symptom Scoring Unchanged
- [ ] Log symptoms: Fatigue, dizziness, nausea
- [ ] WITH conditions selected: Check deficiency scores
- [ ] WITHOUT conditions: Check deficiency scores
- [ ] Verify: Symptom-based scores are identical
- [ ] Verify: Condition ADDS to the results, doesn't modify base scores

### Test Case 6.2: Meal Generation Stability
- [ ] Generate meal plans with different settings:
  - [ ] No conditions → Check meals are valid
  - [ ] With conditions → Check meals are valid
  - [ ] Multiple regions → Check regional meals preserved
- [ ] Verify: All meals format correctly
- [ ] Verify: No null/undefined meals

### Test Case 6.3: UI Layout Stability
- [ ] Navigate through all nutrition pages
- [ ] Verify: No layout shifts or breaks
- [ ] Verify: No missing borders/colors
- [ ] Verify: Typography consistent

### Test Case 6.4: Analytics/Logging Unaffected
- [ ] Check browser console for errors
- [ ] Verify: No new error logs from condition logic
- [ ] Verify: Analytics continue working

### Test Case 6.5: Profile Changes Sync
- [ ] Add condition → Refresh page → Verify condition cards appear
- [ ] Remove condition → Refresh page → Verify condition cards disappear
- [ ] Change diet preference → Verify foods update accordingly

---

## PART 4: EDGE CASES & ERROR HANDLING

### Test Case 7.1: No Medical Conditions Selected
- [ ] Keep medical conditions empty/null
- [ ] Navigate to all nutrition pages
- [ ] Verify: Works gracefully, no crashes
- [ ] Verify: Standard nutrition shows

### Test Case 7.2: Invalid/Unknown Condition
- [ ] If possible, manually insert invalid condition
- [ ] Verify: Gracefully skipped (no error)
- [ ] Verify: Valid conditions still work

### Test Case 7.3: Missing Profile Data
- [ ] Clear some profile data (region, diet preference)
- [ ] With conditions selected
- [ ] Verify: Falls back to defaults gracefully
- [ ] Verify: Nutrition still renders

### Test Case 7.4: Very Long Condition List
- [ ] Select ALL 7 conditions at once
- [ ] Navigate to nutrition page
- [ ] Verify: All condition cards appear
- [ ] Verify: No overflow or layout break
- [ ] Verify: Mobile responsive still works

### Test Case 7.5: Rapid Condition Changes
- [ ] Quickly select/deselect conditions
- [ ] Navigate between pages rapidly
- [ ] Verify: No state inconsistency
- [ ] Verify: No duplicate cards

---

## PART 5: CONTENT & WORDING VALIDATION

### Test Case 8.1: Non-Diagnostic Language
- [ ] Check all condition-based text
- [ ] Verify NO text says "You have deficiency"
- [ ] Verify uses: "support", "may require", "associated"
- [ ] Check all disclaimers are present and accurate

### Test Case 8.2: Food Accuracy
- [ ] Verify each condition's food list matches requirements:
  - [ ] Anemia: Spinach ✓, Dates ✓, Beetroot ✓, Sesame ✓
  - [ ] Osteoporosis: Ragi ✓, Milk ✓, Paneer ✓, Sesame ✓
  - [ ] PCOS: Fortified milk ✓, Mushrooms ✓, Eggs ✓
  - [ ] Diabetes: Spinach ✓, Almonds ✓, Pumpkin seeds ✓
  - [ ] Hypothyroidism: Iodized salt ✓, Dairy ✓, Yogurt ✓
  - [ ] Hyperthyroidism: Ragi ✓, Milk ✓, Paneer ✓
  - [ ] PCOD: Fortified milk ✓, Mushrooms ✓, Eggs ✓

### Test Case 8.3: Descriptions Accurate
- [ ] Check each condition nutrient description
- [ ] Verify: Medically sound but not diagnostic
- [ ] Verify: Pregnancy-relevant context

---

## PART 6: PERFORMANCE & QUALITY

### Test Case 9.1: No Console Errors
- [ ] Open browser DevTools
- [ ] Navigate through all condition-based flows
- [ ] Verify: NO errors, warnings about undefined/null
- [ ] Verify: NO React hook warnings

### Test Case 9.2: Page Load Time
- [ ] Measure Nutrition Intelligence page load with conditions
- [ ] Measure without conditions
- [ ] Verify: Times similar (no performance regression)
- [ ] Verify: Meals render within 500ms

### Test Case 9.3: Memory/Leaks
- [ ] Open page with conditions
- [ ] Close page
- [ ] Open again repeatedly (5× times)
- [ ] Verify: Memory doesn't grow excessively
- [ ] Verify: No memory leak indicators

### Test Case 9.4: Accessibility
- [ ] Navigate with keyboard only
- [ ] Verify: All condition cards/buttons reachable
- [ ] Verify: Screen reader friendly (check alt text)
- [ ] Check: Color contrast on badges

---

## PART 7: USER ACCEPTANCE CRITERIA

**Condition Selection to Display:**
- [ ] User selects medical condition in profile
- [ ] Immediately see "Condition Support" badges in nutrition overview
- [ ] See condition-specific foods in recommendations
- [ ] Meal plans automatically adapt

**Safe & Non-Diagnostic:**
- [ ] Never claims "diagnosis"
- [ ] Uses supportive language throughout
- [ ] Includes clear disclaimers
- [ ] Mentions consulting healthcare provider

**Seamless Integration:**
- [ ] Condition logic ONLY in maternity phase
- [ ] Other phases completely unaffected
- [ ] UI layout exactly same, just extended content
- [ ] No performance impact

**Data Accuracy:**
- [ ] Food recommendations match spec table
- [ ] Nutrient mappings correct
- [ ] Descriptions align with conditions

---

## TESTING CHECKLIST SUMMARY

| Test Area | Tests | Status |
|-----------|-------|--------|
| **Location 1: Priority Nutrition** | 5 | ▢▢▢▢▢ |
| **Location 2: Deficiency Insights** | 5 | ▢▢▢▢▢ |
| **Location 3: Food Guidance** | 3 | ▢▢▢ |
| **Location 4: Meal Plans** | 4 | ▢▢▢▢ |
| **Maternity Safeguard** | 5 | ▢▢▢▢▢ |
| **Regression Tests** | 5 | ▢▢▢▢▢ |
| **Edge Cases** | 5 | ▢▢▢▢▢ |
| **Content Validation** | 3 | ▢▢▢ |
| **Performance** | 4 | ▢▢▢▢ |
| **User Acceptance** | 4 | ▢▢▢▢ |
| **TOTAL** | **43** | **▢▢▢...** |

---

## APPROVAL SIGN-OFF

**Development Complete:** ✅
**Code Compilation:** ✅ (All 5 files)
**Type Safety:** ✅ (No TS errors)
**Integration:** ✅ (4 locations updated)
**Maternity Safeguard:** ✅ (Phase checks in place)
**No Breaking Changes:** ✅ (Backward compatible)

**Ready for Testing:** ✅

---

## QUICK TEST FLOW (5-minute smoke test)

1. Create maternity profile with Anemia selected
2. Go to Nutrition Intelligence page
3. Verify Iron card appears with "Condition Support" badge
4. Check Deficiency Insights: See "Condition-Linked Nutritional Support" section
5. Check Recommended Foods: More iron-rich foods visible
6. Switch to puberty: Condition logic disappears
7. ✅ All 4 locations working

---

**Contact:** If any test fails, check the implementation files:
- `src/lib/nutrition/conditionNutrientMapping.ts`
- `src/hooks/useConditionBasedNutrients.ts`
- `src/components/nutrition/PriorityNutritionOverview.tsx`
- `src/pages/nutrition/NutritionIntelligencePage.tsx`
- `src/components/nutrition/DeficiencyInsightsSection.tsx`
