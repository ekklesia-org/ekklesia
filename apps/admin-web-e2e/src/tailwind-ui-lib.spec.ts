import { test, expect } from '@playwright/test';

test('UI library Tailwind CSS classes should be applied', async ({ page }) => {
  // Step 1: Go to login page
  await page.goto('http://localhost:4201/login');
  
  // Step 2: Wait for page to load completely
  await page.waitForLoadState('networkidle');
  
  // Step 3: Query for the .login-card-x element
  const loginCard = page.locator('.login-card-x');
  
  // Wait for the element to be visible
  await expect(loginCard).toBeVisible();
  
  // Step 4: Check if border-radius has a value
  const borderRadius = await loginCard.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.borderRadius;
  });
  
  console.log('Border radius value:', borderRadius);
  
  // Get the raw class attribute to see what classes are applied
  const classAttr = await loginCard.getAttribute('class');
  console.log('Class attribute:', classAttr);
  
  // Check if border-radius is not '0px' or empty
  expect(borderRadius).not.toBe('0px');
  expect(borderRadius).not.toBe('');
  expect(borderRadius).toBeTruthy();
  
  // Additional check: verify if any Tailwind classes are being applied
  const className = await loginCard.getAttribute('class');
  console.log('Element classes:', className);
  
  // Check computed styles for common Tailwind properties
  const styles = await loginCard.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return {
      borderRadius: computedStyle.borderRadius,
      backgroundColor: computedStyle.backgroundColor,
      padding: computedStyle.padding,
      boxShadow: computedStyle.boxShadow,
      display: computedStyle.display,
    };
  });
  
  console.log('Computed styles:', styles);
});
