import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/index';
import { CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

function SuccessContent() {
  const t = useTranslations('membership.success');
  
  // Get session_id from URL if available
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const sessionId = urlParams?.get('session_id');

  return (
    <>
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
        
        {/* Debug info for session ID */}
        {sessionId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Info className="w-4 h-4" />
              <span>Payment confirmed (Session: {sessionId.slice(-8)})</span>
            </div>
          </div>
        )}
        
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
    </>
  );
}

export default function MembershipSuccessPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <Suspense fallback={
            <CardContent className="py-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--yoga-teal)]"></div>
              </div>
            </CardContent>
          }>
            <SuccessContent />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}