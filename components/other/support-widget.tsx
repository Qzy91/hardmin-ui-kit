import { Button } from '@/components/ui/button';
import { SlidePanel } from '@/components/ui/slide-panel';
import { useLanguage } from '@/contexts/language-context';
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/utils';
import { LifeBuoy, Mail, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';

export function SupportWidget() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const phoneHref = CONTACT_PHONE ? CONTACT_PHONE.replace(/\s/g, '') : '';

    return (
        <>
            <div className="group fixed right-0 top-1/2 z-40 -translate-y-1/2 translate-x-1/4 transform transition-transform duration-300 hover:translate-x-0">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex flex-col-reverse items-center gap-3 rounded-l-lg bg-main_color px-3 py-6 text-black shadow-lg transition-all duration-300 hover:shadow-xl"
                    aria-label="Open support"
                >
                    <LifeBuoy className="h-5 w-5" />
                    <span
                        className="text-sm font-medium tracking-wider"
                        style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            transform: 'rotate(180deg)',
                        }}
                    >
                        {t('support.trigger_label')}
                    </span>
                </button>
            </div>

            <SlidePanel
                title={t('support.panel_title')}
                open={isOpen}
                onOpenChange={setIsOpen}
                width="md"
                showFooter={false}
                className="border border-bg_border_element bg-bg_primary"
            >
                <div className="rounded-xl border border-bg_border_element bg-bg_primary p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            disabled
                            className="h-12 flex-1 bg-main_color text-sm font-bold text-black shadow-sm hover:bg-main_color/90"
                            onClick={() => {}} // TODO: Implement chat
                        >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            {t('support.chat_button')}
                        </Button>
                        <div className="shrink-0 space-y-1 text-[13px] text-muted-foreground">
                            <a
                                href={`mailto:${CONTACT_EMAIL}`}
                                className="flex items-center gap-2 transition-colors hover:text-text_primary hover:underline"
                                title={t('support.send_email')}
                            >
                                <Mail className="h-3.5 w-3.5 text-main_color" />
                                <span>{CONTACT_EMAIL}</span>
                            </a>

                            <a
                                href={`tel:${phoneHref}`}
                                className="flex items-center gap-2 transition-colors hover:text-text_primary hover:underline"
                                title={t('support.call_us')}
                            >
                                <Phone className="h-3.5 w-3.5 text-main_color" />
                                <span>{CONTACT_PHONE}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </SlidePanel>
        </>
    );
}
