import { ContactOwnerDialog } from '@/components/common/contact-owner-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    Check,
    Database,
    FileText,
    HardDrive,
    Info,
    Lock,
    PlusCircle,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const PLANS_DATA = [
    {
        id: 'STARTER',
        basePrice: 2490,
        credits: 0,
        limits: {
            users: 5,
            measuredPoints: 6,
            records: 100,
            storage: 10,
            extraStoragePrice: 350,
            aiReports: 1,
            activation: 3000,
        },
        features: ['basicReporting', 'emailSupport', 'apiAccess', 'freeActivation'],
    },
    {
        id: 'PROFESSIONAL',
        basePrice: 8900,
        credits: 0,
        limits: {
            users: -1,
            measuredPoints: 20,
            records: 1000,
            storage: 25,
            extraStoragePrice: 250,
            aiReports: 5,
            activation: 2500,
        },
        features: ['advancedReporting', 'prioritySupport', 'apiAccess', 'freeActivation'],
    },
    {
        id: 'BUSINESS',
        basePrice: 14900,
        credits: 0,
        limits: {
            users: -1,
            measuredPoints: 30,
            records: 3000,
            storage: 100,
            extraStoragePrice: 225,
            aiReports: 10,
            activation: 2250,
        },
        features: [
            'enterpriseReporting',
            'support247',
            'apiAccess',
            'customIntegrations',
            'accountManager',
            'freeActivation',
        ],
    },
    {
        id: 'ENTERPRISE',
        basePrice: 21900,
        credits: 0,
        limits: {
            users: -1,
            measuredPoints: 50,
            records: 5000,
            storage: 500,
            extraStoragePrice: 200,
            aiReports: 20,
            activation: 2000,
        },
        features: [
            'fullReporting',
            'support247Priority',
            'apiAccess',
            'customIntegrations',
            'accountManager',
            'dedicatedTeam',
            'slaGuarantee',
            'freeActivation',
        ],
    },
];

interface SubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleName?: string;
}

