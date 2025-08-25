'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan } from '@/lib/types/braincore';
import { braincore } from '@/lib/api/braincore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

interface SimpleMembershipCheckoutProps {
  plan: MembershipPlan;
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleMembershipCheckout({ plan, isOpen, onClose }: SimpleMembershipCheckoutProps) {
  const t = useTranslations('membership.checkout');
  const tAuth = useTranslations('auth.signup');
  const tBooking = useTranslations('schema.booking');
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false); // Manual toggle for existing users
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{first_name?: string; last_name?: string; email?: string} | null>(null);
  
  // Discount code
  const [showDiscountField, setShowDiscountField] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    discount_amount: number;
    final_amount: number;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (braincore.isAuthenticated()) {
        setIsLoggedIn(true);
        try {
          const profile = await braincore.getMemberProfile();
          setCurrentUser(profile);
        } catch (error) {
          console.error('Failed to get user profile:', error);
        }
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: plan.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPeriodText = () => {
    if (!plan.billing_period) return '';
    
    const periods: Record<string, string> = {
      'monthly': t('periods.monthly'),
      'quarterly': t('periods.quarterly'),
      'yearly': t('periods.yearly'),
      'one_time': t('periods.oneTime'),
      'oneTime': t('periods.oneTime'), // Handle both formats
      'once': t('periods.oneTime') // Handle alternative format
    };
    return periods[plan.billing_period] || '';
  };


  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountValidation(null);
      return;
    }
    
