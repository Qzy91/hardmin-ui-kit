import { Button } from '@/components/ui/button';
import { useGuide } from '@/contexts/guide-context';
import { useLanguage } from '@/contexts/language-context';
import { getOnboardingConfigs } from '@/lib/onboarding-config';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export function OnboardingTour() {
    const { t } = useLanguage();
    const { isActive, currentStep, configKey, stopTour, nextStep, prevStep } = useGuide();
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [allowTransition, setAllowTransition] = useState(false);

    const steps = useMemo(() => {
        if (!configKey) return [];
        const configs = getOnboardingConfigs(t);
        return configs[configKey] || [];
    }, [configKey, t]);

    const currentStepData = steps[currentStep];
    const isReady = coords.width > 0;
    const PADDING = 8;

    useEffect(() => {
        if (!isActive) {
            setCoords({ top: 0, left: 0, width: 0, height: 0 });
            setAllowTransition(false);
            return;
        }

        if (currentStepData) {
            const el = document.querySelector(currentStepData.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const rect = el.getBoundingClientRect();
                setCoords({
                    top: rect.top + window.scrollY - PADDING,
                    left: rect.left + window.scrollX - PADDING,
                    width: rect.width + PADDING * 2,
                    height: rect.height + PADDING * 2,
                });
                if (!allowTransition) {
                    const timer = setTimeout(() => {
                        setAllowTransition(true);
                    }, 50);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [isActive, currentStep, currentStepData, allowTransition]);

    if (!isActive || !currentStepData) return null;

    return createPortal(
        <div className="pointer-events-auto fixed inset-0 z-[100] overflow-hidden">
            <div
                className={cn(
                    'absolute rounded-xl transition-all ease-in-out',
                    allowTransition ? 'duration-500' : 'duration-0',
                    isReady ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    height: coords.height,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                }}
            />

            <div
                className={cn(
                    'absolute w-[350px] rounded-lg bg-white p-4 shadow-xl transition-all',
                    allowTransition ? 'duration-300' : 'duration-0',
                    isReady ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                    top: coords.top + coords.height + 8,
                    left: Math.min(window.innerWidth - 370, Math.max(20, coords.left)),
                }}
            >
                <button
                    onClick={stopTour}
                    className="absolute right-2 top-2 rounded p-1 hover:bg-slate-100"
                >
                    <X className="h-4 w-4" />
                </button>
                <h3 className="mb-2 text-lg font-bold">{currentStepData.title}</h3>
                <p className="mb-6 text-sm text-slate-600">{currentStepData.content}</p>
                <div className="flex items-center justify-between">
                    <button onClick={stopTour} className="text-xs text-slate-400 hover:underline">
                        {t('onboarding.controls.skip')}
                    </button>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="outline" size="sm" onClick={prevStep}>
                                {t('onboarding.controls.back')}
                            </Button>
                        )}
                        <Button
                            variant="main"
                            size="sm"
                            onClick={currentStep === steps.length - 1 ? stopTour : nextStep}
                        >
                            {currentStep === steps.length - 1
                                ? t('onboarding.controls.finish')
                                : t('onboarding.controls.next') +
                                  ` (${currentStep + 1} z ${steps.length})`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
