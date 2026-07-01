import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { useLanguage } from '@/contexts/language-context';
import { CircleMinus, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { feedbackApi } from './api';
import { FeedbackToggleItem } from './feedback-toggle-item';
import { FeedbackRating } from './types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    module?: string;
}

const RATING_OPTIONS: {
    value: FeedbackRating;
    icon: React.ElementType;
    labelKey: string;
    activeClass: string;
}[] = [
    {
        value: 'useful',
        icon: ThumbsUp,
        labelKey: 'feedback.rating.useful',
        activeClass:
            'data-[state=on]:border-green-500 data-[state=on]:bg-green-500/10 data-[state=on]:text-green-600',
    },
    {
        value: 'neutral',
        icon: CircleMinus,
        labelKey: 'feedback.rating.neutral',
        activeClass:
            'data-[state=on]:border-muted-foreground data-[state=on]:bg-muted data-[state=on]:text-muted-foreground',
    },
    {
        value: 'needs_improvement',
        icon: ThumbsDown,
        labelKey: 'feedback.rating.needsImprovement',
        activeClass:
            'data-[state=on]:border-destructive data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive',
    },
];

export function RatingDialog({ isOpen, onClose, module }: Props) {
    const { t } = useLanguage();
    const [rating, setRating] = useState<FeedbackRating | ''>('');
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (!isOpen || !module) return;

        const controller = new AbortController();
        setIsFetching(true);
        feedbackApi
            .getUserRating(module, controller.signal)
            .then((existing) => {
                if (existing) {
                    setRating(existing.rating);
                    setComment(existing.comment ?? '');
                }
            })
            .catch((err) => {
                if (err?.code !== 'ERR_CANCELED') {
                    toast.error(t('common.error'));
                }
            })
            .finally(() => setIsFetching(false));

        return () => controller.abort();
    }, [isOpen, module]);

    const reset = () => {
        setRating('');
        setComment('');
        setErrors({});
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const schema = z.object({
            rating: z.string().min(1, t('feedback.errors.ratingRequired')),
        });

        const result = schema.safeParse({ rating });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            await feedbackApi.store({
                type: 'rating',
                module,
                rating: rating as FeedbackRating,
                comment: comment.trim() || undefined,
            });
            toast.success(t('feedback.submitted'));
            handleClose();
        } catch {
            toast.error(t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="gap-4 sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle>{t('feedback.ratingTitle')}</DialogTitle>
                    <DialogDescription>{t('feedback.ratingSubtitle')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <ToggleGroup
                            type="single"
                            value={rating}
                            onValueChange={(val) => {
                                if (val) {
                                    setRating(val as FeedbackRating);
                                    setErrors((prev) => ({ ...prev, rating: '' }));
                                }
                            }}
                            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                            disabled={isFetching}
                        >
                            {RATING_OPTIONS.map(({ value, icon, labelKey, activeClass }) => (
                                <FeedbackToggleItem
                                    key={value}
                                    value={value}
                                    icon={icon}
                                    label={t(labelKey)}
                                    activeClass={activeClass}
                                />
                            ))}
                        </ToggleGroup>
                        {errors.rating && (
                            <p className="text-sm text-destructive">{errors.rating}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="rating-comment">{t('feedback.ratingComment')}</Label>
                        <Textarea
                            id="rating-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('feedback.ratingCommentPlaceholder')}
                            className="min-h-[140px] resize-none"
                            disabled={isFetching}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="main"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isFetching || !rating}
                        className="disabled:cursor-not-allowed"
                    >
                        {t('common.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
