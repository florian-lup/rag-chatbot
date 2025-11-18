import * as fs from "fs";
import * as path from "path";
import { ChangelogSection } from "../types/types";

async function scrapeChangelog() {
  try {
    const response = await fetch("https://anara.com/changelog");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();

    const sections = parseChangelogHTML(html);

    // Ensure public/changelog directory exists
    const publicDir = path.join(process.cwd(), "public");
    const changelogDir = path.join(publicDir, "changelog");
    if (!fs.existsSync(changelogDir)) {
      fs.mkdirSync(changelogDir, { recursive: true });
    }

    // Save to JSON file
    const outputPath = path.join(changelogDir, "changelog.json");
    fs.writeFileSync(outputPath, JSON.stringify(sections, null, 2));
  } catch (error) {
    console.error("❌ Error scraping changelog:", error);
    process.exit(1);
  }
}

function parseChangelogHTML(html: string): ChangelogSection[] {
  const sections: ChangelogSection[] = [];

  // Clean up the HTML
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Find all date patterns
  const datePattern =
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/g;
  const dateMatches = Array.from(html.matchAll(datePattern));

  if (dateMatches.length === 0) {
    console.warn("No date patterns found in changelog");
    return sections;
  }

  // Process each changelog entry
  for (let i = 0; i < dateMatches.length; i++) {
    const date = dateMatches[i][0];
    const startIndex = dateMatches[i].index!;
    const endIndex = i < dateMatches.length - 1 ? dateMatches[i + 1].index! : html.length;

    // Get the section HTML
    const sectionHtml = html.substring(startIndex, endIndex);

    // Extract title from h1 tag
    let title = "";
    const titleMatch = sectionHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      title = decodeHTMLEntities(cleanText(titleMatch[1]));
    }

    // Extract content paragraphs (before Improvements/Bugs sections)
    const contentParagraphs: string[] = [];

    // Split content to get the part before improvements/fixes
    const beforeImprovements = sectionHtml.split(/<h4[^>]*>Improvements<\/h4>/i)[0];

    // Find all paragraphs with the specific class pattern
    const paragraphMatches = beforeImprovements.match(
      /<p[^>]*class="[^"]*leading-\[21\.6px\][^"]*"[^>]*>([^<]+)<\/p>/gi,
    );

    if (paragraphMatches) {
      paragraphMatches.forEach((match) => {
        const text = match.replace(/<[^>]*>/g, "");
        const cleaned = decodeHTMLEntities(cleanText(text));
        if (cleaned && cleaned.length > 30 && !cleaned.includes(date)) {
          contentParagraphs.push(cleaned);
        }
      });
    }

    // Extract improvements
    const improvements: string[] = [];
    const improvementsMatch = sectionHtml.match(
      /<h4[^>]*>Improvements<\/h4>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i,
    );
    if (improvementsMatch) {
      const listItems = improvementsMatch[1].match(/<li[^>]*>([^<]+)<\/li>/gi);
      if (listItems) {
        listItems.forEach((item) => {
          const text = item.replace(/<[^>]*>/g, "");
          const cleaned = decodeHTMLEntities(cleanText(text));
          if (cleaned && cleaned.length > 10) {
            improvements.push(cleaned);
          }
        });
      }
    }

    // Extract fixes/bugs
    const fixes: string[] = [];
    const fixesMatch = sectionHtml.match(
      /<h4[^>]*>(?:Bugs|Fixes)<\/h4>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i,
    );
    if (fixesMatch) {
      const listItems = fixesMatch[1].match(/<li[^>]*>([^<]+)<\/li>/gi);
      if (listItems) {
        listItems.forEach((item) => {
          const text = item.replace(/<[^>]*>/g, "");
          const cleaned = decodeHTMLEntities(cleanText(text));
          if (cleaned && cleaned.length > 10) {
            fixes.push(cleaned);
          }
        });
      }
    }

    // Only add if we have meaningful content
    if (title || contentParagraphs.length > 0 || improvements.length > 0 || fixes.length > 0) {
      sections.push({
        date,
        title: title || "Update",
        content: contentParagraphs,
        improvements,
        fixes,
      });
    }
  }

  return sections;
}

function cleanText(text: string): string {
  // Remove extra whitespace
  text = text.replace(/\s+/g, " ");
  // Trim
  text = text.trim();
  return text;
}

function decodeHTMLEntities(text: string): string {
  // Decode common HTML entities
  const entities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#039;": "'",
    "&nbsp;": " ",
    "&ndash;": "-",
    "&mdash;": "-",
    "&hellip;": "...",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  }

  // Decode numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => String.fromCharCode(parseInt(num)));
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  return decoded;
}

// Run the scraper
scrapeChangelog();
