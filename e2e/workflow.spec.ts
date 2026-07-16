import { expect, test } from "@playwright/test";

test.describe("LootSignal core workflows", () => {
  test("rankings → filter Sony family → select two franchises → compare", async ({ page }) => {
    await page.goto("/rankings");
    await expect(page.getByRole("heading", { name: "Franchise Rankings" })).toBeVisible();

    // Filter ownership to Sony / PlayStation-led.
    await page.getByRole("combobox", { name: "Ownership" }).click();
    await page.getByRole("option", { name: "Sony / PlayStation-led" }).click();
    await expect(page).toHaveURL(/own=sony-family/);
    // Non-Sony franchises are filtered out.
    await expect(page.getByRole("link", { name: "Resident Evil" })).toHaveCount(0);

    // Select Helldivers 2 and Astro Bot for comparison.
    await page.getByRole("checkbox", { name: "Select Helldivers 2 for comparison" }).click();
    await page.getByRole("checkbox", { name: "Select Astro Bot for comparison" }).click();

    // Open the comparison.
    await page.getByRole("link", { name: "Open comparison" }).click();
    await expect(page).toHaveURL(/\/compare\?f=/);
    await expect(page.getByRole("heading", { name: "Recommendation summary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Helldivers 2", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Astro Bot", exact: true })).toBeVisible();
  });

  test("forecast lab → family gifting preset → Astro Bot rises → export scenario", async ({
    page,
  }) => {
    await page.goto("/forecast");
    await expect(page.getByRole("heading", { name: "Forecast Lab" })).toBeVisible();

    // Default (research model): Astro Bot sits at its seed rank 4.
    const astroRow = page.getByTestId("scenario-row-astro-bot");
    await expect(astroRow).toHaveAttribute("data-rank", "4");

    // Apply the Family gifting preset — Astro Bot must rise.
    await page.getByTestId("preset-family-gifting").click();
    const newRank = Number(await astroRow.getAttribute("data-rank"));
    expect(newRank).toBeLessThan(4);
    expect(newRank).toBeGreaterThan(0);

    // Export the scenario as JSON.
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-scenario").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/lootsignal-scenario-.*\.json/);
  });
});
