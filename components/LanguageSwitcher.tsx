'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    
    // The router from next-intl handles the pathname conversion automatically
    router.replace(pathname, { locale: newLocale });
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