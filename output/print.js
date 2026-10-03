const { chromium } = require("playwright");
(async () => {
  const [html, pdf] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  await page.goto("file://" + html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log("pdf written", pdf);
})().catch((e) => { console.error(e); process.exit(1); });
