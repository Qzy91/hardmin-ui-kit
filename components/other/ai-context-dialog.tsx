import { VisionIntelligenceLogo } from '@/components/common/vision-intelligence-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronsDown, Copy, Plus, Sparkles, Trash2 } from 'lucide-react';
import { type HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    type FieldConfig,
    AI_CONTEXT_FIELD_CONFIGS,
    AI_CONTEXT_SECTIONS,
    OBJECT_TYPE_SUGGESTIONS,
} from './ai-context-fields';
import type { AiContextNode } from './types';

function SectionHeader({
    title,
    isOpen,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    title: string;
    isOpen: boolean;
}) {
    return (
        <CardHeader
            role="button"
            tabIndex={0}
            {...props}
            className={cn(
                'cursor-pointer select-none bg-slate-100 px-6 py-4 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
                isOpen ? 'rounded-t-lg' : 'rounded-lg',
                props.className,
            )}
        >
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180',
                    )}
                />
            </div>
        </CardHeader>
    );
}

type TranslateFunc = (
    key: string,
    fallbackOrParams?: string | Record<string, string | number>,
    params?: Record<string, string | number>,
) => string;

interface AiContextDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mediaType: string;
    initialData: Record<string, any>;
    onSave: (data: Record<string, any>) => void | Promise<void>;
    nodeName: string;
    allNodes?: AiContextNode[];
    currentNodeId?: string | number;
    t: TranslateFunc;
}

