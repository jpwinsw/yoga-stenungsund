'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CheckoutOptionsSectionProps {
  onReceiptDetailsChange?: (details: {
    personalNumber: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    companyName: string;
    vatNumber: string;
  }) => void;
  onDiscountCodeChange?: (code: string) => void;
  onDiscountValidate?: (code: string) => void;
}

export function CheckoutOptionsSection({
  onReceiptDetailsChange,
  onDiscountCodeChange,
  onDiscountValidate
}: CheckoutOptionsSectionProps) {
  const t = useTranslations('membership.checkout');
  
  // Receipt details state
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [personalNumber, setPersonalNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  
  // Discount state
  const [showDiscountField, setShowDiscountField] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  
  const handleReceiptChange = (field: string, value: string) => {
    const updates: Record<string, string> = {
      personalNumber,
      streetAddress,
      postalCode,
      city,
      companyName,
      vatNumber
    };
    
    updates[field] = value;
    
    // Update local state
    switch (field) {
      case 'personalNumber': setPersonalNumber(value); break;
      case 'streetAddress': setStreetAddress(value); break;
      case 'postalCode': setPostalCode(value); break;
      case 'city': setCity(value); break;
      case 'companyName': setCompanyName(value); break;
      case 'vatNumber': setVatNumber(value); break;
    }
    
    // Notify parent
    onReceiptDetailsChange?.({
      personalNumber: updates.personalNumber,
      streetAddress: updates.streetAddress,
      postalCode: updates.postalCode,
      city: updates.city,
      companyName: updates.companyName,
      vatNumber: updates.vatNumber
    });
  };
  
  const handleDiscountChange = (code: string) => {
    setDiscountCode(code);
    onDiscountCodeChange?.(code);
  };
  
  return (
    <>
      {/* Optional receipt details */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowReceiptDetails(!showReceiptDetails)}
          className="text-sm text-[var(--yoga-sage)] hover:underline flex items-center gap-1"
        >
          {showReceiptDetails ? '−' : '+'} {t('addReceiptDetails')}
        </button>
        
        {showReceiptDetails && (
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="personalNumber">{t('personalNumber')} ({t('optional')})</Label>
              <Input
                id="personalNumber"
                value={personalNumber}
                onChange={(e) => handleReceiptChange('personalNumber', e.target.value)}
                placeholder={t('personalNumberPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="streetAddress">{t('streetAddress')}</Label>
              <Input
                id="streetAddress"
                value={streetAddress}
                onChange={(e) => handleReceiptChange('streetAddress', e.target.value)}
                placeholder={t('streetAddressPlaceholder')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('postalCode')}</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => handleReceiptChange('postalCode', e.target.value)}
                  placeholder={t('postalCodePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => handleReceiptChange('city', e.target.value)}
                  placeholder={t('cityPlaceholder')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">{t('companyName')}</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => handleReceiptChange('companyName', e.target.value)}
                placeholder={t('companyPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vat">{t('vatNumber')}</Label>
              <Input
                id="vat"
                value={vatNumber}
                onChange={(e) => handleReceiptChange('vatNumber', e.target.value)}
                placeholder={t('vatPlaceholder')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Discount code section */}
      <div className="pt-3 border-t">
        {!showDiscountField ? (
          <button
            type="button"
            onClick={() => setShowDiscountField(true)}
            className="text-sm text-[var(--yoga-sage)] hover:underline"
          >
            {t('haveDiscountCode')}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="discount"
                value={discountCode}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder={t('enterDiscountCode')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onDiscountValidate?.(discountCode);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onDiscountValidate?.(discountCode)}
                disabled={!discountCode.trim()}
                size="sm"
              >
                {t('apply')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}