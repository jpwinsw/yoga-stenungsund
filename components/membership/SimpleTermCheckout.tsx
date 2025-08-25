'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan, Service } from '@/lib/types/braincore';
import { braincore } from '@/lib/api/braincore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Info, ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface SimpleTermCheckoutProps {
  plan: MembershipPlan;
  isOpen: boolean;
  onClose: () => void;
}

interface AvailableSlot {
  session_id: number;
  date: string;
  start_time: string;
  end_time: string;
  instructor_name: string;
  available_spots: number;
}

interface TermAvailability {
  term_start: string;
  term_end: string;
  total_weeks: number;
  sessions_per_week: number;
  total_required_sessions: number;
  available_slots_by_week: Record<string, AvailableSlot[]>;
}

type Step = 'checkout-info' | 'class-type' | 'review-sessions' | 'confirm';

export default function SimpleTermCheckout({ plan, isOpen, onClose }: SimpleTermCheckoutProps) {
  const t = useTranslations('membership.checkout');
  const tTerm = useTranslations('membership.termBooking');
  const tAuth = useTranslations('auth.signup');
  const tBooking = useTranslations('schema.booking');
  const locale = useLocale();
  const dateLocale = locale === 'sv' ? sv : enUS;
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('checkout-info');
  
  // Auth & user info
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{first_name?: string; last_name?: string; email?: string} | null>(null);
  
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
  const [error, setError] = useState<string | null>(null);
  
  // Term booking specific
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [availability, setAvailability] = useState<TermAvailability | null>(null);
  const [deselectedSessions, setDeselectedSessions] = useState<Set<number>>(new Set());
  const [serviceTemplates, setServiceTemplates] = useState<Service[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

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

  const handleAuthAndProceed = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated already - if so, skip all auth steps!
      if (!braincore.isAuthenticated()) {
        // If user manually selected "I have an account" or we auto-detected they need password
        if (isExistingUser || needsPassword) {
          // Try to login
          try {
            await braincore.login({ email, password });
          } catch (loginError: unknown) {
            const errorMsg = loginError && typeof loginError === 'object' && 'response' in loginError
              ? (loginError as {response?: {data?: {detail?: string}}}).response?.data?.detail
              : undefined;
            setError(errorMsg || t('errors.invalidPassword'));
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
      
      // Store receipt details for later use
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
      
      // Store discount code for later use
      if (discountValidation?.valid) {
        sessionStorage.setItem('discount_code', discountCode);
      }
      
      // Move to class selection
      setCurrentStep('class-type');
      await loadTemplates();
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {detail?: string}}}).response?.data?.detail
        : undefined;
      setError(errorMsg || t('errors.checkoutFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      // Fetch only the allowed services from the API using the filtered endpoint
      const services = await braincore.getServices(plan.allowed_service_templates);
      setServiceTemplates(services);
    } catch (error) {
      console.error('Failed to load service templates:', error);
      toast({
        title: tTerm('error'),
        description: tTerm('failedToLoadTemplates'),
        variant: 'destructive',
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedTemplateId) return;

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateStr = today.toISOString().split('T')[0];
      
      const response = await braincore.getTermAvailability(
        plan.id,
        selectedTemplateId,
        dateStr
      );
      setAvailability(response);
      setDeselectedSessions(new Set());
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast({
        title: tTerm('error'),
        description: tTerm('failedToLoadAvailability'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionToggle = (sessionId: number) => {
    const newDeselected = new Set(deselectedSessions);
    if (newDeselected.has(sessionId)) {
      newDeselected.delete(sessionId);
    } else {
      newDeselected.add(sessionId);
    }
    setDeselectedSessions(newDeselected);
  };

  const handleCheckout = async () => {
    if (!selectedTemplateId || !availability) return;

    setCheckingOut(true);
    try {
      interface SelectedSession {
        session_id: number;
        date: Date;
        time: string;
      }
      const selectedSessions: SelectedSession[] = [];
      Object.values(availability.available_slots_by_week).forEach(slots => {
        slots.forEach(slot => {
          if (!deselectedSessions.has(slot.session_id)) {
            selectedSessions.push({
              session_id: slot.session_id,
              date: new Date(slot.date),
              time: slot.start_time,
            });
          }
        });
      });
      
      const termStartDate = selectedSessions.length > 0 
        ? selectedSessions[0].date 
        : new Date();
      
      // Get stored discount code
      const storedDiscountCode = sessionStorage.getItem('discount_code');
      
      const response = await braincore.createTermMembershipCheckout({
        plan_id: plan.id,
        selected_service_template_id: selectedTemplateId,
        term_start_date: termStartDate.toISOString(),
        pre_booked_sessions: selectedSessions,
        success_url: `${window.location.origin}/medlemskap/terminskort-tack`,
        cancel_url: `${window.location.origin}/medlemskap`,
        ...(storedDiscountCode && { discount_code: storedDiscountCode })
      });

      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      toast({
        title: tTerm('error'),
        description: tTerm('failedToCreateCheckout'),
        variant: 'destructive',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 'checkout-info':
        await handleAuthAndProceed();
        break;
      case 'class-type':
        if (selectedTemplateId) {
          await loadAvailability();
          setCurrentStep('review-sessions');
        }
        break;
      case 'review-sessions':
        setCurrentStep('confirm');
        break;
      case 'confirm':
        await handleCheckout();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'class-type':
        setCurrentStep('checkout-info');
        break;
      case 'review-sessions':
        setCurrentStep('class-type');
        break;
      case 'confirm':
        setCurrentStep('review-sessions');
        break;
    }
  };

  const finalPrice = discountValidation?.valid 
    ? discountValidation.final_amount 
    : plan.price;

  const getSelectedSessionCount = () => {
    if (!availability) return 0;
    let total = 0;
    Object.values(availability.available_slots_by_week).forEach(slots => {
      total += slots.filter(slot => !deselectedSessions.has(slot.session_id)).length;
    });
    return total;
  };

  const renderCheckoutInfo = () => (
    <div className="space-y-4">
      {/* Price display */}
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-light">
          {formatPrice(finalPrice)}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {tTerm('termDuration', { weeks: Math.ceil((plan.term_duration_days || 0) / 7) })} • {tTerm('sessionsPerWeek', { count: plan.sessions_per_week || 1 })}
        </p>
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

          {/* Password or new user fields */}
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
                        sessionStorage.removeItem('discount_code');
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
    </div>
  );

  const renderClassTypeStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{tTerm('selectClassType')}</p>
      
      {loadingTemplates ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <RadioGroup value={selectedTemplateId?.toString()} onValueChange={(value) => setSelectedTemplateId(parseInt(value))}>
          <div className="space-y-3">
            {serviceTemplates.map((template) => (
              <div key={template.id} className="relative">
                <RadioGroupItem value={template.id.toString()} id={`template-${template.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`template-${template.id}`}
                  className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 peer-checked:border-[var(--yoga-sage)] peer-checked:bg-[var(--yoga-light-sage)]/10"
                >
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.duration_minutes} {tTerm('minutes', { count: template.duration_minutes })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {tTerm('maxParticipants', { count: template.max_participants || 0 })}
                      </div>
                      {template.difficulty_level && (
                        <Badge variant="secondary" className="text-xs">
                          {tTerm(template.difficulty_level)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}
    </div>
  );

  const renderReviewSessionsStep = () => {
    if (!availability) return null;

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>{tTerm('termDates', { 
            start: format(new Date(availability.term_start), 'PP', { locale: dateLocale }),
            end: format(new Date(availability.term_end), 'PP', { locale: dateLocale })
          })}</p>
          <p className="mt-2">{tTerm('reviewSessions', { total: availability.total_required_sessions })}</p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(availability.available_slots_by_week).map(([weekNum, slots]) => (
            <div key={weekNum} className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">{tTerm('week')} {weekNum}</h4>
              <div className="space-y-2">
                {slots.map((slot) => {
                  const isSelected = !deselectedSessions.has(slot.session_id);
                  return (
                    <label
                      key={slot.session_id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSessionToggle(slot.session_id)}
                        className="rounded border-gray-300 text-[var(--yoga-sage)] focus:ring-[var(--yoga-sage)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(slot.date), 'EEEE d MMM', { locale: dateLocale })}
                          </span>
                          <span className="text-sm text-gray-500">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {slot.instructor_name} • {slot.available_spots} {tTerm('spotsAvailable')}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
          <span>{tTerm('selectAllSessionsDescription', { 
            selected: getSelectedSessionCount(),
            required: availability.total_required_sessions 
          })}</span>
          {getSelectedSessionCount() < availability.total_required_sessions && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {availability.total_required_sessions - getSelectedSessionCount()} {tTerm('selectAllSessions')}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => {
    const selectedTemplate = serviceTemplates.find(t => t.id === selectedTemplateId);
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium">{tTerm('confirmBooking')}</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{tTerm('membershipType')}</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{tTerm('classType')}</span>
            <span className="font-medium">{selectedTemplate?.name}</span>
          </div>
          
          {availability && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">{tTerm('termPeriod')}</span>
                <span className="font-medium">
                  {format(new Date(availability.term_start), 'PP', { locale: dateLocale })} - 
                  {format(new Date(availability.term_end), 'PP', { locale: dateLocale })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{tTerm('totalSessions')}</span>
                <span className="font-medium">{getSelectedSessionCount()}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between pt-3 border-t">
            <span className="text-gray-600">{tTerm('totalPrice')}</span>
            <span className="font-medium text-lg">{formatPrice(finalPrice)}</span>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">{tTerm('paymentNote')}</p>
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'checkout-info':
        return renderCheckoutInfo();
      case 'class-type':
        return renderClassTypeStep();
      case 'review-sessions':
        return renderReviewSessionsStep();
      case 'confirm':
        return renderConfirmStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'checkout-info':
        return !loading && (isLoggedIn || (email && ((needsPassword || isExistingUser) ? password : (firstName && lastName))));
      case 'class-type':
        return selectedTemplateId !== null;
      case 'review-sessions':
        return getSelectedSessionCount() === availability?.total_required_sessions;
      case 'confirm':
        return !checkingOut;
      default:
        return false;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 'checkout-info':
        return loading ? t('processing') : tTerm('next');
      case 'class-type':
        return loading ? t('processing') : tTerm('next');
      case 'review-sessions':
        return tTerm('next');
      case 'confirm':
        return checkingOut ? tTerm('processing') : tTerm('proceedToPayment');
      default:
        return tTerm('next');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{plan.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {getStepContent()}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {currentStep !== 'checkout-info' && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading || checkingOut}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {tTerm('back')}
                </Button>
              )}
              
              {currentStep === 'checkout-info' && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {tBooking('cancel')}
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90 text-white"
              >
                {getButtonText()}
                {(currentStep !== 'confirm' && currentStep !== 'checkout-info') && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>

            {/* Security note for checkout info step */}
            {currentStep === 'checkout-info' && (
              <p className="text-xs text-center text-gray-500">
                {t('securePayment')}
              </p>
            )}
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