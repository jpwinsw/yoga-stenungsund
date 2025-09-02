'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan, ScheduleSession } from '@/lib/types/braincore';
import { braincore } from '@/lib/api/braincore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { format, addWeeks, startOfWeek, getWeek, endOfWeek } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import WeeklyScheduleSelector from '@/components/membership/WeeklyScheduleSelector';

interface EnhancedTermCheckoutProps {
  plan: MembershipPlan;
  isOpen: boolean;
  onClose: () => void;
}

interface WeeklyPattern {
  dayOfWeek: number;
  time: string;
  sessionId: number;
  templateId: number;
  instructorName?: string;
}

interface WeekSchedule {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  sessions: ScheduleSession[];
  selectedSessions: number[];
  conflicts: ConflictInfo[];
}

interface ConflictInfo {
  patternSlot: WeeklyPattern;
  reason: string;
  alternatives: ScheduleSession[];
}

type Step = 'auth' | 'schedule-week1' | 'review-pattern' | 'apply-pattern' | 'confirm';

export default function EnhancedTermCheckout({ plan, isOpen, onClose }: EnhancedTermCheckoutProps) {
  const t = useTranslations('membership.termCheckout');
  const tMembership = useTranslations('membership');
  const tAuth = useTranslations('auth.signup');
  const tCheckout = useTranslations('membership.checkout');
  const tBooking = useTranslations('schema.booking');
  const tWeekly = useTranslations('membership.weeklySchedule');
  const locale = useLocale();
  const dateLocale = locale === 'sv' ? sv : enUS;
  
  // Step management - start with auth if not logged in
  const [currentStep, setCurrentStep] = useState<Step>('auth');
  
  // Auth state - will be checked on mount
  // Removed isLoggedIn and currentUser - using authenticatedUser instead
  
  // Auth form state (from SimpleMembershipCheckout)
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
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [personalNumber, setPersonalNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    discount_amount: number;
    final_amount: number;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [showDiscountField, setShowDiscountField] = useState(false);
  
  // Selection state - no longer needed since we show all allowed templates
  // Removed service templates state - we load all sessions directly now
  
  // Week 1 scheduling
  const [week1Sessions, setWeek1Sessions] = useState<ScheduleSession[]>([]);
  const [selectedWeek1Sessions, setSelectedWeek1Sessions] = useState<number[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [termStartDate, setTermStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Pattern and replication
  const [weeklyPattern, setWeeklyPattern] = useState<WeeklyPattern[]>([]);
  const [allWeekSchedules, setAllWeekSchedules] = useState<WeekSchedule[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Term details from API
  const [termInfo, setTermInfo] = useState<{
    term_start: string;
    term_end: string;
    total_weeks: number;
    sessions_per_week: number;
    total_required_sessions: number;
  } | null>(null);
  const [, setLoadingTermInfo] = useState(false);
  
  // These will be set from API data
  // const termWeeks = termInfo?.total_weeks || 0; // Not currently used
  const sessionsPerWeek = termInfo?.sessions_per_week || plan.sessions_per_week || 1;
  const totalSessions = termInfo?.total_required_sessions || 0;

  // Removed unused loadTemplates function - we're loading all sessions instead


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

  const handleAuthAndProceed = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Auto-validate discount code if entered but not validated
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
          } else {
            // Invalid discount code - continue without discount
            setDiscountCode('');
            setDiscountValidation(null);
          }
        } catch {
          // Error validating - continue without discount
          setDiscountCode('');
          setDiscountValidation(null);
        } finally {
          setIsValidatingDiscount(false);
        }
      }
      // Check if user is authenticated already
      if (!braincore.isAuthenticated()) {
        // If user manually selected "I have an account" or we auto-detected they need password
        if (isExistingUser || needsPassword) {
          // Try to login
          try {
            await braincore.login({ email, password });
          } catch (loginError) {
            const error = loginError as Error & { response?: { data?: { detail?: string } } };
            setError(error.response?.data?.detail || 'Invalid password');
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
              password,
              first_name: firstName,
              last_name: lastName,
              phone
            });
            
            // Auto-login with same password
            await braincore.login({ 
              email, 
              password
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
      
      // Successfully authenticated - fetch term info first
      const profile = await braincore.getMemberProfile();
      setAuthenticatedUser(profile);
      
      // Fetch term information from API
      await fetchTermInfo();
      
      // Then load sessions for week 1
      await loadWeek1AllSessions();
      
      // Move to schedule selection
      setCurrentStep('schedule-week1');
      
    } catch (err) {
      const error = err as Error & { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch term information from API
  const fetchTermInfo = useCallback(async () => {
    setLoadingTermInfo(true);
    setError(null);
    try {
      // Get the first allowed service template ID
      const templateId = plan.allowed_service_templates?.[0];
      if (!templateId) {
        throw new Error('No service templates configured for this membership');
      }
      
      // Fetch term availability from API
      const termData = await braincore.getTermAvailability(
        plan.id,
        templateId,
        termStartDate.toISOString()
      );
      
      setTermInfo({
        term_start: termData.term_start,
        term_end: termData.term_end,
        total_weeks: termData.total_weeks,
        sessions_per_week: termData.sessions_per_week,
        total_required_sessions: termData.total_required_sessions
      });
      
      // Update term start date to actual term start only if different
      const actualTermStart = new Date(termData.term_start);
      if (actualTermStart.getTime() !== termStartDate.getTime()) {
        setTermStartDate(actualTermStart);
      }
      
      return termData;
    } catch (error) {
      console.error('Failed to fetch term info:', error);
      setError('Failed to load term information. Please try again.');
      throw error;
    } finally {
      setLoadingTermInfo(false);
    }
  }, [plan.id, plan.allowed_service_templates, termStartDate]);

  // Load sessions for week 1 that are allowed for this membership
  const loadWeek1AllSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const today = new Date();
      let weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      let validSessions: ScheduleSession[] = [];
      let weeksChecked = 0;
      const maxWeeksToCheck = 4; // Look up to 4 weeks ahead for available classes
      
      // Keep looking for a week with available sessions
      while (validSessions.length === 0 && weeksChecked < maxWeeksToCheck) {
        const weekEnd = addWeeks(weekStart, 1);
        
        // Get ALL sessions for this week
        const sessions = await braincore.getSchedule(
          weekStart.toISOString().split('T')[0],
          weekEnd.toISOString().split('T')[0]
        );
        
        // Filter for allowed service templates AND available spots
        const allowedTemplateIds = plan.allowed_service_templates || [];
        validSessions = sessions.filter(s => 
          allowedTemplateIds.includes(s.service_template_id) && 
          s.available_spots > 0
        );
        
        // If no sessions found, try next week
        if (validSessions.length === 0) {
          weekStart = addWeeks(weekStart, 1);
          weeksChecked++;
        }
      }
      
      // Update the term start date to the week we found
      setTermStartDate(weekStart);
      setWeek1Sessions(validSessions);
      
      if (validSessions.length === 0) {
        setError('No available classes found in the next 4 weeks');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Failed to load available sessions');
    } finally {
      setLoadingSessions(false);
    }
  }, [plan.allowed_service_templates]);

  // Check auth status on mount
  useEffect(() => {
    if (!isOpen) return;
    
    const checkAuth = async () => {
      setCheckingAuth(true);
      if (braincore.isAuthenticated()) {
        try {
          const profile = await braincore.getMemberProfile();
          setAuthenticatedUser(profile);
          // Pre-fill fields if we have them
          if (profile.email) setEmail(profile.email);
          if (profile.first_name) setFirstName(profile.first_name);
          if (profile.last_name) setLastName(profile.last_name);
          
          // DON'T skip auth step - let users add receipt details and discount codes
          // Users can click Next when ready
        } catch (error) {
          console.error('Failed to get profile:', error);
        }
      }
      setCheckingAuth(false);
    };
    
    checkAuth();
  }, [isOpen]);

  // Note: We removed the single template loading function since we now load all allowed templates

  const extractPatternFromWeek1 = () => {
    const pattern: WeeklyPattern[] = selectedWeek1Sessions.map(sessionId => {
      const session = week1Sessions.find(s => s.id === sessionId);
      if (!session) return null;
      
      const sessionDate = new Date(session.start_time);
      return {
        dayOfWeek: sessionDate.getDay(),
        time: format(sessionDate, 'HH:mm'),
        sessionId: session.id,
        templateId: session.service_template_id,
        instructorName: session.instructor_name
      };
    })
    .filter(Boolean) as WeeklyPattern[];
    
    // Sort pattern by day of week and time
    pattern.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.time.localeCompare(b.time);
    });
    
    setWeeklyPattern(pattern);
  };

  const applyPatternToAllWeeks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!termInfo) {
        throw new Error('Term information not available');
      }
      
      const schedules: WeekSchedule[] = [];
      
      // Week 1 is already done
      schedules.push({
        weekNumber: 1,
        startDate: termStartDate,
        endDate: addWeeks(termStartDate, 1),
        sessions: week1Sessions,
        selectedSessions: selectedWeek1Sessions,
        conflicts: []
      });
      
      // Fetch ALL remaining weeks' data in one request
      const termEndDate = new Date(termInfo.term_end);
      const batchStartDate = addWeeks(termStartDate, 1); // Start from week 2
      
      // Get all sessions for the entire remaining term period in ONE request
      const allRemainingSessions = await braincore.getSchedule(
        batchStartDate.toISOString().split('T')[0],
        termEndDate.toISOString().split('T')[0]
      );
      
      // Filter for allowed templates once
      const allowedTemplateIds = plan.allowed_service_templates || [];
      const allTemplateSessions = allRemainingSessions.filter(
        s => allowedTemplateIds.includes(s.service_template_id) && s.available_spots > 0
      );
      
      // Now organize sessions by week and apply pattern
      for (let week = 2; week <= termInfo.total_weeks; week++) {
        const weekStart = addWeeks(termStartDate, week - 1);
        const weekEnd = addWeeks(weekStart, 1);
        
        // Don't go beyond term end
        if (weekStart > termEndDate) {
          break;
        }
        
        // Filter sessions for this specific week from our batch data
        const weekSessions = allTemplateSessions.filter(session => {
          const sessionDate = new Date(session.start_time);
          return sessionDate >= weekStart && sessionDate < weekEnd;
        });
        
        // Try to match pattern
        const { matched, conflicts } = matchPatternToSessions(weeklyPattern, weekSessions);
        
        schedules.push({
          weekNumber: week,
          startDate: weekStart,
          endDate: weekEnd,
          sessions: weekSessions,
          selectedSessions: matched,
          conflicts: conflicts
        });
      }
      
      setAllWeekSchedules(schedules);
      
      // Check if there are any conflicts
      const hasConflicts = schedules.some(week => week.conflicts.length > 0);
      
      // Skip the apply-pattern step if no conflicts
      if (hasConflicts) {
        setCurrentStep('apply-pattern');
      } else {
        setCurrentStep('confirm');
      }
    } catch (error) {
      console.error('Failed to apply pattern:', error);
      setError('Failed to apply pattern to all weeks');
    } finally {
      setLoading(false);
    }
  };

  const matchPatternToSessions = (
    pattern: WeeklyPattern[], 
    sessions: ScheduleSession[]
  ): { matched: number[], conflicts: ConflictInfo[] } => {
    const matched: number[] = [];
    const conflicts: ConflictInfo[] = [];
    const usedSessions = new Set<number>();
    
    for (const patternSlot of pattern) {
      // Try to find exact match
      let matchFound = false;
      
      for (const session of sessions) {
        if (usedSessions.has(session.id)) continue;
        
        const sessionDate = new Date(session.start_time);
        const sessionTime = format(sessionDate, 'HH:mm');
        const sessionDay = sessionDate.getDay();
        
        // Check if day and time match
        if (sessionDay === patternSlot.dayOfWeek && sessionTime === patternSlot.time) {
          matched.push(session.id);
          usedSessions.add(session.id);
          matchFound = true;
          break;
        }
      }
      
      if (!matchFound) {
        // Find alternatives
        const alternatives = sessions
          .filter(s => !usedSessions.has(s.id))
          .filter(s => {
            const sessionDate = new Date(s.start_time);
            return sessionDate.getDay() === patternSlot.dayOfWeek;
          })
          .slice(0, 3); // Top 3 alternatives
        
        conflicts.push({
          patternSlot,
          reason: 'No exact match found',
          alternatives
        });
      }
    }
    
    return { matched, conflicts };
  };

  const handleConflictResolution = (weekIndex: number, sessionId: number, patternIndex: number) => {
    const updatedSchedules = [...allWeekSchedules];
    const week = updatedSchedules[weekIndex];
    
    // Remove the conflict
    week.conflicts = week.conflicts.filter((_, i) => i !== patternIndex);
    
    // Add the selected session
    week.selectedSessions.push(sessionId);
    
    setAllWeekSchedules(updatedSchedules);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Auto-validate discount code if entered but not validated - same as SimpleMembershipCheckout
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
      
      // Prepare all selected sessions from all weeks
      const allSelectedSessions = allWeekSchedules.flatMap(week => 
        week.selectedSessions.map(sessionId => {
          const session = week.sessions.find(s => s.id === sessionId);
          if (!session) {
            console.warn(`Session ${sessionId} not found in week ${week.weekNumber}`);
            return null;
          }
          return {
            session_id: sessionId,
            date: new Date(session.start_time),
            time: format(new Date(session.start_time), 'HH:mm'),
            template_id: session.service_template_id // Include template ID from the session
          };
        }).filter(Boolean)
      );

      if (allSelectedSessions.length === 0) {
        setError('No sessions selected');
        setLoading(false);
        return;
      }

      // Get the most common template ID from selected sessions
      // (in case multiple templates are allowed in the future)
      const templateCounts = allSelectedSessions.reduce((acc, s) => {
        if (s?.template_id) {
          acc[s.template_id] = (acc[s.template_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);
      
      const primaryTemplateId = Object.entries(templateCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      if (!primaryTemplateId) {
        setError('Could not determine class type');
        setLoading(false);
        return;
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
      
      // Create checkout session with temporary reservation and discount if applicable - same as SimpleMembershipCheckout
      const response = await braincore.createTermMembershipCheckout({
        plan_id: plan.id,
        selected_service_template_id: parseInt(primaryTemplateId),
        term_start_date: termStartDate.toISOString(),
        pre_booked_sessions: allSelectedSessions.filter(s => s !== null) as { session_id: number; date: Date; time: string; }[],
        discount_code: finalDiscountValidation?.valid ? discountCode : undefined,
        success_url: `${window.location.origin}/medlemskap/terminskort-tack`,
        cancel_url: `${window.location.origin}/medlemskap`,
        receipt_details: receiptDetails
      });
      
      if (response.checkout_url) {
        // Sessions are now temporarily reserved during Stripe checkout
        // The backend should handle releasing them if payment fails
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(tMembership('failedToCreateCheckout'));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'auth':
        return renderAuthStep();
      case 'schedule-week1':
        return renderScheduleWeek1Step();
      case 'review-pattern':
        return renderReviewPatternStep();
      case 'apply-pattern':
        return renderApplyPatternStep();
      case 'confirm':
        return renderConfirmStep();
      default:
        return null;
    }
  };


  const renderAuthStep = () => {
    const finalPrice = discountValidation?.valid 
      ? discountValidation.final_amount 
      : plan.price;
      
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: plan.currency || 'SEK',
        minimumFractionDigits: 0,
      }).format(price);
    };
    
    const getPeriodText = () => {
      // For term memberships, just show the term text
      // We could also use billing_period if it's set
      return '';  // No period text needed for term memberships as it's a one-time payment
    };
    
    return (
      <div className="space-y-3">
        {/* Price display */}
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <div className="text-2xl font-light">
            {formatPrice(finalPrice)}
            <span className="text-lg text-gray-600 ml-2">{getPeriodText()}</span>
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
        {/* If user is logged in, show simple message */}
        {authenticatedUser ? (
        <div className="bg-[var(--yoga-light-sage)] p-4 rounded-lg">
          <p className="text-sm font-medium">
            {tCheckout('proceedWithPurchase', { 
              name: authenticatedUser.first_name || authenticatedUser.email || 'there' 
            })}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {tCheckout('addReceiptDetailsBelow')}
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
              {isExistingUser ? tCheckout('newCustomer') : tCheckout('haveAccount')}
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
                      <strong className="font-semibold text-orange-900">{tCheckout('accountExists')}</strong>
                      <br />
                      <span className="text-orange-800">
                        {tCheckout('accountExistsDescription', { email })}
                      </span>
                    </AlertDescription>
                  </Alert>
                  <div className="bg-[var(--yoga-light-sage)] p-4 rounded-lg">
                    <p className="text-sm font-medium">{tCheckout('welcomeBack', { name: existingUserName })}</p>
                    <p className="text-xs text-gray-600 mt-1">{tCheckout('enterPasswordToContinue')}</p>
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
                {tCheckout('forgotPassword')}
              </button>
            </div>
          ) : (
            /* New user fields - 2-column layout matching SimpleMembershipCheckout */
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

      {/* Optional receipt details */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowReceiptDetails(!showReceiptDetails)}
          className="text-sm text-[var(--yoga-sage)] hover:underline flex items-center gap-1"
        >
          {showReceiptDetails ? '−' : '+'} {tCheckout('addReceiptDetails')}
        </button>
        
        {showReceiptDetails && (
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="personalNumber">{tCheckout('personalNumber')} ({tCheckout('optional')})</Label>
              <Input
                id="personalNumber"
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value)}
                placeholder={tCheckout('personalNumberPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="streetAddress">{tCheckout('streetAddress')}</Label>
              <Input
                id="streetAddress"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder={tCheckout('streetAddressPlaceholder')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{tCheckout('postalCode')}</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={tCheckout('postalCodePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{tCheckout('city')}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={tCheckout('cityPlaceholder')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">{tCheckout('companyName')}</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={tCheckout('companyPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vat">{tCheckout('vatNumber')}</Label>
              <Input
                id="vat"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder={tCheckout('vatPlaceholder')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Discount code section - matches SimpleMembershipCheckout */}
      <div className="pt-3 border-t">
        {!showDiscountField && !discountValidation?.valid ? (
          <button
            type="button"
            onClick={() => setShowDiscountField(true)}
            className="text-sm text-[var(--yoga-sage)] hover:underline"
          >
            {tCheckout('haveDiscountCode')}
          </button>
        ) : (
          <div className="space-y-2">
            {(showDiscountField || discountValidation?.valid) && (
              <>
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
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: plan.currency || 'SEK',
                        minimumFractionDigits: 0,
                      }).format(discountValidation.discount_amount)} {tCheckout('saved')}
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
                      {tCheckout('remove')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Price summary when discount is applied */}
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
      
      {/* Privacy Policy note */}
      <p className="text-xs text-center text-gray-500 pt-2">
        {tAuth('termsAgreement')}{' '}
        <button
          type="button"
          onClick={() => setShowPrivacyPolicy(true)}
          className="text-[var(--yoga-sage)] hover:underline"
        >
          {tAuth('privacyPolicy')}
        </button>
      </p>
      </>
      )}
    </div>
    );
  };

  // Note: Select type step was removed - we now show all allowed class types in the weekly calendar

  const renderScheduleWeek1Step = () => {
    return (
      <WeeklyScheduleSelector
        weekStart={termStartDate}
        sessions={week1Sessions}
        selectedSessions={selectedWeek1Sessions}
        onSelectionChange={setSelectedWeek1Sessions}
        requiredSessions={sessionsPerWeek}
        weekNumber={1}
        loading={loadingSessions}
        error={error}
      />
    );
  };

  const renderReviewPatternStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">{t('reviewPattern')}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {t('patternDescription')}
        </p>
      </div>
      
      <div className="bg-[var(--yoga-light-sage)]/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--yoga-sage)]" />
          {t('yourWeeklyPattern')}
        </h4>
        <div className="space-y-2">
          {weeklyPattern.map((slot, idx) => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return (
              <div key={idx} className="flex items-center gap-3">
                <Badge>{days[slot.dayOfWeek]}</Badge>
                <span className="font-medium">{slot.time}</span>
                {slot.instructorName && (
                  <span className="text-sm text-gray-600">
                    {tWeekly('withInstructor', { instructor: slot.instructorName })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          {t('patternWillBeApplied', { weeks: (termInfo?.total_weeks || 1) - 1 })}
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="auto-resolve"
          defaultChecked
          className="rounded border-gray-300 text-[var(--yoga-sage)] focus:ring-[var(--yoga-sage)]"
        />
        <Label htmlFor="auto-resolve" className="text-sm">
          {t('autoResolveConflicts')}
        </Label>
      </div>
    </div>
  );

  const renderApplyPatternStep = () => {
    const totalScheduled = allWeekSchedules.reduce((sum, week) => sum + week.selectedSessions.length, 0);
    const totalConflicts = allWeekSchedules.reduce((sum, week) => sum + week.conflicts.length, 0);
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">{t('patternApplied')}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('reviewAndResolve')}
          </p>
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{totalScheduled} / {totalSessions}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">{t('sessionsScheduled')}</p>
          </div>
          
          {totalConflicts > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{totalConflicts}</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">{t('conflictsToResolve')}</p>
            </div>
          )}
        </div>
        
        {/* Week by week breakdown */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allWeekSchedules.map((week, weekIdx) => {
            const calendarWeek = getWeek(week.startDate, { locale: dateLocale });
            const weekEndDate = endOfWeek(week.startDate, { weekStartsOn: 1 });
            const dateRange = `${format(week.startDate, 'd MMM', { locale: dateLocale })} - ${format(weekEndDate, 'd MMM', { locale: dateLocale })}`;
            
            return (
              <div key={week.weekNumber} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">
                      {locale === 'sv' ? `Vecka ${calendarWeek}` : `Week ${calendarWeek}`}
                    </h4>
                    <p className="text-xs text-gray-500">{dateRange}</p>
                  </div>
                  <Badge variant={week.conflicts.length > 0 ? 'destructive' : 'default'}>
                    {week.selectedSessions.length} / {sessionsPerWeek}
                  </Badge>
                </div>
              
              {/* Show scheduled sessions */}
              {week.selectedSessions.map(sessionId => {
                const session = week.sessions.find(s => s.id === sessionId);
                if (!session) return null;
                
                return (
                  <div key={sessionId} className="text-sm text-gray-600 mb-1">
                    <CheckCircle className="w-3 h-3 inline mr-1 text-green-600" />
                    {format(new Date(session.start_time), 'EEE MMM d, HH:mm', { locale: dateLocale })}
                  </div>
                );
              })}
              
              {/* Show conflicts */}
              {week.conflicts.map((conflict, conflictIdx) => (
                <div key={conflictIdx} className="mt-2 p-2 bg-orange-50 rounded">
                  <p className="text-xs text-orange-700 mb-2">
                    {t('conflictFor')} {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][conflict.patternSlot.dayOfWeek]} {conflict.patternSlot.time}
                  </p>
                  <div className="space-y-1">
                    {conflict.alternatives.slice(0, 2).map(alt => (
                      <Button
                        key={alt.id}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs justify-start"
                        onClick={() => handleConflictResolution(weekIdx, alt.id, conflictIdx)}
                      >
                        {format(new Date(alt.start_time), 'EEE HH:mm')} - {alt.instructor_name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => {
    const totalScheduled = allWeekSchedules.reduce((sum, week) => sum + week.selectedSessions.length, 0);
    // Not currently used - commented out for future use
    // const firstSession = allWeekSchedules[0]?.sessions.find(
    //   s => s.id === allWeekSchedules[0]?.selectedSessions[0]
    // );
    // const lastWeek = allWeekSchedules[allWeekSchedules.length - 1];
    // const lastSession = lastWeek?.sessions.find(
    //   s => s.id === lastWeek?.selectedSessions[lastWeek.selectedSessions.length - 1]
    // );
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">{t('confirmBooking')}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('confirmDescription', { count: totalScheduled })}
          </p>
        </div>
        
        <div className="bg-[var(--yoga-light-sage)]/20 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('membership')}</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('termPeriod')}</span>
            <span className="font-medium">
              {termInfo ? 
                `${format(new Date(termInfo.term_start), 'd MMM')} - ${format(new Date(termInfo.term_end), 'd MMM yyyy')}` :
                'Loading...'
              }
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('totalSessions')}</span>
            <span className="font-medium">{totalScheduled} {t('classes')}</span>
          </div>
          
          {discountValidation?.valid && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{tBooking('discount')}</span>
              <span className="text-green-600">-{new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: plan.currency || 'SEK',
                minimumFractionDigits: 0,
              }).format(discountValidation.discount_amount)}</span>
            </div>
          )}
          
          <div className="flex justify-between pt-3 border-t">
            <span className="text-gray-600">{t('total')}</span>
            <span className="font-medium text-lg">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: plan.currency || 'SEK',
                minimumFractionDigits: 0,
              }).format(discountValidation?.valid ? discountValidation.final_amount : plan.price)}
            </span>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{t('reservationNote')}</strong> {t('reservationDescription')}
          </AlertDescription>
        </Alert>
        
        <Alert>
          <AlertDescription>
            {t('paymentNote')}
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'auth':
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
      case 'schedule-week1':
        return selectedWeek1Sessions.length === sessionsPerWeek;
      case 'review-pattern':
        return weeklyPattern.length > 0;
      case 'apply-pattern':
        const totalConflicts = allWeekSchedules.reduce((sum, week) => sum + week.conflicts.length, 0);
        return totalConflicts === 0;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 'auth':
        await handleAuthAndProceed();
        break;
      case 'schedule-week1':
        extractPatternFromWeek1();
        setCurrentStep('review-pattern');
        break;
      case 'review-pattern':
        await applyPatternToAllWeeks();
        // Navigation is handled inside applyPatternToAllWeeks based on conflicts
        break;
      case 'apply-pattern':
        setCurrentStep('confirm');
        break;
      case 'confirm':
        await handleCheckout();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'schedule-week1':
        setCurrentStep('auth');
        break;
      case 'review-pattern':
        setCurrentStep('schedule-week1');
        break;
      case 'apply-pattern':
        setCurrentStep('review-pattern');
        break;
      case 'confirm':
        // Check if we skipped apply-pattern (no conflicts)
        const hasConflicts = allWeekSchedules.some(week => week.conflicts.length > 0);
        if (hasConflicts) {
          setCurrentStep('apply-pattern');
        } else {
          setCurrentStep('review-pattern');
        }
        break;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${
          currentStep === 'auth' 
            ? 'w-[95vw] sm:max-w-2xl lg:max-w-3xl' // Same width as SimpleMembershipCheckout
            : 'w-[95vw] sm:max-w-4xl lg:max-w-6xl' // Wide for scheduling steps
        } max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>{plan.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress indicator - 4 main steps (apply-pattern only shows when conflicts) */}
            <div className="flex justify-between mb-4">
              {(() => {
                const steps = ['auth', 'schedule-week1', 'review-pattern', 'confirm'];
                const currentIndex = currentStep === 'apply-pattern' 
                  ? 2.5  // Show between review-pattern and confirm
                  : steps.indexOf(currentStep);
                
                return steps.map((step, idx) => (
                  <div
                    key={step}
                    className={`h-2 flex-1 mx-1 rounded-full ${
                      idx <= currentIndex
                        ? 'bg-[var(--yoga-sage)]'
                        : 'bg-gray-200'
                    }`}
                  />
                ));
              })()}
            </div>

            {/* Step content */}
            {renderStepContent()}

            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep !== 'auth' && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t('back')}
                </Button>
              )}
              
              {currentStep === 'auth' && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="flex-1 bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90"
              >
                {loading && currentStep === 'confirm' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('reservingSessions')}
                  </>
                ) : loading ? (
                  t('processing')
                ) : currentStep === 'confirm' ? (
                  t('proceedToPayment')
                ) : (
                  t('next')
                )}
                {currentStep !== 'confirm' && !loading && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
      
      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicyModal
          isOpen={showPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
        />
      )}
    </>
  );
}