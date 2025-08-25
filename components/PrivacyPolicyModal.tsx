'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const t = useTranslations('privacyPolicy');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 mb-4">
                {t('lastUpdated')}: {new Date().toLocaleDateString()}
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">
                {t('sections.dataController.title')}
              </h3>
              <p>
                {t('sections.dataController.company')}<br />
                {t('sections.dataController.address')}<br />
                {t('sections.dataController.email')}<br />
                {t('sections.dataController.phone')}
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">
                {t('sections.dataCollection.title')}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('sections.dataCollection.contactInfo')}</li>
                <li>{t('sections.dataCollection.bookingInfo')}</li>
                <li>{t('sections.dataCollection.paymentInfo')}</li>
                <li>{t('sections.dataCollection.cookieData')}</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">
                {t('sections.dataUsage.title')}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('sections.dataUsage.bookings')}</li>
                <li>{t('sections.dataUsage.communication')}</li>
                <li>{t('sections.dataUsage.improvement')}</li>
                <li>{t('sections.dataUsage.marketing')}</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">
                {t('sections.cookies.title')}
              </h3>
              <p>{t('sections.cookies.description')}</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>{t('sections.cookies.necessary')}:</strong> {t('sections.cookies.necessaryDesc')}
                </li>
                <li>
                  <strong>{t('sections.cookies.analytics')}:</strong> {t('sections.cookies.analyticsDesc')}
                </li>
                <li>
                  <strong>{t('sections.cookies.marketing')}:</strong> {t('sections.cookies.marketingDesc')}
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">
                {t('sections.rights.title')}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('sections.rights.access')}</li>
                <li>{t('sections.rights.rectification')}</li>
                <li>{t('sections.rights.erasure')}</li>
                <li>{t('sections.rights.portability')}</li>
                <li>{t('sections.rights.withdraw')}</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-3">
                {t('sections.contact.title')}
              </h3>
              <p>
                {t('sections.contact.description')}<br />
                {t('sections.contact.email')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}