'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { X, Cookie, Shield, BarChart, Settings } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentProps {
  onConsentChange?: (consent: ConsentSettings) => void;
  companyName?: string;
}

export default function CookieConsent({ 
  onConsentChange,
  companyName = 'Yoga Stenungsund'
}: CookieConsentProps) {
  const t = useTranslations('cookieConsent');
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  const updateGoogleConsent = (settings: ConsentSettings) => {
    // Update Google consent mode
    interface WindowWithGtag extends Window {
      gtag?: (...args: unknown[]) => void;
    }
    
    if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
      (window as WindowWithGtag).gtag!('consent', 'update', {
        'analytics_storage': settings.analytics ? 'granted' : 'denied',
        'ad_storage': settings.marketing ? 'granted' : 'denied',
        'ad_user_data': settings.marketing ? 'granted' : 'denied',
        'ad_personalization': settings.marketing ? 'granted' : 'denied',
        'functionality_storage': settings.preferences ? 'granted' : 'denied',
        'personalization_storage': settings.preferences ? 'granted' : 'denied',
        'security_storage': 'granted' // Always granted for necessary cookies
      });
    }

    // Trigger callback if provided
    if (onConsentChange) {
      onConsentChange(settings);
    }
  };

  useEffect(() => {
    // Check if consent has been given before
    const storedConsent = localStorage.getItem('cookie_consent');
    const consentTimestamp = localStorage.getItem('cookie_consent_timestamp');
    
    if (!storedConsent) {
      // No consent given yet, show banner after a small delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Consent exists, apply it
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsent(parsedConsent);
        updateGoogleConsent(parsedConsent);
        
        // Check if consent is older than 365 days (re-consent requirement)
        if (consentTimestamp) {
          const timestamp = parseInt(consentTimestamp);
          const daysSinceConsent = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
          if (daysSinceConsent > 365) {
            setTimeout(() => setShowBanner(true), 1000);
          }
        }
      } catch (error) {
        console.error('Error parsing stored consent:', error);
        setTimeout(() => setShowBanner(true), 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConsent = (settings: ConsentSettings) => {
    localStorage.setItem('cookie_consent', JSON.stringify(settings));
    localStorage.setItem('cookie_consent_timestamp', Date.now().toString());
    updateGoogleConsent(settings);
    setConsent(settings);
    setShowBanner(false);
    setShowDetails(false);
  };

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveConsent(allConsent);
  };

  const acceptSelected = () => {
    saveConsent(consent);
  };

  // rejectAll function removed - not used in current implementation
  // Can be re-added if needed for future functionality

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
        onClick={() => setShowDetails(false)}
      />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <Card className="mx-auto max-w-4xl bg-white shadow-2xl">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-semibold">{t('title')}</h2>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content */}
            {!showDetails ? (
              <>
                <p className="text-gray-600 mb-6">
                  {t('description', { company: companyName })}
                </p>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Button 
                    onClick={acceptAll}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    {t('acceptAll')}
                  </Button>
                  <Button 
                    onClick={() => setShowDetails(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('customize')}
                  </Button>
                </div>

                {/* Privacy Policy Link */}
                <p className="text-sm text-gray-500 text-center">
                  {t('privacyInfo')}{' '}
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    {t('privacyPolicy')}
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Detailed Cookie Settings */}
                <div className="space-y-6 mb-6">
                  <p className="text-gray-600">
                    {t('detailsDescription')}
                  </p>

                  {/* Necessary Cookies */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium">{t('necessary.title')}</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {t('alwaysActive')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {t('necessary.description')}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="mt-1 h-5 w-5 text-green-600"
                      />
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium">{t('analytics.title')}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t('analytics.description')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('analytics.services')}: Google Analytics, Google Tag Manager
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                        className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart className="h-5 w-5 text-purple-600" />
                          <h3 className="font-medium">{t('marketing.title')}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t('marketing.description')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('marketing.services')}: Google Ads, Facebook Pixel
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                        className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Preference Cookies */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="h-5 w-5 text-orange-600" />
                          <h3 className="font-medium">{t('preferences.title')}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t('preferences.description')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('preferences.services')}: Language preferences, Theme settings
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consent.preferences}
                        onChange={(e) => setConsent({...consent, preferences: e.target.checked})}
                        className="mt-1 h-5 w-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={acceptSelected}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {t('savePreferences')}
                  </Button>
                  <Button 
                    onClick={acceptAll}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('acceptAll')}
                  </Button>
                </div>

                {/* Back to Simple View */}
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {t('backToSimple')}
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
    </>
  );
}

// Export type for external use
export type { ConsentSettings };