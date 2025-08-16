import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface DocPage {
  title: string;
  href: string;
  content?: string;
  headings?: string[];
  description?: string;
  category?: string;
}

interface DocCategory {
  group: string;
  pages: DocPage[];
}

interface ScrapedDocs {
  timestamp: string;
  baseUrl: string;
  categories: DocCategory[];
  totalPages: number;
}

// All documentation URLs based on the navigation structure we found
const DOCUMENTATION_STRUCTURE: DocCategory[] = [
  {
    group: "Get started",
    pages: [
      { title: "Welcome", href: "/get-started/welcome" },
      { title: "Concepts", href: "/get-started/core-concepts" },
      { title: "Filetypes", href: "/get-started/anara-filetypes" }
    ]
  },
  {
    group: "Chat",
    pages: [
      { title: "Overview", href: "/chat/chat-overview" },
      { title: "Agents", href: "/chat/chat-agents" },
      { title: "Chat with folders", href: "/chat/chat-with-folders" },
      { title: "Citations", href: "/chat/citations" },
      { title: "Edit sent messages", href: "/chat/edit-sent-messages" },
      { title: "Chat settings", href: "/chat/chat-settings" }
    ]
  },
  {
    group: "Import files",
    pages: [
      { title: "Overview", href: "/import/overview" },
      { title: "Supported file types for import", href: "/import/file-types" },
      { title: "OCR support", href: "/import/ocr-support" }
    ]
  },
  {
    group: "Read",
    pages: [
      { title: "Overview", href: "/read/overview" },
      { title: "Annotate with highlights and comments", href: "/read/annotating" }
    ]
  },
  {
    group: "Write",
    pages: [
      { title: "AI autocomplete", href: "/write/ai-autocomplete" },
      { title: "Citing in Anara", href: "/write/citing" }
    ]
  },
  {
    group: "Sidebars",
    pages: [
      { title: "Left sidebar", href: "/sidebars/left-sidebar" },
      { title: "Right sidebar", href: "/sidebars/right-sidebar" },
      { title: "Notes sidebar", href: "/sidebars/notes-sidebar" }
    ]
  },
  {
    group: "Share",
    pages: [
      { title: "Overview", href: "/share/share-overview" },
      { title: "Creating a share link", href: "/share/creating-a-share-link" },
      { title: "Receiving a share link", href: "/share/receiving-a-share-link" }
    ]
  },
  {
    group: "User interface",
    pages: [
      { title: "Keyboard shortcuts", href: "/user-interface/keyboard-shortcuts" },
      { title: "Themes", href: "/user-interface/themes" }
    ]
  },
  {
    group: "Chrome extension",
    pages: [
      { title: "Overview", href: "/chrome-extension/chrome-overview" }
    ]
  },
  {
    group: "Help and support",
    pages: [
      { title: "Referral program", href: "/help-and-support/referral-program" },
      { title: "Affiliate Program", href: "/help-and-support/affiliate-program" },
      { title: "Accessing your invoice", href: "/help-and-support/invoices" },
      { title: "Refund policy", href: "/help-and-support/refund-policy" },
      { title: "Get in touch", href: "/help-and-support/get-in-touch" }
    ]
  },
  {
    group: "Legal",
    pages: [
      { title: "Security", href: "/legal/security" },
      { title: "Terms & Conditions", href: "/legal/terms" },
      { title: "Privacy Policy", href: "/legal/privacy" }
    ]
  }
];

async function scrapePage(page: any, url: string): Promise<{
  content: string;
  headings: string[];
  description: string;
}> {
  console.log(`  📄 Scraping: ${url}`);
  
  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Wait for content to load
  await page.waitForSelector('.mdx-content, .prose, article, main', {
    timeout: 10000
  }).catch(() => console.log('    ⚠️ Content selector not found, continuing...'));
  
  // Extract the main content
  const pageData = await page.evaluate(() => {
    // Try multiple selectors for content
    const contentSelectors = [
      '.mdx-content',
      '.prose',
      'article',
      'main',
      '[data-page-title]',
      '#content'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        content = element.textContent.trim();
        if (content.length > 100) break; // Found substantial content
      }
    }
    
    // Extract headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => h.textContent?.trim())
      .filter(Boolean);
    
    // Extract description from meta tags
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                       '';
    
    return {
      content: content || 'No content found',
      headings: headings as string[],
      description
    };
  });
  
  return pageData;
}

async function scrapeDocumentation() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const baseUrl = 'https://docs.anara.com';
  
  console.log('🚀 Starting Anara documentation scraper...\n');
  
  const scrapedData: ScrapedDocs = {
    timestamp: new Date().toISOString(),
    baseUrl,
    categories: [],
    totalPages: 0
  };
  
  // Scrape each category and page
  for (const category of DOCUMENTATION_STRUCTURE) {
    console.log(`\n📁 Scraping category: ${category.group}`);
    
    const scrapedCategory: DocCategory = {
      group: category.group,
      pages: []
    };
    
    for (const docPage of category.pages) {
      try {
        const fullUrl = `${baseUrl}${docPage.href}`;
        const pageData = await scrapePage(page, fullUrl);
        
        scrapedCategory.pages.push({
          ...docPage,
          content: pageData.content,
          headings: pageData.headings,
          description: pageData.description,
          category: category.group
        });
        
        scrapedData.totalPages++;
        
        // Add a small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`    ❌ Error scraping ${docPage.href}:`, error);
        scrapedCategory.pages.push({
          ...docPage,
          content: 'Error: Failed to scrape this page',
          category: category.group
        });
      }
    }
    
    scrapedData.categories.push(scrapedCategory);
  }
  
  await browser.close();
  
  // Save the data
  const outputDir = path.join(process.cwd(), 'public', 'guides');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save full documentation as one JSON
  const fullDocsPath = path.join(outputDir, 'anara-docs-complete.json');
  fs.writeFileSync(fullDocsPath, JSON.stringify(scrapedData, null, 2));
  console.log(`\n✅ Complete documentation saved to: ${fullDocsPath}`);
  
  // Save each category as a separate JSON file
  for (const category of scrapedData.categories) {
    const categoryFilename = category.group.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.json';
    const categoryPath = path.join(outputDir, categoryFilename);
    fs.writeFileSync(categoryPath, JSON.stringify(category, null, 2));
    console.log(`✅ Category saved: ${categoryFilename}`);
  }
  
  // Create an index file with summary
  const indexData = {
    timestamp: scrapedData.timestamp,
    baseUrl: scrapedData.baseUrl,
    totalPages: scrapedData.totalPages,
    categories: scrapedData.categories.map(cat => ({
      group: cat.group,
      pageCount: cat.pages.length,
      pages: cat.pages.map(p => ({
        title: p.title,
        href: p.href
      }))
    }))
  };
  
  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`✅ Index file saved: index.json`);
  
  // Print summary
  console.log('\n📊 Scraping Summary:');
  console.log(`   Total pages scraped: ${scrapedData.totalPages}`);
  console.log(`   Categories: ${scrapedData.categories.length}`);
  console.log(`   Output directory: ${outputDir}`);
  
  return scrapedData;
}

// Run the scraper
if (require.main === module) {
  scrapeDocumentation()
    .then(() => {
      console.log('\n🎉 Documentation scraping completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error during scraping:', error);
      process.exit(1);
    });
}

export { scrapeDocumentation, DOCUMENTATION_STRUCTURE };
