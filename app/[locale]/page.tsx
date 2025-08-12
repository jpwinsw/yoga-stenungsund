import HomeClient from './HomeClient';
import { getCompanySettings } from '@/lib/api/company-settings';

export default async function Home() {
  const companySettings = await getCompanySettings();

  return <HomeClient companySettings={companySettings || undefined} />;
}