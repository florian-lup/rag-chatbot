import * as fs from "fs";
import * as path from "path";

async function debugScraper() {
  try {
    const response = await fetch("https://docs.anara.com/get-started/");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();

    // Ensure public/guides directory exists
    const guidesDir = path.join(process.cwd(), "public", "guides");
    if (!fs.existsSync(guidesDir)) {
      fs.mkdirSync(guidesDir, { recursive: true });
    }

    // Save the raw HTML for inspection
    const htmlPath = path.join(guidesDir, "docs-raw.html");
    fs.writeFileSync(htmlPath, html);

    // Extract a sample section for analysis - look for main content
    const mainContentPattern =
      /<main[^>]*>|<article[^>]*>|class="[^"]*content[^"]*"|id="[^"]*content[^"]*"/gi;
    const contentMatches = html.match(mainContentPattern);

    let sampleSection = html;
    if (contentMatches && contentMatches.length > 0) {
      // Try to find the main content area
      const firstContentMatch = contentMatches[0];
      const startIndex = html.indexOf(firstContentMatch);
      if (startIndex !== -1) {
        sampleSection = html.substring(startIndex, Math.min(startIndex + 8000, html.length));
      }
    } else {
      // Fallback: get first 8000 characters
      sampleSection = html.substring(0, Math.min(8000, html.length));
    }

    // Save sample section
    const samplePath = path.join(guidesDir, "docs-sample.html");
    fs.writeFileSync(samplePath, sampleSection);

    // Look for common patterns

    // Check for heading tags
    const headings = sampleSection.match(/<h[1-6][^>]*>/gi) || [];
    if (headings.length > 0) {
      // console.log("Sample headings:", headings.slice(0, 5));
    }

    // Check for list structures
    const lists = sampleSection.match(/<ul[^>]*>/gi) || [];
    // console.log(`\nUnordered lists found: ${lists.length}`);

    const listItems = sampleSection.match(/<li[^>]*>/gi) || [];
    // console.log(`List items found: ${listItems.length}`);

    // Check for div/section structures
    const divs = sampleSection.match(/<div[^>]*class="[^"]*"[^>]*>/gi) || [];
    if (divs.length > 0) {
      // console.log("Sample div classes:", divs.slice(0, 5));
    }

    // Check for article/main/section tags
    const articles = sampleSection.match(/<(article|main|section)[^>]*>/gi) || [];
    // console.log(`Article/main/section tags found: ${articles.length}`);

    // Check for navigation elements
    const navs = sampleSection.match(/<nav[^>]*>/gi) || [];
    // console.log(`Navigation elements found: ${navs.length}`);

    // Check for specific documentation keywords

    console.log(
      `"Get started" found: ${(sampleSection.match(/get started/gi) || []).length} times`,
    );
    console.log(
      `"Documentation" found: ${(sampleSection.match(/documentation/gi) || []).length} times`,
    );
    console.log(
      `"Tutorial" or "Guide" found: ${(sampleSection.match(/tutorial|guide/gi) || []).length} times`,
    );
    console.log(`"API" found: ${(sampleSection.match(/\bapi\b/gi) || []).length} times`);

    // Check for paragraph structures
    const paragraphs = sampleSection.match(/<p[^>]*>/gi) || [];
    // console.log(`\nParagraph tags found: ${paragraphs.length}`);

    // Check for code blocks
    const codeBlocks = sampleSection.match(/<code[^>]*>|<pre[^>]*>/gi) || [];
    // console.log(`Code blocks found: ${codeBlocks.length}`);

    // Look for potential CSS classes that might help
    const classMatches = sampleSection.match(/class="([^"]*)"/gi) || [];
    const uniqueClasses = new Set(classMatches.map((c) => c.replace(/class="|"/g, "")));
    if (uniqueClasses.size > 0) {
      // console.log("Sample classes:", Array.from(uniqueClasses).slice(0, 15));
    }

    // Look for data attributes
    const dataAttrs = sampleSection.match(/data-[a-zA-Z-]+="[^"]*"/gi) || [];
    const uniqueDataAttrs = new Set(dataAttrs.map((attr) => attr.split("=")[0]));
    if (uniqueDataAttrs.size > 0) {
      // console.log("Sample data attributes:", Array.from(uniqueDataAttrs).slice(0, 10));
    }

    console.log("\n💡 Suggestions:");
    console.log("================================");
    console.log("1. Check public/guides/docs-raw.html for the full HTML");
    console.log("2. Check public/guides/docs-sample.html for a sample section");
    console.log("3. Look for consistent patterns in the documentation structure");
    console.log("4. Consider using a proper HTML parser like cheerio for better extraction");
    console.log("5. Look for navigation structure to understand docs organization");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugScraper();