    setIsValidatingDiscount(true);
    try {
      const response = await braincore.validateDiscountCode({
        code: discountCode,
        membership_plan_id: plan.id,
        amount: plan.price,
        company_id: parseInt(process.env.NEXT_PUBLIC_COMPANY_ID || '5')
      });
      
      if (response.valid) {
        setDiscountValidation(response);
        setError(null);
      } else {
        setError(response.message || tBooking('invalidDiscountCode'));
        setDiscountValidation(null);
      }
    } catch {
      setError(tBooking('invalidDiscountCode'));
      setDiscountValidation(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated already
      if (!braincore.isAuthenticated()) {
        // If user manually selected "I have an account" or we auto-detected they need password
        if (isExistingUser || needsPassword) {
          // Try to login
          try {
            await braincore.login({ email, password });
          } catch (loginError: unknown) {
            const errorMsg = loginError && typeof loginError === 'object' && 'response' in loginError 
              ? (loginError as {response?: {data?: {detail?: string}}}).response?.data?.detail 
              : t('errors.invalidPassword');
            setError(errorMsg || null);
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
          
          // New user - create account
          try {
            const tempPassword = Math.random().toString(36).slice(-12); // Generate temp password
            await braincore.signup({
              email,
              password: tempPassword,
              first_name: firstName,
              last_name: lastName,
              phone
            });
            
            // Auto-login
            await braincore.login({ 
              email, 
              password: tempPassword
            });
          } catch (signupError: unknown) {
            // If email already exists (race condition), ask for password
            const errorData = signupError && typeof signupError === 'object' && 'response' in signupError
              ? (signupError as {response?: {data?: {error?: string}}}).response?.data?.error
              : undefined;
            if (errorData?.includes('already')) {
              setNeedsPassword(true);
              setExistingUserName(firstName || 'there');
              setLoading(false);
              return;
            }
            throw signupError;
          }
        }
      }
      
      // Create checkout session with discount if applicable
      const response = await braincore.createMembershipCheckout(
        plan.id,
        discountValidation?.valid ? discountCode : undefined
      );
      
      if (response.checkout_url) {
        // Store receipt details if provided
        if (personalNumber || streetAddress || companyName || vatNumber) {
          sessionStorage.setItem('receipt_details', JSON.stringify({
            personal_number: personalNumber,
            street_address: streetAddress,
            postal_code: postalCode,
            city: city,
            company_name: companyName,
            vat_number: vatNumber
          }));
        }
        
        window.location.href = response.checkout_url;
      }
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {detail?: string}}}).response?.data?.detail
        : undefined;
      setError(errorMsg || t('errors.checkoutFailed'));
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = discountValidation?.valid 
    ? discountValidation.final_amount 
    : plan.price;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Price display */}
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-light">
              {formatPrice(finalPrice)}
              {getPeriodText() && (
                <span className="text-lg text-gray-600 ml-2">{getPeriodText()}</span>
              )}
            </div>
          </div>

          {/* If user is logged in, show simple message */}
          {isLoggedIn ? (
            <div className="bg-[var(--yoga-light-sage)] p-4 rounded-lg">
              <p className="text-sm font-medium">
                {t('proceedWithPurchase', { 
                  name: currentUser?.first_name || currentUser?.email || 'there' 
                })}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t('addReceiptDetailsBelow')}
              </p>
            </div>
          ) : (
            <>
              {/* Toggle for existing users - MOVED TO TOP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsExistingUser(!isExistingUser);
                    setNeedsPassword(false); // Reset auto-detection
                  }}
                  className="text-sm text-[var(--yoga-sage)] hover:underline"
                >
                  {isExistingUser ? t('newCustomer') : t('haveAccount')}
                </button>
              </div>

              {/* Email field - ALWAYS visible */}
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

              {/* Show password field if existing user detected OR manually selected */}
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
                /* New user fields (name and phone) */
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
                </div>
              )}
            </>
          )}

          {/* Optional receipt details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReceiptDetails(!showReceiptDetails)}
                className="text-sm text-[var(--yoga-sage)] hover:underline"
              >
                {showReceiptDetails ? '−' : '+'} {t('addReceiptDetails')}
              </button>
              <div className="group relative inline-flex">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 w-64">
                    <div className="absolute bottom-[-4px] left-2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    {t('receiptTooltip')}
                  </div>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {showReceiptDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Discount code */}
          <div className="pt-3 border-t">
            {!showDiscountField && !discountValidation?.valid ? (
              <button
                type="button"
                onClick={() => setShowDiscountField(true)}
                className="text-sm text-[var(--yoga-sage)] hover:underline"
              >
                {t('haveDiscountCode')}
              </button>
            ) : (
              <AnimatePresence mode="wait">
                {(showDiscountField || discountValidation?.valid) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-2">
                      <Input
                        id="discount"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder={tBooking('enterDiscountCode')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            validateDiscountCode();
                          }
                        }}
                        disabled={discountValidation?.valid}
                      />
                      {!discountValidation?.valid && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validateDiscountCode}
                          disabled={isValidatingDiscount || !discountCode.trim()}
                          size="sm"
                        >
                          {isValidatingDiscount ? tBooking('validating') : tBooking('apply')}
                        </Button>
                      )}
                    </div>
                    
                    {discountValidation?.valid && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {formatPrice(discountValidation.discount_amount)} {t('saved')}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountCode('');
                            setDiscountValidation(null);
                            setShowDiscountField(false);
                          }}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Price summary */}
          {discountValidation?.valid && (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{tBooking('originalPrice')}</span>
                <span className="line-through text-gray-400">{formatPrice(plan.price)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{tBooking('total')}</span>
                <span className="text-green-600">{formatPrice(finalPrice)}</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {tBooking('cancel')}
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={loading || (!isLoggedIn && (!email || ((needsPassword || isExistingUser) && !password) || (!(needsPassword || isExistingUser) && (!firstName || !lastName))))}
              className="flex-1 bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90 text-white"
            >
              {loading ? t('processing') : t('completePurchase')}
            </Button>
          </div>

          {/* Security note */}
          <p className="text-xs text-center text-gray-500">
            {t('securePayment')}
          </p>
        </div>
      </DialogContent>
    </Dialog>

    <ForgotPasswordModal
      isOpen={showForgotPassword}
      onClose={() => setShowForgotPassword(false)}
    />
  </>
  );
}