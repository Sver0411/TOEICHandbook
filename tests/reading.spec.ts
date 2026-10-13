import { test, expect } from "@playwright/test";
test("homepage, word-family search and direct reading links", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "My TOEIC English Handbook",
  );
  await page.locator(".sidebar .search-trigger").click();
  await page.getByRole("textbox", { name: "搜索教材" }).fill("employment");
  const first = page.locator(".search-result").first();
  await expect(first).toContainText("employment");
  for (const word of ["employ", "employee", "employer", "-ment"])
    await expect(
      first.getByRole("link", { name: word, exact: true }),
    ).toBeVisible();
  await first.locator("a").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "employment",
  );
  await expect(page.locator(".connections")).toContainText("-ment");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "employment",
  );
  await expect(page.locator(".prose")).toContainText(
    "The agency offers employment assistance",
  );
  expect(errors).toEqual([]);
});
test("bookmarks, font size and continued reading persist locally", async ({
  page,
}) => {
  await page.goto("/read/operate/");
  await page.getByRole("button", { name: "加入书签", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "已加入书签" })).toBeVisible();
  await page.getByRole("button", { name: "放大正文字号" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveCSS("--reading-size", "20px");
  await page.goto("/library/");
  await page.getByRole("button", { name: "我的书签" }).click();
  await expect(page.locator(".entry-row")).toHaveCount(1);
  await expect(page.locator(".entry-row")).toContainText("operate");
  await page.goto("/");
  await expect(page.getByRole("link", { name: /继续阅读/ })).toHaveAttribute(
    "href",
    "/read/operate/",
  );
});
test("Markdown tables, highlights, folding and outline anchors", async ({
  page,
}) => {
  await page.goto("/read/word-building/");
  await expect(page.locator(".prose table")).toBeVisible();
  for (const link of await page.locator(".page-outline>a").all()) {
    const href = await link.getAttribute("href");
    expect(await page.locator(`[id="${href!.slice(1)}"]`).count()).toBe(1);
  }
  await page.goto("/read/ment/");
  await expect(page.locator(".prose mark")).toBeVisible();
  await page.goto("/read/operate/");
  await page.locator(".prose summary").click();
  await expect(page.locator(".prose details")).toHaveAttribute("open", "");
});
test("desktop chapter navigation and entry lists are direct", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".sidebar .chapter-link")
    .filter({ hasText: "英语时态系统" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "英语时态系统",
  );
  await page
    .locator(".chapter-entries .entry-row")
    .filter({ hasText: "现在完成时" })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "现在完成时",
  );
});
test("search handles Chinese, keyboard dismissal and no results", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "搜索教材" }).fill("不可数");
  await expect(page.locator(".search-results")).toContainText("equipment");
  await page.getByRole("textbox", { name: "搜索教材" }).fill("zzzz-no-match");
  await expect(page.locator(".search-results")).toContainText("没有找到");
  await page.keyboard.press("Escape");
  await expect(page.locator(".search-dialog")).not.toBeVisible();
});
