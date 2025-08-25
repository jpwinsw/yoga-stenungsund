'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { braincore } from '@/lib/api/braincore';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

export interface CheckoutAuthData {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  receiptDetails?: {
    personalNumber: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    companyName: string;
    vatNumber: string;
  };
  discountCode?: string;
}

interface CheckoutAuthFlowProps {
  onComplete: (data: CheckoutAuthData) => void;
  onError: (error: string) => void;
  buttonText?: string;
  loading?: boolean;
}

export function CheckoutAuthFlow({ 
  onComplete, 
  onError,
  buttonText = 'Next',
  loading: externalLoading = false
}: CheckoutAuthFlowProps) {
  const t = useTranslations('membership.checkout');
  const tAuth = useTranslations('auth');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{ id: number; email: string; first_name: string; last_name: string } | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
  
  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (braincore.isAuthenticated()) {
        try {
          const profile = await braincore.getMemberProfile();
          setAuthenticatedUser(profile);
          // Pre-fill fields if we have them
          if (profile.email) setEmail(profile.email);
          if (profile.first_name) setFirstName(profile.first_name);
          if (profile.last_name) setLastName(profile.last_name);
        } catch (error) {
          console.error('Failed to get profile:', error);
        }
      }
    };
    
    checkAuth();
  }, []);
  
  const handleProceed = async () => {
    setLoading(true);
    
    try {
      let user = authenticatedUser;
      
      // Handle authentication if not already authenticated
      if (!user) {
        if (!braincore.isAuthenticated()) {
          // If user manually selected "I have an account" or we auto-detected they need password
          if (isExistingUser || needsPassword) {
            // Try to login
            try {
              await braincore.login({ email, password });
            } catch (loginError) {
              const error = loginError as Error & { response?: { data?: { detail?: string } } };
              onError(error.response?.data?.detail || 'Invalid password');
              setLoading(false);
              return;
            }
          } else {
            // Check if email exists (only if not manually set as existing user)
            try {
              const emailCheck = await braincore.checkEmailExists(email);
              
              if (emailCheck.exists && emailCheck.has_password) {
                // User exists - need password
                setNeedsPassword(true);
                setExistingUserName(firstName || 'there');
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Email check failed:', error);
            }
            
            // New user - create account with user-provided password
            try {
              await braincore.signup({
                email,
                password: password,
                first_name: firstName,
                last_name: lastName,
                phone
              });
              
              // Auto-login with the same password
              await braincore.login({ 
                email, 
                password: password
              });
            } catch (signupError) {
              // If email already exists (race condition), ask for password
              const error = signupError as Error & { response?: { data?: { error?: string } } };
              if (error.response?.data?.error?.includes('already')) {
                setNeedsPassword(true);
                setExistingUserName(firstName || 'there');
                setLoading(false);
                return;
              }
              throw signupError;
            }
          }
        }
        
        // Get user profile after successful auth
        user = await braincore.getMemberProfile();
        setAuthenticatedUser(user);
      }
      
      // Prepare complete data
      const authData: CheckoutAuthData = {
        user,
        receiptDetails: (personalNumber || streetAddress || companyName || vatNumber) ? {
          personalNumber,
          streetAddress,
          postalCode,
          city,
          companyName,
          vatNumber
        } : undefined,
        discountCode: discountCode || undefined
      };
      
      onComplete(authData);
      
    } catch (err) {
      const error = err as Error & { response?: { data?: { detail?: string } } };
      onError(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  const canProceed = () => {
    if (authenticatedUser) return true;
    if (!email) return false;
    if (needsPassword || isExistingUser) {
      return password.length > 0;
    }
    // New user needs all fields including matching passwords
    return firstName.length > 0 && 
           lastName.length > 0 && 
           password.length >= 8 &&
           password === confirmPassword;
  };
  
  const isLoading = loading || externalLoading;
  
  return (
    <div className="space-y-4">
      {/* If user is logged in, show simple message */}
      {authenticatedUser ? (
        <div className="bg-[var(--yoga-light-sage)] p-4 rounded-lg">
          <p className="text-sm font-medium">
            {t('proceedWithPurchase', { 
              name: authenticatedUser.first_name || authenticatedUser.email || 'there' 
            })}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {t('addReceiptDetailsBelow')}
          </p>
        </div>
      ) : (
        <>
          {/* Toggle for existing users */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsExistingUser(!isExistingUser);
                setNeedsPassword(false);
              }}
              className="text-sm text-[var(--yoga-sage)] hover:underline"
            >
              {isExistingUser ? t('newCustomer') : t('haveAccount')}
            </button>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">{tAuth('email')} *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tAuth('emailPlaceholder')}
              required
            />
          </div>

          {/* Password field for existing users */}
          {(needsPassword || isExistingUser) ? (
            <div className="space-y-3">
              {needsPassword && (
                <div className="bg-[var(--yoga-light-sage)] p-4 rounded-lg">
                  <p className="text-sm font-medium">{t('welcomeBack', { name: existingUserName })}</p>
                  <p className="text-xs text-gray-600 mt-1">{t('enterPasswordToContinue')}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">{tAuth('password')} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tAuth('passwordPlaceholder')}
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[var(--yoga-sage)] hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>
          ) : (
            /* New user fields with password */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{tAuth('firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={tAuth('firstNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{tAuth('lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={tAuth('lastNamePlaceholder')}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{tAuth('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={tAuth('phonePlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">{tAuth('password')} *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tAuth('passwordPlaceholder')}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">{tAuth('passwordRequirements')}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{tAuth('confirmPassword')} *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={tAuth('confirmPasswordPlaceholder')}
                  required
                  minLength={8}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">{tAuth('passwordsDoNotMatch')}</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

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
                onChange={(e) => setPersonalNumber(e.target.value)}
                placeholder={t('personalNumberPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="streetAddress">{t('streetAddress')}</Label>
              <Input
                id="streetAddress"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder={t('streetAddressPlaceholder')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('postalCode')}</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={t('postalCodePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('cityPlaceholder')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">{t('companyName')}</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('companyPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vat">{t('vatNumber')}</Label>
              <Input
                id="vat"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
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
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder={t('enterDiscountCode')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // TODO: Validate discount code
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // TODO: Implement discount validation
                  console.log('Validating discount:', discountCode);
                }}
                disabled={!discountCode.trim()}
                size="sm"
              >
                {t('apply')}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Action button */}
      <Button
        onClick={handleProceed}
        disabled={!canProceed() || isLoading}
        className="w-full bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90"
      >
        {isLoading ? t('processing') : buttonText}
      </Button>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
}