# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.4 yoga studio website with full internationalization support for Swedish (sv) and English (en). The project uses the App Router and next-intl for i18n.

## Common Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking (no dedicated script - TypeScript is checked during build)
npm run build
```

## Architecture Overview

### Internationalization (i18n) System

The project implements a sophisticated i18n system with:

1. **Locale-based routing**: All pages live under `/app/[locale]/` with automatic locale detection
2. **Path translation**: Swedish paths are base URLs, English paths are translated (e.g., `/klasser` → `/classes`)
3. **Custom navigation**: Use the wrapped components from `/lib/i18n/navigation.ts` instead of Next.js defaults:
   ```typescript
   import { Link, redirect, usePathname, useRouter } from '@/lib/i18n/navigation'
   ```

### Key Files for i18n

- `/i18n.ts` - Main i18n configuration
- `/lib/i18n/navigation.ts` - Custom routing with path translation
- `/middleware.ts` - Handles locale detection and routing
- `/messages/[locale].json` - Root translations
- `/messages/[locale]/*.json` - Namespaced translations

### Adding New Pages

When creating new pages:

1. Add the page under `/app/[locale]/your-page/page.tsx`
2. Update path mappings in `/lib/i18n/navigation.ts` if using different paths per locale
3. Add translations to appropriate namespace in `/messages/`
4. Use `generateStaticParams` to ensure both locales are generated:
   ```typescript
   export function generateStaticParams() {
     return locales.map((locale) => ({ locale }))
   }
   ```

### Using Translations

Client components:
```typescript
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')
```

Server components:
```typescript
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('namespace')
```

### Project Structure

- `/app/[locale]/` - All page routes (locale-based)
- `/components/` - Shared React components
- `/lib/` - Utilities and configuration
- `/messages/` - All translation files
- `/public/` - Static assets

### Important Patterns

1. **Always use locale-aware navigation**: Import from `/lib/i18n/navigation.ts`, not `next/navigation`
2. **Metadata**: Use `generateMetadata` for localized SEO
3. **Static Generation**: Include `generateStaticParams` for all dynamic routes
4. **Nested Translations**: Organize translations by feature/page namespace

### Production Build

The project uses `output: "standalone"` in next.config.ts for optimized Docker deployments. The build includes all locales and generates static pages where possible.
- Always use translation strings as per app pattern