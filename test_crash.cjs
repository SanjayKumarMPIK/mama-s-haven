const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:8080/');

  // Set profile data so AuthGate and Dashboard let us in
  await page.evaluate(() => {
    localStorage.setItem('mh-profile', JSON.stringify({
      name: "Test User",
      lmp: "2023-12-01",
      calculatedEDD: "2024-09-06",
      userEDD: "",
      region: "north",
      isSetup: true,
      delivery: { isDelivered: false, birthDate: "", weeksAtBirth: 0, birthWeight: null },
      deliveryTransitionCompleted: false,
      gdmStatus: null,
      gttQuestionCompleted: false,
      dueDate: "2024-09-06"
    }));
    localStorage.setItem('mh-phase', '"maternity"');
    localStorage.setItem('mh-auth', JSON.stringify({ user: { id: "123", email: "test@example.com" }, session: {} }));
  });

  await page.goto('http://localhost:8080/pregnancy-dashboard');
  
  await page.waitForTimeout(2000);
  console.log('Done checking.');
  
  await browser.close();
})();