export function SubscriptionDialog({ open, onOpenChange, moduleName }: SubscriptionDialogProps) {
    const { t } = useLanguage();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isYearly, setIsYearly] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => {
                setSelectedPlanId(null);
                setIsYearly(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: 'CZK',
            maximumFractionDigits: 0,
        })
            .format(value)
            .replace('CZK', 'Kč');
    };

    const formatNumber = (value: number) => new Intl.NumberFormat('cs-CZ').format(value);

    const tParams = (key: string, params: Record<string, string | number>) => {
        let text = t(key);
        if (!text || text === key) return text;
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(`{${paramKey}}`, String(paramValue));
        });
        return text;
    };

    const getPrice = (basePrice: number) => (isYearly ? basePrice * 0.75 : basePrice);

    const selectedPlanData = PLANS_DATA.find((p) => p.id === selectedPlanId);
    const selectedPrice = selectedPlanData ? getPrice(selectedPlanData.basePrice) : 0;

    const handlePurchase = () => {
        setIsContactDialogOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[98vh] w-full max-w-[98vw] overflow-y-auto p-4 sm:p-6 xl:max-w-[1300px]">
                    <DialogHeader className="mb-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-main_color/10 p-1.5">
                                <Lock className="h-5 w-5 text-main_color" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-text_primary">
                                {t('subscription.modalTitle')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="max-w-3xl text-sm text-text_secondary">
                            {tParams('subscription.modalDescription', {
                                module: moduleName || 'Modul',
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mb-4 flex flex-col items-center justify-between gap-4 border-b border-gray-100 pb-4 lg:flex-row">
                        <div className="w-full flex-1 lg:w-auto">
                            {selectedPlanData ? (
                                <div className="flex flex-col items-center gap-3 rounded-md border border-main_color/20 bg-main_color/15 px-4 py-1.5 duration-300 animate-in fade-in slide-in-from-left-4 sm:flex-row">
                                    <span className="whitespace-nowrap text-sm font-medium text-text_secondary">
                                        {t('subscription.selectedPlanInfo')}
                                    </span>
                                    <span className="text-lg font-black text-main_color">
                                        {selectedPlanId}
                                    </span>
                                    <div className="hidden h-4 w-[1px] bg-main_color/20 sm:block"></div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold">
                                            {formatCurrency(selectedPrice)}
                                            <span className="ml-1 text-xs font-normal">
                                                {t('subscription.billing.perMonth')}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center px-2 py-1.5 italic duration-300 animate-in fade-in">
                                    <Info className="mr-2 h-4 w-4" />
                                    <span className="text-sm">
                                        {t('subscription.noPlanSelected') ||
                                            'Vyberte balíček pro zobrazení kalkulace.'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-2">
                            <span
                                className={cn(
                                    'text-xs font-medium transition-colors',
                                    !isYearly ? 'text-text_primary' : '',
                                )}
                            >
                                {t('subscription.toggle.monthly')}
                            </span>
                            <Switch
                                checked={isYearly}
                                onCheckedChange={setIsYearly}
                                className="scale-75 data-[state=checked]:bg-main_color"
                            />
                            <span
                                className={cn(
                                    'text-xs font-medium transition-colors',
                                    isYearly ? 'text-text_primary' : '',
                                )}
                            >
                                {t('subscription.toggle.yearly')}
                            </span>
                            <span className="ml-1 rounded-full bg-[#22C55E] px-2 py-0.5 text-[10px] font-bold text-white">
                                {t('subscription.toggle.saveBadge')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {PLANS_DATA.map((plan) => {
                            const isSelected = plan.id === selectedPlanId;
                            const displayPrice = getPrice(plan.basePrice);

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={cn(
                                        'group relative flex cursor-pointer flex-col rounded-lg border-2 p-3 transition-all duration-200',
                                        isSelected
                                            ? 'z-10 scale-[1.01] border-main_color shadow-lg'
                                            : 'border-bg_border_element hover:border-main_color/50 hover:shadow-md',
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute right-2 top-2 duration-200 animate-in zoom-in">
                                            <div className="rounded-full bg-main_color p-0.5 text-white shadow-sm">
                                                <Check className="h-3 w-3" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}

                                    <h3
                                        className={cn(
                                            'mb-0.5 text-base font-black uppercase tracking-tight transition-colors',
                                            isSelected ? 'text-main_color' : 'text-text_primary',
                                        )}
                                    >
                                        {plan.id}
                                    </h3>
                                    <div className="mb-1">
                                        <span className="text-xl font-bold text-text_primary">
                                            {formatCurrency(displayPrice).replace('Kč', '')}
                                            <span className="text-sm"> Kč</span>
                                        </span>
                                        <span className="text-xs font-normal">
                                            {t('subscription.billing.perMonth')}
                                        </span>
                                    </div>

                                    <p className="mb-2 text-xs font-medium">
                                        {plan.credits === -1
                                            ? t('subscription.unlimitedCredits')
                                            : tParams('subscription.credits', {
                                                  count: formatNumber(plan.credits),
                                              })}
                                    </p>

                                    <div className="rounded-md p-2">
                                        <ul className="space-y-0.5">
                                            <LimitItem
                                                icon={Users}
                                                text={
                                                    plan.limits.users === -1
                                                        ? t('subscription.features.unlimitedUsers')
                                                        : tParams('subscription.features.users', {
                                                              count: plan.limits.users,
                                                          })
                                                }
                                            />
                                            <LimitItem
                                                icon={HardDrive}
                                                text={
                                                    plan.limits.storage === -1
                                                        ? t(
                                                              'subscription.features.unlimitedStorage',
                                                          )
                                                        : tParams('subscription.features.storage', {
                                                              count: plan.limits.storage,
                                                          })
                                                }
                                            />
                                            <LimitItem
                                                icon={Database}
                                                text={
                                                    plan.limits.records === -1
                                                        ? t(
                                                              'subscription.features.unlimitedRecords',
                                                          )
                                                        : tParams('subscription.features.records', {
                                                              count: formatNumber(
                                                                  plan.limits.records,
                                                              ),
                                                          })
                                                }
                                            />
                                            <div className="flex flex-col">
                                                <LimitItem
                                                    icon={PlusCircle}
                                                    text={
                                                        plan.limits.measuredPoints === -1
                                                            ? t(
                                                                  'subscription.features.unlimitedPoints',
                                                              )
                                                            : tParams(
                                                                  'subscription.features.measuredPoints',
                                                                  {
                                                                      count: plan.limits
                                                                          .measuredPoints,
                                                                  },
                                                              )
                                                    }
                                                />
                                                <li className="-mt-0.5 ml-[22px] flex flex-col text-[10px] text-text_secondary">
                                                    <span>
                                                        {tParams(
                                                            'subscription.features.extraMBPrice',
                                                            {
                                                                price: plan.limits
                                                                    .extraStoragePrice,
                                                            },
                                                        )}
                                                    </span>
                                                </li>
                                            </div>
                                            <LimitItem
                                                icon={FileText}
                                                text={
                                                    plan.limits.aiReports === -1
                                                        ? t(
                                                              'subscription.features.unlimitedAiAssistants',
                                                          )
                                                        : tParams(
                                                              'subscription.features.aiAssistants',
                                                              {
                                                                  count: plan.limits.aiReports,
                                                              },
                                                          )
                                                }
                                            />
                                            <LimitItem
                                                icon={Check}
                                                text={tParams('subscription.features.activation', {
                                                    price: formatCurrency(plan.limits.activation),
                                                })}
                                            />
                                        </ul>
                                    </div>

                                    <hr className="my-2 border-gray-100" />

                                    <ul className="mb-2 flex-1 space-y-0.5">
                                        {plan.features.map((featureKey) => (
                                            <li
                                                key={featureKey}
                                                className="flex items-start gap-1.5 text-xs leading-tight"
                                            >
                                                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#22C55E]" />
                                                <span className="text-text_secondary">
                                                    {t(`subscription.features.${featureKey}`)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={(e) => {
                                            if (isSelected) {
                                                e.stopPropagation();
                                                handlePurchase();
                                            } else {
                                                setSelectedPlanId(plan.id);
                                            }
                                        }}
                                        variant={isSelected ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            'mt-auto h-8 w-full text-xs font-semibold transition-all duration-300',
                                            isSelected
                                                ? 'border-transparent bg-main_color text-white shadow-md hover:bg-main_color/90'
                                                : 'border-gray-300 bg-transparent hover:border-main_color hover:text-main_color',
                                        )}
                                    >
                                        {isSelected ? (
                                            <span className="flex items-center gap-1.5">
                                                {t('subscription.actions.purchase')}
                                                <ArrowRight className="h-3 w-3" />
                                            </span>
                                        ) : (
                                            t('subscription.actions.select')
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
            <ContactOwnerDialog
                open={isContactDialogOpen}
                onOpenChange={setIsContactDialogOpen}
                planName={selectedPlanId}
            />
        </>
    );
}

function LimitItem({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <li className="flex items-center gap-2 text-xs font-medium">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{text}</span>
        </li>
    );
}
