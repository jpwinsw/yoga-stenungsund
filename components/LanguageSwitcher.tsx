'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/navigation';
import { useParams } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    
    // Handle dynamic routes
    if (pathname === '/happenings/[slug]' && params.slug) {
      router.replace(
        { pathname: '/happenings/[slug]' as const, params: { slug: params.slug as string } },
        { locale: newLocale }
      );
    } else {
      // For non-dynamic routes, cast to the union type
      router.replace(pathname as Parameters<typeof router.replace>[0], { locale: newLocale });
    }
  };

  return (
    <select
      onChange={handleChange}
      className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
      value={locale}
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc === 'sv' ? 'Svenska' : 'English'}
        </option>
      ))}
    </select>
  );
}