export const AiContextDialog = ({
    open,
    onOpenChange,
    mediaType,
    initialData,
    onSave,
    nodeName,
    allNodes,
    currentNodeId,
    t,
}: AiContextDialogProps) => {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const fields = AI_CONTEXT_FIELD_CONFIGS[mediaType] || [];
        const defaults: Record<string, any> = {};
        for (const f of fields) {
            if (f.defaultValue !== undefined && !(f.key in initialData)) {
                defaults[f.key] = Array.isArray(f.defaultValue)
                    ? [...f.defaultValue]
                    : f.defaultValue;
            }
        }
        return { ...defaults, ...initialData };
    });
    const [copyPopoverOpen, setCopyPopoverOpen] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(AI_CONTEXT_SECTIONS.map((s) => [s.id, true])),
    );
    const scrollRef = useRef<HTMLDivElement>(null);

    const toggleSection = useCallback((sectionId: string) => {
        setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
    }, []);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 20);
    }, []);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(checkScroll, 100);
        return () => clearTimeout(timer);
    }, [open, checkScroll]);

    const fields = AI_CONTEXT_FIELD_CONFIGS[mediaType] || [];

    // Nody s vyplněným aiContext (pro "kopírovat z")
    const nodesWithContext = useMemo(
        () =>
            (allNodes ?? []).filter(
                (n) =>
                    n.id !== currentNodeId &&
                    n.data?.aiContext &&
                    Object.keys(n.data.aiContext).length > 0,
            ),
        [allNodes, currentNodeId],
    );

    const setValue = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const isVisible = (field: FieldConfig): boolean => {
        if (!field.showIf) return true;
        return formData[field.showIf.field] === field.showIf.value;
    };

    const handleSave = async () => {
        // Odstranit prázdné hodnoty
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(formData)) {
            if (v === undefined || v === null || v === '' || v === false) continue;
            if (Array.isArray(v) && v.length === 0) continue;
            if (typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => !x))
                continue;
            cleaned[k] = v;
        }
        setIsSaving(true);
        try {
            await onSave(cleaned);
            onOpenChange(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyFrom = (nodeId: string | number) => {
        const node = allNodes?.find((n) => n.id === nodeId);
        if (node?.data?.aiContext) {
            setFormData({ ...node.data.aiContext });
        }
        setCopyPopoverOpen(false);
    };

    // ── Field renderers ──────────────────────────────────────────
    const renderField = (field: FieldConfig) => {
        if (!isVisible(field)) return null;

        const value = formData[field.key];

        switch (field.type) {
            case 'typeahead':
                return (
                    <TypeaheadField
                        field={field}
                        value={value}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'radio':
                return (
                    <RadioField
                        field={field}
                        value={value}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'checkbox-group':
                return (
                    <CheckboxGroupField
                        field={field}
                        value={value || []}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'number':
                return (
                    <NumberField
                        field={field}
                        value={value}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'time-range':
                return (
                    <TimeRangeField
                        field={field}
                        value={value || {}}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'textarea':
                return (
                    <TextareaField
                        field={field}
                        value={value || ''}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'toggle':
                return (
                    <ToggleField
                        field={field}
                        value={!!value}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'select':
                return (
                    <SelectField
                        field={field}
                        value={value}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            case 'dynamic-list':
                return (
                    <DynamicListField
                        field={field}
                        value={value || []}
                        onChange={(v) => setValue(field.key, v)}
                        t={t}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-3xl"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    gap: 0,
                    maxHeight: '85vh',
                    overflow: 'hidden',
                }}
            >
                <DialogHeader className="flex-shrink-0 px-6 pb-3 pt-6">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        {t('ems_calculator.ai_context.dialog.title', { name: nodeName || '—' })}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {t('ems_calculator.ai_context.dialog.intro_line1')}
                    </DialogDescription>
                </DialogHeader>

                {/* Intro banner */}
                <div className="mx-6 mb-2 flex flex-shrink-0 items-start gap-3 rounded-lg border border-purple-200 bg-purple-50/50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/30">
                    <div className="flex-1 text-sm text-muted-foreground">
                        <p>{t('ems_calculator.ai_context.dialog.intro_line1')}</p>
                        <p className="mt-0.5">
                            {t('ems_calculator.ai_context.dialog.intro_line2')}
                        </p>
                    </div>
                    <VisionIntelligenceLogo className="h-10 flex-shrink-0" />
                </div>

                {/* Kopírovat z jiného bodu */}
                {nodesWithContext.length > 0 && (
                    <div className="px-6 pb-2">
                        <Popover open={copyPopoverOpen} onOpenChange={setCopyPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-[hsl(var(--main-color))] text-xs text-black hover:bg-[hsl(var(--text-dark-main-color))]"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    {t('ems_calculator.ai_context.dialog.copy_from')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t(
                                            'ems_calculator.ai_context.dialog.copy_from_search',
                                        )}
                                        className="h-8 text-sm"
                                    />
                                    <CommandList onWheel={(e) => e.stopPropagation()}>
                                        <CommandEmpty>
                                            {t('ems_calculator.ai_context.dialog.copy_from_empty')}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {nodesWithContext.map((node) => (
                                                <CommandItem
                                                    key={node.id}
                                                    onSelect={() => handleCopyFrom(node.id)}
                                                >
                                                    {node.text ||
                                                        t(
                                                            'ems_calculator.measurement_tree.no_name',
                                                        )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {/* Scrollovatelný obsah */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex-1 space-y-4 overflow-y-auto px-6 pb-4"
                    style={{ minHeight: 0 }}
                >
                    {AI_CONTEXT_SECTIONS.map((section) => {
                        const sectionFields = fields.filter((f) => f.section === section.id);
                        if (sectionFields.length === 0) return null;

                        return (
                            <Collapsible
                                key={section.id}
                                open={openSections[section.id]}
                                onOpenChange={() => toggleSection(section.id)}
                            >
                                <Card>
                                    <CollapsibleTrigger asChild>
                                        <SectionHeader
                                            title={t(section.labelKey)}
                                            isOpen={openSections[section.id]}
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {sectionFields.map((field) => {
                                                    const fullWidth =
                                                        field.type === 'textarea' ||
                                                        field.type === 'dynamic-list' ||
                                                        field.type === 'checkbox-group';
                                                    return (
                                                        <div
                                                            key={field.key}
                                                            className={
                                                                fullWidth ? 'md:col-span-2' : ''
                                                            }
                                                        >
                                                            {renderField(field)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        );
                    })}
                    {canScrollDown && (
                        <div
                            className="pointer-events-none sticky bottom-0 -mb-4 flex justify-center pb-2 pt-8"
                            style={{
                                background:
                                    'linear-gradient(transparent, hsl(var(--background)) 70%)',
                            }}
                        >
                            <button
                                className="pointer-events-auto animate-bounce text-muted-foreground transition-colors hover:text-foreground"
                                onClick={() =>
                                    scrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })
                                }
                            >
                                <ChevronsDown className="h-6 w-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer - outside scroll area */}
                <div className="flex flex-shrink-0 justify-end gap-2 border-t px-6 py-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        {t('ems_calculator.ai_context.dialog.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[hsl(var(--main-color))] text-white hover:bg-[hsl(var(--main-color-secondary))]"
                    >
                        {t('ems_calculator.ai_context.dialog.save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ── Field components ─────────────────────────────────────────────────────

interface FieldProps<T = any> {
    field: FieldConfig;
    value: T;
    onChange: (value: T) => void;
    t: TranslateFunc;
}

const TypeaheadField = ({ field, value, onChange, t }: FieldProps<string>) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-8 w-full justify-start text-sm font-normal"
                    >
                        {value ? t(`ems_calculator.ai_context.object_types.${value}`, value) : '—'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder={t(
                                'ems_calculator.ai_context.dialog.typeahead_placeholder',
                            )}
                            className="h-8 text-sm"
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList onWheel={(e) => e.stopPropagation()}>
                            <CommandEmpty className="px-2 py-2">
                                <CommandItem
                                    className="cursor-pointer justify-start gap-1.5"
                                    value={search}
                                    onSelect={() => {
                                        onChange(search.trim());
                                        setSearch('');
                                        setOpen(false);
                                    }}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    {t('ems_calculator.ai_context.dialog.use_custom_value', {
                                        value: search.trim(),
                                    })}
                                </CommandItem>
                            </CommandEmpty>
                            <CommandGroup
                                heading={t('ems_calculator.ai_context.dialog.suggestions')}
                            >
                                {OBJECT_TYPE_SUGGESTIONS.map((opt) => (
                                    <CommandItem
                                        key={opt}
                                        value={t(`ems_calculator.ai_context.object_types.${opt}`)}
                                        onSelect={() => {
                                            onChange(opt);
                                            setSearch('');
                                            setOpen(false);
                                        }}
                                    >
                                        {t(`ems_calculator.ai_context.object_types.${opt}`)}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

const RadioField = ({ field, value, onChange, t }: FieldProps<string>) => {
    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <div className="flex flex-wrap gap-1">
                {field.options?.map((opt) => (
                    <Button
                        key={opt.value}
                        type="button"
                        variant={value === opt.value ? 'default' : 'outline'}
                        size="sm"
                        className={`h-7 text-xs ${value === opt.value ? 'bg-[hsl(var(--main-color))] text-white hover:bg-[hsl(var(--main-color-secondary))]' : ''}`}
                        onClick={() => onChange(value === opt.value ? '' : opt.value)}
                    >
                        {t(opt.labelKey)}
                    </Button>
                ))}
            </div>
        </div>
    );
};

const CheckboxGroupField = ({ field, value, onChange, t }: FieldProps<string[]>) => {
    const toggle = (val: string) => {
        onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
    };

    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <div className="flex flex-wrap gap-2">
                {field.options?.map((opt) => (
                    <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-1.5 text-sm"
                    >
                        <Checkbox
                            checked={value.includes(opt.value)}
                            onCheckedChange={() => toggle(opt.value)}
                        />
                        {t(opt.labelKey)}
                    </label>
                ))}
            </div>
        </div>
    );
};

const NumberField = ({ field, value, onChange, t }: FieldProps<number | string>) => {
    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <div className="flex items-center gap-1.5">
                <Input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    min={field.min}
                    max={field.max}
                    className="h-8 text-sm"
                />
                {field.unit && (
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {field.unit}
                    </span>
                )}
            </div>
        </div>
    );
};

const TimeRangeField = ({
    field,
    value,
    onChange,
    t,
}: FieldProps<{ from?: string; to?: string }>) => {
    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    type="time"
                    value={value?.from || ''}
                    onChange={(e) => onChange({ ...value, from: e.target.value })}
                    className="h-8 w-28 text-sm"
                />
                <span className="text-xs text-muted-foreground">–</span>
                <Input
                    type="time"
                    value={value?.to || ''}
                    onChange={(e) => onChange({ ...value, to: e.target.value })}
                    className="h-8 w-28 text-sm"
                />
            </div>
        </div>
    );
};

const TextareaField = ({ field, value, onChange, t }: FieldProps<string>) => {
    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[60px] text-sm"
                rows={2}
            />
        </div>
    );
};

const ToggleField = ({ field, value, onChange, t }: FieldProps<boolean>) => {
    return (
        <div className="flex items-center justify-between gap-2 py-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <Switch checked={value} onCheckedChange={onChange} />
        </div>
    );
};

const SelectField = ({ field, value, onChange, t }: FieldProps<string>) => {
    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <Select value={value || ''} onValueChange={onChange}>
                <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

const DynamicListField = ({ field, value, onChange, t }: FieldProps<Record<string, any>[]>) => {
    const stableKeys = useRef<string[]>([]);

    while (stableKeys.current.length < value.length) {
        stableKeys.current.push(crypto.randomUUID());
    }

    const addItem = () => {
        const empty: Record<string, any> = {};
        field.dynamicListFields?.forEach((df) => {
            empty[df.key] = '';
        });
        onChange([...value, empty]);
    };

    const removeItem = (index: number) => {
        stableKeys.current.splice(index, 1);
        onChange(value.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, key: string, val: any) => {
        const updated = value.map((item, i) => (i === index ? { ...item, [key]: val } : item));
        onChange(updated);
    };

    return (
        <div className="space-y-1">
            <Label className="text-sm">
                {t(field.labelKey)}
                {field.required && ' *'}
            </Label>
            <div className="space-y-1.5">
                {value.map((item, index) => (
                    <div key={stableKeys.current[index]} className="flex items-center gap-1.5">
                        {field.dynamicListFields?.map((df) => (
                            <div key={df.key} className="flex flex-1 items-center gap-1">
                                <Input
                                    type={df.type === 'number' ? 'number' : 'text'}
                                    value={item[df.key] ?? ''}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            df.key,
                                            df.type === 'number' && e.target.value !== ''
                                                ? Number(e.target.value)
                                                : e.target.value,
                                        )
                                    }
                                    placeholder={t(df.labelKey)}
                                    className="h-7 text-xs"
                                />
                                {df.unit && (
                                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {df.unit}
                                    </span>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0 text-destructive hover:text-destructive"
                            onClick={() => removeItem(index)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={addItem}
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t('ems_calculator.ai_context.dialog.add_item')}
                </Button>
            </div>
        </div>
    );
};

export default AiContextDialog;
