# Next.js Starter Template

A modern, production-ready Next.js starter template with TypeScript, Tailwind CSS, and comprehensive tooling for building scalable web applications.

## ✨ Features

### Core Framework

- **Next.js 15** with App Router
- **React 19** with TypeScript support
- **Turbopack** for lightning-fast development builds

### Styling & UI

- **Tailwind CSS v4** for utility-first styling
- **Shadcn/UI** components for beautiful, accessible UI components
- **Lucide React** icons library
- **Dark/Light mode** support with `next-themes`
- Responsive design ready

### Developer Experience

- **TypeScript** with strict type checking
- **ESLint** with Next.js, TypeScript, and Prettier integration
- **Prettier** with Tailwind CSS plugin for consistent code formatting
- **Playwright** for end-to-end testing
- **pnpm** for efficient package management

### Production Ready

- **SEO optimizations** (meta tags, robots.txt, sitemap)
- **Open Graph** and Twitter Card support
- **Custom error pages** (404, 500)
- **Loading states** and error boundaries
- **Optimized icons** and favicon generation

### Validation & Type Safety

- **Zod** for runtime schema validation
- Strict TypeScript configuration
- Type-safe imports and exports

### Component Library

- **Shadcn/UI** pre-configured with neutral color scheme
- **Class Variance Authority** for component variants
- **clsx** and **tailwind-merge** utilities for conditional styling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone or download this template**

   ```bash
   git clone [your-repo-url] my-nextjs-app
   cd my-nextjs-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Script                                   | Description                             |
| ---------------------------------------- | --------------------------------------- |
| `pnpm dev`                               | Start development server with Turbopack |
| `pnpm build`                             | Build the application for production    |
| `pnpm start`                             | Start the production server             |
| `pnpm lint`                              | Run ESLint to check code quality        |
| `pnpm lint:fix`                          | Fix auto-fixable ESLint issues          |
| `pnpm format`                            | Format code with Prettier               |
| `pnpm test`                              | Run Playwright end-to-end tests         |
| `pnpm dlx shadcn@latest add [component]` | Add Shadcn/UI components                |

## 📁 Project Structure

```
nextjs-template/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── loading.tsx        # Loading UI
│   ├── error.tsx          # Error UI
│   ├── not-found.tsx      # 404 page
│   └── ...               # SEO files (robots, sitemap, etc.)
├── components/
│   ├── ui/               # Shadcn/UI components
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions, configurations, and Shadcn utils
├── public/               # Static assets
├── tests/                # Playwright test files
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── playwright.config.ts  # Playwright configuration
├── postcss.config.mjs    # PostCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Configuration Details

### ESLint Setup

- Next.js recommended rules
- TypeScript strict type checking
- Prettier integration
- Custom rules for consistent imports and type safety

### Tailwind CSS

- Latest Tailwind CSS v4
- Automatic class sorting with Prettier plugin
- Custom theme support
- Dark mode ready

### TypeScript

- Strict mode enabled
- Path aliases configured
- Type-safe imports enforced

## 🎨 Customization

### Adding UI Components

Add Shadcn/UI components to your project:

```bash
# Add specific components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input

# View available components
pnpm dlx shadcn@latest add
```

### Themes

The template includes a theme provider for dark/light mode support:

```tsx
// Already set up in app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### Styling

Customize your design system by modifying:

- `app/globals.css` - Global styles and CSS variables
- `components.json` - Shadcn/UI configuration
- `lib/utils.ts` - Utility functions for styling

### SEO & Metadata

Update metadata in `app/layout.tsx` and customize:

- Open Graph images: `app/opengraph-image.tsx`
- Twitter cards: `app/twitter-image.tsx`
- Favicon: `app/icon.tsx`
- Robots.txt: `app/robots.ts`

## 🧪 Testing

### Playwright Setup

End-to-end tests are configured with Playwright:

```bash
# Run tests
pnpm test

# Run tests in UI mode
pnpm exec playwright test --ui

# Generate test code
pnpm exec playwright codegen
```

## 📦 Dependencies

### Core Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `typescript` - TypeScript support
- `zod` - Schema validation

### UI & Styling

- `tailwindcss` - Utility-first CSS framework
- `shadcn/ui` - Beautiful, accessible component library
- `lucide-react` - Icon library
- `next-themes` - Theme switching
- `clsx` - Conditional class names utility
- `tailwind-merge` - Merge Tailwind classes without conflicts
- `class-variance-authority` - Component variant management

### Development Tools

- `eslint` - Code linting
- `prettier` - Code formatting
- `@playwright/test` - E2E testing
- Various TypeScript and ESLint plugins

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Other Platforms

This template works with any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Build Output

```bash
pnpm build
```

Creates an optimized production build in `.next/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm format`
5. Test your changes
6. Submit a pull request

## 📝 License

This template is open source and available under the [MIT License](LICENSE).

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)

---

**Happy coding!** 🎉

If you find this template helpful, please consider giving it a ⭐ on GitHub.
