import * as fs from "fs";
import * as path from "path";

async function debugScraper() {
  try {
    console.log("Fetching changelog HTML for debugging...");

    const response = await fetch("https://anara.com/changelog");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();

    // Save the raw HTML for inspection
    const htmlPath = path.join(process.cwd(), "public", "changelog-raw.html");
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ Raw HTML saved to ${htmlPath}`);

    // Extract a sample section for analysis
    const datePattern =
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/g;
    const firstMatch = html.match(datePattern);

    if (firstMatch) {
      const startIndex = html.indexOf(firstMatch[0]);
      const sampleSection = html.substring(startIndex, Math.min(startIndex + 5000, html.length));

      // Save sample section
      const samplePath = path.join(process.cwd(), "public", "changelog-sample.html");
      fs.writeFileSync(samplePath, sampleSection);
      console.log(`✅ Sample section saved to ${samplePath}`);

      // Look for common patterns
      console.log("\n📊 HTML Structure Analysis:");
      console.log("================================");

      // Check for heading tags
      const headings = sampleSection.match(/<h[1-6][^>]*>/gi) || [];
      console.log(`Heading tags found: ${headings.length}`);
      if (headings.length > 0) {
        console.log("Sample headings:", headings.slice(0, 3));
      }

      // Check for list structures
      const lists = sampleSection.match(/<ul[^>]*>/gi) || [];
      console.log(`\nUnordered lists found: ${lists.length}`);

      const listItems = sampleSection.match(/<li[^>]*>/gi) || [];
      console.log(`List items found: ${listItems.length}`);

      // Check for div/section structures
      const divs = sampleSection.match(/<div[^>]*class="[^"]*"[^>]*>/gi) || [];
      console.log(`\nDivs with classes: ${divs.length}`);
      if (divs.length > 0) {
        console.log("Sample div classes:", divs.slice(0, 3));
      }

      // Check for article tags
      const articles = sampleSection.match(/<article[^>]*>/gi) || [];
      console.log(`Article tags found: ${articles.length}`);

      // Check for specific keywords
      console.log("\n📝 Content Markers:");
      console.log("================================");
      console.log(
        `"Improvements" found: ${(sampleSection.match(/improvements/gi) || []).length} times`,
      );
      console.log(
        `"Fixes" or "Bugs" found: ${(sampleSection.match(/fixes|bugs/gi) || []).length} times`,
      );

      // Check for paragraph structures
      const paragraphs = sampleSection.match(/<p[^>]*>/gi) || [];
      console.log(`\nParagraph tags found: ${paragraphs.length}`);

      // Look for potential CSS classes that might help
      const classMatches = sampleSection.match(/class="([^"]*)"/gi) || [];
      const uniqueClasses = new Set(classMatches.map((c) => c.replace(/class="|"/g, "")));
      console.log(`\nUnique CSS classes found: ${uniqueClasses.size}`);
      if (uniqueClasses.size > 0) {
        console.log("Sample classes:", Array.from(uniqueClasses).slice(0, 10));
      }
    }

    console.log("\n💡 Suggestions:");
    console.log("================================");
    console.log("1. Check public/changelog-raw.html for the full HTML");
    console.log("2. Check public/changelog-sample.html for a sample section");
    console.log("3. Look for consistent patterns in the HTML structure");
    console.log("4. Consider using a proper HTML parser like cheerio for better extraction");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugScraper();
