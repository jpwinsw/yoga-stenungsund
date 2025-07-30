import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/index';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MembershipSuccessPage() {
  const t = useTranslations('membership.success');

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-[var(--yoga-teal)]" />
            </div>
            <CardTitle className="text-2xl">{t('purchaseComplete')}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {t('welcomeMessage')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-[var(--yoga-stone)]">
              {t('confirmationEmail')}
            </p>
            
            <div className="space-y-3">
              <Link href="/schema">
                <Button variant="gradient" size="lg" className="w-full">
                  {t('bookClass')}
                </Button>
              </Link>
              
              <Link href="/mina-bokningar">
                <Button variant="outline" size="lg" className="w-full">
                  {t('viewBookings')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}