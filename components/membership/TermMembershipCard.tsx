'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan } from '@/lib/types/braincore';
import { braincore } from '@/lib/api/braincore';
import { Check, Calendar, ChevronRight } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import TermBookingModal from './TermBookingModal';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TermMembershipCardProps {
  plan: MembershipPlan;
  featured?: boolean;
}

export default function TermMembershipCard({ plan, featured = false }: TermMembershipCardProps) {
  const t = useTranslations('membership');
  const [loading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showTermBookingModal, setShowTermBookingModal] = useState(false);

  const handlePurchase = async () => {
    // Check if user is authenticated
    if (!braincore.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // For term-based memberships, show the booking modal
    setShowTermBookingModal(true);
  };

  const formatPrice = () => {
    const price = plan.price; // Price is already in base currency unit (SEK)
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: plan.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTermDuration = () => {
    if (plan.term_duration_days) {
      const weeks = Math.round(plan.term_duration_days / 7);
      return t('termDuration', { weeks });
    }
    return '';
  };

  return (
    <>
      <Card className={`flex flex-col h-full transition-all duration-300 hover:shadow-lg ${
        featured ? 'bg-white shadow-lg scale-105 ring-2 ring-[var(--yoga-cyan)]' : 'bg-white'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className="bg-[var(--yoga-sage)]/10 text-[var(--yoga-sage)] border-[var(--yoga-sage)]/20">
              {t('termMembership')}
            </Badge>
            {plan.sessions_per_week && (
              <Badge variant="outline" className="text-xs">
                {t('sessionsPerWeek', { count: plan.sessions_per_week })}
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-2xl font-light">{plan.name}</CardTitle>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-light text-gray-900">{formatPrice()}</span>
            <span className="text-gray-600">/ {getTermDuration()}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          {plan.description && (
            <CardDescription className="mb-6">{plan.description}</CardDescription>
          )}

          {/* Term-specific features */}
          <div className="bg-[var(--yoga-paper)] rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--yoga-sage)]" />
              {t('termFeatures.title')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--yoga-sage)] flex-shrink-0 mt-0.5" />
                <span>{t('termFeatures.chooseClassType')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--yoga-sage)] flex-shrink-0 mt-0.5" />
                <span>{t('termFeatures.preBookAllSessions')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--yoga-sage)] flex-shrink-0 mt-0.5" />
                <span>{t('termFeatures.recoveryCredits')}</span>
              </li>
            </ul>
          </div>

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
        </CardContent>

        <CardFooter>
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full ${
              featured 
                ? 'bg-[var(--yoga-cyan)] hover:bg-[var(--yoga-cyan)]/90' 
                : 'bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90'
            } text-white group`}
            size="lg"
          >
            {loading ? t('loading') : (
              <>
                {t('selectAndBook')}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          handlePurchase(); // Retry purchase after login
        }}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={() => {
          setShowSignupModal(false);
          handlePurchase(); // Retry purchase after signup
        }}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />

      <TermBookingModal
        isOpen={showTermBookingModal}
        onClose={() => setShowTermBookingModal(false)}
        plan={plan}
      />
    </>
  );
}