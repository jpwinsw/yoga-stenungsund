'use client'

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { braincore } from '@/lib/api/braincore';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

interface CheckoutAuthStepProps {
  onAuthComplete: (user: { id: number; email: string; first_name: string; last_name: string }) => void;
  onError: (error: string) => void;
  onFormChange?: (canProceed: boolean) => void; // Notify parent when form validity changes
  showReceiptSection?: boolean;
  showDiscountSection?: boolean;
  showActionButton?: boolean; // Whether to show the built-in action button
  children?: React.ReactNode; // For receipt and discount sections
}

export interface CheckoutAuthStepRef {
  handleAuth: () => Promise<void>;
  canProceed: () => boolean;
}

export const CheckoutAuthStep = forwardRef<CheckoutAuthStepRef, CheckoutAuthStepProps>(({ 
  onAuthComplete, 
  onError,
  onFormChange,
  showReceiptSection = true,
  showDiscountSection = true,
  showActionButton = true,
  children
}, ref) => {
  const t = useTranslations('membership.checkout');
  const tAuth = useTranslations('auth.signup');
  
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
  
  const handleAuth = async () => {
    setLoading(true);
    
    try {
      // Check if user is authenticated already
      if (authenticatedUser) {
        onAuthComplete(authenticatedUser);
        return;
      }
      
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
      
      // Successfully authenticated - get profile and complete
      const profile = await braincore.getMemberProfile();
      setAuthenticatedUser(profile);
      onAuthComplete(profile);
      
    } catch (err) {
      const error = err as Error & { response?: { data?: { detail?: string } } };
      onError(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  const canProceed = useCallback(() => {
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
  }, [authenticatedUser, email, needsPassword, isExistingUser, password, firstName, lastName, confirmPassword]);
  
  // Notify parent when form validity changes
  useEffect(() => {
    if (onFormChange) {
      onFormChange(canProceed());
    }
  }, [canProceed, onFormChange]);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleAuth,
    canProceed
  }));
  
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
            /* New user fields - WIDE 2-column layout */
            <div className="space-y-3">
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
              </div>
              
              {/* Phone spans both columns */}
              <div>
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

      {/* Receipt and discount sections passed as children */}
      {(showReceiptSection || showDiscountSection) && children}
      
      {/* Action button - only show if showActionButton is true */}
      {showActionButton && (
        <Button
          onClick={handleAuth}
          disabled={!canProceed() || loading}
          className="w-full bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90"
        >
          {loading ? t('processing') : t('next')}
        </Button>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
});

CheckoutAuthStep.displayName = 'CheckoutAuthStep';