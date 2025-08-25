'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan } from '@/lib/types/braincore';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SimpleMembershipCheckout from './SimpleMembershipCheckout';

interface MembershipCardProps {
  plan: MembershipPlan;
  featured?: boolean;
}

export default function MembershipCard({ plan, featured = false }: MembershipCardProps) {
  const t = useTranslations('membership');
  const [loading] = useState(false);
  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false);

  const handlePurchase = () => {
    setShowCheckoutFlow(true);
  };

  const formatPrice = () => {
    const price = plan.price; // Price is already in base currency unit (SEK)
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: plan.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPeriodText = () => {
    switch (plan.billing_period) {
      case 'monthly':
        return t('periods.monthly');
      case 'quarterly':
        return t('periods.quarterly');
      case 'yearly':
        return t('periods.yearly');
      case 'one_time':
        return t('periods.oneTime');
      default:
        return '';
    }
  };

  return (
    <>
      <Card className={`flex flex-col h-full transition-all duration-300 hover:shadow-lg ${
        featured ? 'bg-white shadow-lg scale-105' : 'bg-white'
      }`}>
        <CardHeader>
          <CardTitle className="text-2xl font-light">{plan.name}</CardTitle>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-light text-gray-900">{formatPrice()}</span>
            <span className="text-gray-600">{getPeriodText()}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          {plan.description && (
            <CardDescription className="mb-6">{plan.description}</CardDescription>
          )}

          {plan.benefits && plan.benefits.length > 0 && (
            <div className="space-y-3">
              {plan.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[var(--yoga-sage)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {plan.limitations && plan.limitations.length > 0 && (
            <div className="mt-6 space-y-2">
              {plan.limitations.map((limitation, index) => (
                <p key={index} className="text-sm text-gray-500">
                  • {limitation}
                </p>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full ${
              featured 
                ? 'bg-[var(--yoga-cyan)] hover:bg-[var(--yoga-cyan)]/90' 
                : 'bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90'
            } text-white`}
            size="lg"
          >
            {loading ? t('purchasing') : t('purchase')}
          </Button>
        </CardFooter>
      </Card>

      <SimpleMembershipCheckout
        plan={plan}
        isOpen={showCheckoutFlow}
        onClose={() => setShowCheckoutFlow(false)}
      />
    </>
  );
}