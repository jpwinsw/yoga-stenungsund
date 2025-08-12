'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { braincore } from '@/lib/api/braincore';
import type { RecoveryCredit } from '@/lib/types/braincore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';


interface RecoveryCreditsCardProps {
  subscriptionId?: number;
  isTermBased?: boolean;
  planType?: string;
}

export default function RecoveryCreditsCard({ isTermBased }: RecoveryCreditsCardProps) {
  const t = useTranslations('membership.recoveryCredits');
  const locale = useLocale();
  const dateLocale = locale === 'sv' ? sv : enUS;
  
  const [credits, setCredits] = useState<RecoveryCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecoveryCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allCredits = await braincore.getRecoveryCredits();
      // Filter to only show recovery credits
      const recoveryCredits = allCredits.filter(credit => 
        credit.credit_type === 'recovery'
      );
      
      setCredits(recoveryCredits);
    } catch (err) {
      console.error('Failed to fetch recovery credits:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isTermBased) {
      fetchRecoveryCredits();
    } else {
      setLoading(false);
    }
  }, [isTermBased, fetchRecoveryCredits]);

  if (!isTermBased) {
    return null;
  }

  const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);
  const expiringCredits = credits.filter(credit => {
    const daysUntilExpiry = Math.floor((new Date(credit.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
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
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : totalCredits === 0 ? (
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
              {credits.map((credit) => (
                <div key={credit.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{credit.source || t('recoveryCredit')}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('expiresOn', {
                          date: format(new Date(credit.expires_at), 'PPP', { locale: dateLocale })
                        })}
                      </p>
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