# Server-Side Rendering Guidelines for Yoga Stenungsund

## General Principles

### Use Server Components (Default) When:
- Fetching data from brain-core API
- Rendering static content (about, contact info)
- SEO is important (public-facing pages)
- Initial page load performance is critical
- You need to keep sensitive data on server

### Use Client Components ('use client') When:
- User interactions (buttons, forms, filters)
- Browser APIs needed (localStorage, window)
- Real-time updates (SWR polling)
- React hooks required (useState, useEffect)
- Third-party client libraries

## Implementation Patterns

### 1. Hybrid Approach (Recommended)
```tsx
// Server Component - Fetches initial data
export default async function PageName() {
  const data = await getDataFromBraincore()
  return <ClientComponent initialData={data} />
}

// Client Component - Handles interactions
'use client'
export function ClientComponent({ initialData }) {
  // Use SWR with initialData for updates
}
```

### 2. Pure Server Component
```tsx
// For static content pages
export default async function AboutPage() {
  const companySettings = await getCompanySettings()
  return <div>{/* Render static content */}</div>
}
```

### 3. Loading States
```tsx
// Use Suspense for server components
<Suspense fallback={<LoadingSkeleton />}>
  <ServerComponent />
</Suspense>
```

## Page-Specific Guidelines

### Schedule Page (/schema)
- **Server**: Fetch initial week's schedule
- **Client**: Week navigation, real-time updates, booking interactions

### Classes Page (/klasser)
- **Server**: Fetch all services/classes
- **Client**: Filtering, searching, detailed views

### Instructors Page (/larare)
- **Server**: Fetch all instructors
- **Client**: Minimal (just profile interactions)

### Pricing Page (/priser)
- **Server**: Fetch membership plans
- **Client**: Calculator, comparisons

### Booking Flow
- **Server**: Initial session data
- **Client**: All booking steps, auth, payment

## Data Fetching Strategies

### Server-Side Caching
```tsx
// In braincore-server.ts
fetch(url, {
  next: { 
    revalidate: 300 // 5 minutes for schedule
    revalidate: 3600 // 1 hour for static data
  }
})
```

### Client-Side Updates
```tsx
// Use SWR for real-time updates
const { data } = useSWR(key, fetcher, {
  refreshInterval: 60000, // 1 minute for schedule
  fallbackData: initialData
})
```

## SEO Considerations

### Dynamic Metadata
```tsx
export async function generateMetadata() {
  const data = await getData()
  return {
    title: data.title,
    description: data.description,
  }
}
```

### Structured Data
```tsx
// Add JSON-LD for better SEO
<script type="application/ld+json">
  {JSON.stringify(structuredData)}
</script>
```

## Performance Tips

1. **Minimize Client Bundle**
   - Keep heavy operations server-side
   - Lazy load client components when possible

2. **Parallel Data Fetching**
   ```tsx
   const [services, instructors] = await Promise.all([
     getServices(),
     getInstructors()
   ])
   ```

3. **Error Boundaries**
   - Wrap client components in error boundaries
   - Show fallback UI for failed requests

## Security Considerations

- Never expose API keys in client components
- Validate all user inputs server-side
- Use server actions for mutations when possible