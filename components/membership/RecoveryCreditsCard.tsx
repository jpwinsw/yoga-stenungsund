'use client'

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { MemberCreditDetails } from '@/lib/types/braincore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';


interface RecoveryCreditsCardProps {
  creditDetails: MemberCreditDetails | null;
  isTermBased?: boolean;
}

export default function RecoveryCreditsCard({ creditDetails, isTermBased }: RecoveryCreditsCardProps) {
  const t = useTranslations('membership.recoveryCredits');
  const locale = useLocale();
  const dateLocale = locale === 'sv' ? sv : enUS;
  
  // Extract recovery credits from creditDetails
  const recoveryCredits = useMemo(() => {
    if (!creditDetails) return [];
    
    return creditDetails.credit_breakdown
      .filter(credit => 
        credit.credit_type === 'recovery' && 
        !credit.is_expired &&
        credit.credits > 0
      )
      .map((credit, index) => ({
        id: index,
        amount: credit.credits,
        expires_at: credit.expiry_date || '',
        days_until_expiry: credit.days_until_expiry,
        description: credit.description
      }));
  }, [creditDetails]);

  if (!isTermBased || !creditDetails) {
    return null;
  }

  const totalCredits = recoveryCredits.reduce((sum, credit) => sum + credit.amount, 0);
  const expiringCredits = recoveryCredits.filter(credit => {
    return credit.days_until_expiry !== null && credit.days_until_expiry <= 7 && credit.days_until_expiry > 0;
  });

  return (
    <Card className="bg-white shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[var(--yoga-sage)]" />
            {t('title')}
          </div>
          {totalCredits > 0 && (
            <Badge className="bg-[var(--yoga-sage)]/10 text-[var(--yoga-sage)] border-[var(--yoga-sage)]/20">
              {totalCredits} {t('available')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalCredits === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-2">{t('noCredits')}</p>
            <p className="text-xs text-gray-400">{t('howToGet')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="text-center py-3 bg-[var(--yoga-sage)]/5 rounded-lg">
              <p className="text-3xl font-semibold text-[var(--yoga-sage)]">{totalCredits}</p>
              <p className="text-sm text-gray-600">{t('recoveryCreditsAvailable')}</p>
            </div>

            {/* Expiring Soon Warning */}
            {expiringCredits.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    {t('expiringSoon', { count: expiringCredits.length })}
                  </p>
                </div>
              </div>
            )}

            {/* Credit List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recoveryCredits.map((credit) => (
                <div key={credit.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{credit.description || t('recoveryCredit')}</p>
                      {credit.expires_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {t('expiresOn', {
                            date: format(new Date(credit.expires_at), 'PPP', { locale: dateLocale })
                          })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {credit.amount} {t('credit')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">{t('info.title')}</p>
                <p className="text-xs text-blue-700 mt-1">{t('info.description')}</p>
              </div>
            </div>

            {/* Use Credits Button */}
            <Link href="/schema" className="block">
              <Button className="w-full bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90">
                {t('useCredits')}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}