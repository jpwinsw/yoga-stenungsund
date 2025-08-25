'use client';

import dynamic from 'next/dynamic';

// Dynamically import to ensure it only runs on client
const CookieConsent = dynamic(() => import('./CookieConsent'), {
  ssr: false,
});

interface CookieConsentWrapperProps {
  locale: string;
}

export default function CookieConsentWrapper({ }: CookieConsentWrapperProps) {
  return (
    <CookieConsent 
      companyName="Yoga Stenungsund"
    />
  );
}