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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { useLanguage } from '@/contexts/language-context';
import { Bug, Lightbulb, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { feedbackApi } from './api';
import { FeedbackToggleItem } from './feedback-toggle-item';
import { FeedbackImportance, FeedbackType } from './types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    module?: string;
}

const FEEDBACK_TYPES: {
    value: FeedbackType;
    icon: React.ElementType;
    labelKey: string;
    activeClass?: string;
}[] = [
    { value: 'idea', icon: Lightbulb, labelKey: 'feedback.types.idea' },
    {
        value: 'problem',
        icon: Bug,
        labelKey: 'feedback.types.problem',
        activeClass:
            'data-[state=on]:border-destructive data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive',
    },
    {
        value: 'feedback',
        icon: MessageSquare,
        labelKey: 'feedback.types.feedback',
        activeClass:
            'data-[state=on]:border-blue-500 data-[state=on]:bg-blue-500/10 data-[state=on]:text-blue-600',
    },
];

const IMPORTANCE_OPTIONS: { value: FeedbackImportance; labelKey: string }[] = [
    { value: 'low', labelKey: 'feedback.importance.low' },
    { value: 'medium', labelKey: 'feedback.importance.medium' },
    { value: 'high', labelKey: 'feedback.importance.high' },
];

export function FeedbackFormDialog({ isOpen, onClose, module }: Props) {
    const { t } = useLanguage();
    const [type, setType] = useState<FeedbackType | ''>('');
    const [comment, setComment] = useState('');
    const [importance, setImportance] = useState<FeedbackImportance | ''>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reset = () => {
        setType('');
        setComment('');
        setImportance('');
        setErrors({});
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const schema = z.object({
            type: z.string().min(1, t('feedback.errors.typeRequired')),
            comment: z.string().trim().min(1, t('feedback.errors.commentRequired')),
        });

        const result = schema.safeParse({ type, comment });

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
                type: type as FeedbackType,
                module,
                comment: comment.trim(),
                importance: importance || undefined,
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
                    <DialogTitle>{t('feedback.formTitle')}</DialogTitle>
                    <DialogDescription>{t('feedback.formSubtitle')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <ToggleGroup
                            type="single"
                            value={type}
                            onValueChange={(val) => {
                                if (val) {
                                    setType(val as FeedbackType);
                                    setErrors((prev) => ({ ...prev, type: '' }));
                                }
                            }}
                            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                        >
                            {FEEDBACK_TYPES.map(({ value, icon, labelKey, activeClass }) => (
                                <FeedbackToggleItem
                                    key={value}
                                    value={value}
                                    icon={icon}
                                    label={t(labelKey)}
                                    activeClass={activeClass}
                                />
                            ))}
                        </ToggleGroup>
                        {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="feedback-comment">{t('feedback.commentLabel')}</Label>
                        <Textarea
                            id="feedback-comment"
                            value={comment}
                            onChange={(e) => {
                                setComment(e.target.value);
                                if (e.target.value.trim())
                                    setErrors((prev) => ({ ...prev, comment: '' }));
                            }}
                            placeholder={t(
                                type === 'idea'
                                    ? 'feedback.commentPlaceholderIdea'
                                    : type === 'problem'
                                      ? 'feedback.commentPlaceholderProblem'
                                      : type === 'feedback'
                                        ? 'feedback.commentPlaceholderFeedback'
                                        : 'feedback.commentPlaceholder',
                            )}
                            className="min-h-[160px] resize-none"
                        />
                        {errors.comment && (
                            <p className="text-sm text-destructive">{errors.comment}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t('feedback.importanceLabel')}</Label>
                        <Select
                            value={importance}
                            onValueChange={(val) => setImportance(val as FeedbackImportance)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('feedback.importancePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {IMPORTANCE_OPTIONS.map(({ value, labelKey }) => (
                                    <SelectItem key={value} value={value}>
                                        {t(labelKey)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="main"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !type || !comment.trim()}
                        className="disabled:cursor-not-allowed"
                    >
                        {t('common.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
