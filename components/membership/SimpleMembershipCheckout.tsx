'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan } from '@/lib/types/braincore';
import { braincore } from '@/lib/api/braincore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

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
  const [error, setError] = useState<string | null>(null);
  
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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Receipt details
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  
  // Discount code
  const [showDiscountField, setShowDiscountField] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    discount_amount: number;
    final_amount: number;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    if (!isOpen) return;
    
    const checkAuth = async () => {
      setCheckingAuth(true);
      if (braincore.isAuthenticated()) {
        try {
          const profile = await braincore.getMemberProfile();
          setAuthenticatedUser(profile);
          if (profile.email) setEmail(profile.email);
          if (profile.first_name) setFirstName(profile.first_name);
          if (profile.last_name) setLastName(profile.last_name);
        } catch (error) {
          console.error('Failed to get profile:', error);
        }
      }
      setCheckingAuth(false);
    };
    
    checkAuth();
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
      'oneTime': t('periods.oneTime'),
      'once': t('periods.oneTime')
    };
    return periods[plan.billing_period] || '';
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountValidation(null);
      setError(null);
      return;
    }
    
    setIsValidatingDiscount(true);
    setError(null); // Clear any previous errors
    
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
        // Keep the discount field visible so user can try again
      }
    } catch {
      setError(tBooking('invalidDiscountCode'));
      setDiscountValidation(null);
      // Keep the discount field visible so user can try again
    } finally {
      setIsValidatingDiscount(false);
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

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Auto-validate discount code if entered but not validated
      let finalDiscountValidation = discountValidation;
      if (discountCode && !discountValidation?.valid) {
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
            finalDiscountValidation = response;
          } else {
            // Invalid discount code - continue without discount
            setDiscountCode('');
            setDiscountValidation(null);
            finalDiscountValidation = null;
          }
        } catch {
          // Error validating - continue without discount
          setDiscountCode('');
          setDiscountValidation(null);
          finalDiscountValidation = null;
        } finally {
          setIsValidatingDiscount(false);
        }
      }
      
      // Handle authentication if not already authenticated
      if (!authenticatedUser) {
        if (isExistingUser || needsPassword) {
          // Try to login
          try {
            await braincore.login({ email, password });
            // After successful login, get the user profile
            const profile = await braincore.getMemberProfile();
            setAuthenticatedUser(profile);
          } catch (loginError) {
            const error = loginError as Error & { response?: { data?: { detail?: string } } };
            const errorMessage = error.response?.data?.detail || 'Invalid email or password';
            setError(errorMessage);
            setLoading(false);
            return; // Stop here, don't continue to checkout
          }
        } else {
          // Check if email exists
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
            await braincore.signup({
              email,
              password,
              first_name: firstName,
              last_name: lastName,
              phone
            });
            
            // Auto-login
            await braincore.login({ email, password });
          } catch (signupError) {
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
      
      // Prepare receipt details if provided
      const receiptDetails = (personalNumber || streetAddress || companyName || vatNumber) ? {
        personal_number: personalNumber,
        street_address: streetAddress,
        postal_code: postalCode,
        city: city,
        company_name: companyName,
        vat_number: vatNumber
      } : undefined;
      
      // Create checkout session with validated discount and receipt details
      const response = await braincore.createMembershipCheckout(
        plan.id,
        finalDiscountValidation?.valid ? discountCode : undefined,
        receiptDetails
      );
      
      if (response.checkout_url) {
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
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{plan.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Price display */}
            <div className="text-center py-2 bg-gray-50 rounded-lg">
              <div className="text-2xl font-light">
                {formatPrice(finalPrice)}
                {getPeriodText() && (
                  <span className="text-lg text-gray-600 ml-2">{getPeriodText()}</span>
                )}
              </div>
            </div>

            {/* Loading state while checking auth */}
            {checkingAuth ? (
              <div className="space-y-4">
                {/* Skeleton for auth form */}
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-3 mt-4">
                  <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
            <>
            {/* Auth section */}
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
                    name="email"
                    autoComplete="email"
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
                      <>
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-sm">
                            <strong className="font-semibold text-orange-900">{t('accountExists')}</strong>
                            <br />
                            <span className="text-orange-800">
                              {t('accountExistsDescription', { email })}
                            </span>
                          </AlertDescription>
                        </Alert>
                        <div className="bg-[var(--yoga-light-sage)] p-4 rounded-lg">
                          <p className="text-sm font-medium">{t('welcomeBack', { name: existingUserName })}</p>
                          <p className="text-xs text-gray-600 mt-1">{t('enterPasswordToContinue')}</p>
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">{tAuth('password')} *</Label>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
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
                  /* New user fields - 2-column layout */
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {/* Left column */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="firstName">{tAuth('firstName')} *</Label>
                        <Input
                          id="firstName"
                          type="text"
                          name="firstName"
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={tAuth('firstNamePlaceholder')}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newPassword">{tAuth('password')} *</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          name="newPassword"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={tAuth('passwordPlaceholder')}
                          required
                          minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">{tAuth('passwordRequirements')}</p>
                      </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="lastName">{tAuth('lastName')} *</Label>
                        <Input
                          id="lastName"
                          type="text"
                          name="lastName"
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={tAuth('lastNamePlaceholder')}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">{tAuth('confirmPassword')} *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={tAuth('confirmPasswordPlaceholder')}
                          required
                          minLength={8}
                        />
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">{tAuth('passwordsDoNotMatch')}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Phone spans both columns */}
                    <div className="col-span-2">
                      <Label htmlFor="phone">{tAuth('phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={tAuth('phonePlaceholder')}
                      />
                    </div>
                  </div>
                )}
              </>
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
                    className="grid grid-cols-2 gap-3 pt-2"
                  >
                    <div>
                      <Label htmlFor="personalNumber" className="text-sm">{t('personalNumber')}</Label>
                      <Input
                        id="personalNumber"
                        value={personalNumber}
                        onChange={(e) => setPersonalNumber(e.target.value)}
                        placeholder={t('personalNumberPlaceholder')}
                        className="h-9"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="companyName" className="text-sm">{t('companyName')}</Label>
                      <Input
                        id="company"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={t('companyPlaceholder')}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="streetAddress" className="text-sm">{t('streetAddress')}</Label>
                      <Input
                        id="streetAddress"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder={t('streetAddressPlaceholder')}
                        className="h-9"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="postalCode" className="text-sm">{t('postalCode')}</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder={t('postalCodePlaceholder')}
                        className="h-9"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city" className="text-sm">{t('city')}</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('cityPlaceholder')}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="vat" className="text-sm">{t('vatNumber')}</Label>
                      <Input
                        id="vat"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        placeholder={t('vatPlaceholder')}
                        className="h-9"
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
                          onChange={(e) => {
                            setDiscountCode(e.target.value);
                            // Clear any previous validation errors when user types
                            if (error && error.includes(tBooking('invalidDiscountCode'))) {
                              setError(null);
                            }
                          }}
                          placeholder={tBooking('enterDiscountCode')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              validateDiscountCode();
                            }
                          }}
                          disabled={discountValidation?.valid || isValidatingDiscount}
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
                disabled={loading || !canProceed()}
                className="flex-1 bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90 text-white"
              >
                {loading ? t('processing') : t('completePurchase')}
              </Button>
            </div>

            {/* Security note and Privacy Policy */}
            <p className="text-xs text-center text-gray-500">
              {t('securePayment')} • {' '}
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-[var(--yoga-sage)] hover:underline"
              >
                {tAuth('privacyPolicy')}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
      
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </>
  );
}