'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MembershipPlan, Service } from '@/lib/types/braincore';
import { braincore } from '@/lib/api/braincore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface TermBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MembershipPlan;
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

type Step = 'class-type' | 'review-sessions' | 'confirm';

export default function TermBookingModal({ isOpen, onClose, plan }: TermBookingModalProps) {
  const t = useTranslations('membership.termBooking');
  const locale = useLocale();
  const dateLocale = locale === 'sv' ? sv : enUS;

  const [currentStep, setCurrentStep] = useState<Step>('class-type');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [availability, setAvailability] = useState<TermAvailability | null>(null);
  const [deselectedSessions, setDeselectedSessions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [serviceTemplates, setServiceTemplates] = useState<Service[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // Load service templates when modal opens
  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        // Fetch only the allowed services from the API using the filtered endpoint
        const services = await braincore.getServices(plan.allowed_service_templates);
        setServiceTemplates(services);
      } catch (error) {
        console.error('Failed to load service templates:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadTemplates'),
          variant: 'destructive',
        });
      } finally {
        setLoadingTemplates(false);
      }
    };

    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, plan, t]);

  const handleNext = async () => {
    switch (currentStep) {
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
      case 'review-sessions':
        setCurrentStep('class-type');
        break;
      case 'confirm':
        setCurrentStep('review-sessions');
        break;
    }
  };

  const loadAvailability = async () => {
    if (!selectedTemplateId) return;

    setLoading(true);
    try {
      // The API should return the actual term schedule based on the plan
      // We'll pass today's date and let the backend determine the term period
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Format date as YYYY-MM-DD for the API
      const dateStr = today.toISOString().split('T')[0];
      
      const response = await braincore.getTermAvailability(
        plan.id,
        selectedTemplateId,
        dateStr
      );
      setAvailability(response);
      // By default, all sessions are selected (none deselected)
      setDeselectedSessions(new Set());
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadAvailability'),
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
      // Get all sessions that are NOT deselected
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
      
      // Use the first session's date as the term start
      const termStartDate = selectedSessions.length > 0 
        ? selectedSessions[0].date 
        : new Date();
      
      const response = await braincore.createTermMembershipCheckout({
        plan_id: plan.id,
        selected_service_template_id: selectedTemplateId,
        term_start_date: termStartDate.toISOString(),
        pre_booked_sessions: selectedSessions,
        success_url: `${window.location.origin}/medlemskap/terminskort-tack`,
        cancel_url: `${window.location.origin}/medlemskap`,
      });

      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      toast({
        title: t('error'),
        description: t('failedToCreateCheckout'),
        variant: 'destructive',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'class-type':
        return (
          <div className="space-y-4">
            <DialogDescription>{t('selectClassType')}</DialogDescription>
            {loadingTemplates ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <RadioGroup
                value={selectedTemplateId?.toString()}
                onValueChange={(value) => setSelectedTemplateId(parseInt(value))}
              >
                {serviceTemplates.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <RadioGroupItem value={service.id.toString()} id={`template-${service.id}`} />
                    <Label
                      htmlFor={`template-${service.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                      )}
                      {(service.duration_minutes || service.difficulty_level || service.max_participants) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {service.duration_minutes && (
                            <span>{`${service.duration_minutes} min`}</span>
                          )}
                          {service.difficulty_level && (
                            <span className="capitalize">
                              {(() => {
                                switch(service.difficulty_level) {
                                  case 'beginner': return t('beginner');
                                  case 'intermediate': return t('intermediate');
                                  case 'advanced': return t('advanced');
                                  case 'all_levels': return t('allLevels');
                                  default: return service.difficulty_level;
                                }
                              })()}
                            </span>
                          )}
                          {service.max_participants && (
                            <span>{`Max ${service.max_participants} ${locale === 'sv' ? 'deltagare' : 'participants'}`}</span>
                          )}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );


      case 'review-sessions':
        return (
          <div className="space-y-4">
            <DialogDescription>
              {t('reviewSessions', { 
                total: availability ? Object.values(availability.available_slots_by_week).flat().length : 0,
                deselected: deselectedSessions.size 
              })}
            </DialogDescription>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : availability ? (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(availability.available_slots_by_week).map(([week, slots]) => (
                  <div key={week} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{t('week')} {week}</h4>
                    <div className="space-y-2">
                      {slots.map((slot) => {
                        const isDeselected = deselectedSessions.has(slot.session_id);
                        
                        return (
                          <div
                            key={slot.session_id}
                            onClick={() => handleSessionToggle(slot.session_id)}
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-all
                              ${isDeselected 
                                ? 'opacity-50 border-gray-300 bg-gray-50' 
                                : 'border-[var(--yoga-sage)] bg-[var(--yoga-sage)]/10'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">
                                    {format(new Date(slot.date), 'EEEE d MMM', { locale: dateLocale })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {slot.start_time} - {slot.end_time}
                                  </span>
                                  {slot.instructor_name && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {slot.instructor_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {!isDeselected && (
                                <CheckCircle className="w-5 h-5 text-[var(--yoga-sage)]" />
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                {slot.available_spots} {t('spotsAvailable')}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4">
            <DialogDescription>{t('confirmBooking')}</DialogDescription>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('membershipType')}</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('classType')}</span>
                <span className="font-medium">
                  {serviceTemplates.find(s => s.id === selectedTemplateId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('termPeriod')}</span>
                <span className="font-medium">
                  {availability?.term_start && format(new Date(availability.term_start), 'PPP', { locale: dateLocale })} - 
                  {availability?.term_end && format(new Date(availability.term_end), 'PPP', { locale: dateLocale })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalSessions')}</span>
                <span className="font-medium">{availability ? Object.values(availability.available_slots_by_week).flat().length - deselectedSessions.size : 0}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">{t('totalPrice')}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: plan.currency,
                      minimumFractionDigits: 0,
                    }).format(plan.price)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{t('paymentNote')}</p>
          </div>
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'class-type':
        return t('stepTitles.classType');
      case 'review-sessions':
        return t('stepTitles.bookSessions');
      case 'confirm':
        return t('stepTitles.confirm');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'class-type':
        return selectedTemplateId !== null;
      case 'review-sessions':
        return true; // Always can proceed, even if some sessions are deselected
      case 'confirm':
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </DialogHeader>

        {renderStepContent()}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'class-type' || loading || checkingOut}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading || checkingOut}
            className="bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90"
          >
            {currentStep === 'confirm' ? (
              checkingOut ? t('processing') : t('proceedToPayment')
            ) : (
              <>
                {t('next')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}