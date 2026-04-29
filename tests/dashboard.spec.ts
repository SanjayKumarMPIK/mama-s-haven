import { test, expect } from '@playwright/test';

test('capture dashboard screenshot to see error overlay', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  await page.evaluate(() => {
    const today = new Date();
    // 38 weeks pregnant
    const lmp = new Date(today.getTime() - (38 * 7 * 24 * 60 * 60 * 1000));
    const edd = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
    
    localStorage.setItem('mh-profile', JSON.stringify({
      name: "Test User",
      lmp: lmp.toISOString().slice(0, 10),
      calculatedEDD: edd.toISOString().slice(0, 10),
      userEDD: "",
      region: "north",
      isSetup: true,
      delivery: { isDelivered: false, birthDate: "", weeksAtBirth: 0, birthWeight: null },
      deliveryTransitionCompleted: false,
      gdmStatus: null,
      gttQuestionCompleted: false,
      dueDate: edd.toISOString().slice(0, 10)
    }));
    localStorage.setItem('mh-phase', '"maternity"');
  });

  await page.goto('http://localhost:8080/pregnancy-dashboard');
  await page.waitForTimeout(3000);
  
  // capture the text content of the body just in case it's an error overlay
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:', text.substring(0, 500));
});
