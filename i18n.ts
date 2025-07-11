import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Define locales here to avoid circular dependency
export const locales = ["sv", "en"] as const;
export const defaultLocale = "sv" as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const locale = await requestLocale;

  // Ensure that a locale is always available
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  // Load root messages
  const rootMessages = (await import(`./messages/${locale}.json`)).default;
  
  // Load namespace messages with Swedish file names
  const namespaces = {
    schedule: (await import(`./messages/${locale}/schema.json`)).default,
    classes: (await import(`./messages/${locale}/klasser.json`)).default,
    prices: (await import(`./messages/${locale}/priser.json`)).default,
    about: (await import(`./messages/${locale}/om-oss.json`)).default,
    contact: (await import(`./messages/${locale}/kontakt.json`)).default,
    teachers: (await import(`./messages/${locale}/larare.json`)).default,
    beginners: (await import(`./messages/${locale}/nyborjare.json`)).default,
    workshops: (await import(`./messages/${locale}/workshops.json`)).default,
    retreats: (await import(`./messages/${locale}/retreater.json`)).default,
    'corporate-yoga': (await import(`./messages/${locale}/foretagsyoga.json`)).default,
    'online-classes': (await import(`./messages/${locale}/online-klasser.json`)).default,
    'private-lessons': (await import(`./messages/${locale}/privatlektioner.json`)).default,
    home: (await import(`./messages/${locale}/hem.json`)).default,
    happenings: rootMessages.happenings || {}, // Currently in root file
    metadata: (await import(`./messages/${locale}/metadata.json`)).default,
    common: (await import(`./messages/${locale}/common.json`)).default,
  };

  return {
    locale,
    messages: {
      ...rootMessages,
      ...namespaces
    },
  };
});