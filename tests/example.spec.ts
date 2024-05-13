import { test, expect } from "@playwright/test";

test("Google Loads", async ({ page }) => {
  test.info().annotations.push({
    type: "jiraKey",
    description: "UMS-2147",
  });

  await page.goto("https://google.com");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Google/);
});

test("Can search for random string", async ({ page }) => {
  test.info().annotations.push({
    type: "jiraKey",
    description: "UMS-2148",
  });
  await page.goto("https://google.com");

  // Generate random string.
  const randomString = Math.random().toString(36).substring(7);
  // Enter text into the google search bar
  await page.getByLabel("Search", { exact: true }).fill(randomString);
  // Keyboard press Enter.
  await page.keyboard.press("Enter");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(randomString + " - Google Search");
});

test("big failure", async ({ page }) => {
  test.info().annotations.push({
    type: "jiraKey",
    description: "UMS-2148",
  });
  expect(false).toBe(true);
});

test("total failure", async ({ page }) => {
  test.info().annotations.push({
    type: "jiraKey",
    description: "UMS-2148",
  });
  expect(1).toBe(2);
});
