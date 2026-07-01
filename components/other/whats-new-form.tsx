import { CountryFlagSelect, CountryFlagSelectType } from '@/components/common/country-flag-select';
import { CreatableCombobox } from '@/components/common/creatable-combobox';
import { DatePicker } from '@/components/common/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { detectMediaType, WhatsNewItem, WhatsNewType } from '@/components/whats-new/api';
import { useLanguage } from '@/contexts/language-context';
import { cn, getCapitalizedDisplayName } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const LANGUAGE_FLAG_MAPPING: Record<string, string> = {
    en: 'US',
    cs: 'CZ',
    sk: 'SK',
    pl: 'PL',
    de: 'DE',
    hu: 'HU',
    es: 'ES',
    it: 'IT',
    ro: 'RO',
    bg: 'BG',
};

const ALL_AVAILABLE_LOCALES = Object.keys(LANGUAGE_FLAG_MAPPING);
const REQUIRED_LOCALES = ['cs', 'en'];

interface Props {
    initialData?: WhatsNewItem | null;
    onSave: (data: FormData) => Promise<void>;
    onCancel: () => void;
    versionOptions?: string[];
}

const createSchema = (t: (key: string) => string) => {
    return z.object({
        version: z.string().min(1, t('common.required')),
        type: z.nativeEnum(WhatsNewType),
        released_at: z.date({
            error: t('common.required'),
        }),
        translations: z.array(
            z.object({
                locale: z.string(),
                title: z.string().min(1, t('common.required')),
                description: z.string().nullable().optional(),
                details: z.array(
                    z.object({
                        text: z.string(),
                        image_path: z.string().nullable().optional(),
                        remove_image: z.boolean().optional(),
                    }),
                ),
            }),
        ),
    });
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

type DetailFilesByLocale = Record<string, Record<number, File | null>>;

export function WhatsNewForm({ initialData, onSave, onCancel, versionOptions = [] }: Props) {
    const { language: currentUiLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('cs');

    const form = useForm<FormValues>({
        resolver: zodResolver(createSchema(t)),
        mode: 'onChange',
        shouldFocusError: false,
        defaultValues: {
            version: initialData?.version || '',
            type: initialData?.type || WhatsNewType.NEW_FEATURE,
            released_at: initialData?.released_at ? parseISO(initialData.released_at) : new Date(),
            translations:
                initialData?.translations && initialData.translations.length > 0
                    ? initialData.translations.map((tr) => ({
                          locale: tr.locale,
                          title: tr.title || '',
                          description: tr.description || '',
                          details:
                              Array.isArray(tr.details) && tr.details.length > 0
                                  ? tr.details.map((d) => ({
                                        text: d.text ?? '',
                                        image_path: d.image_path ?? null,
                                        remove_image: false,
                                    }))
                                  : [{ text: '', image_path: null, remove_image: false }],
                      }))
                    : [
                          {
                              locale: 'cs',
                              title: '',
                              description: '',
                              details: [{ text: '', image_path: null, remove_image: false }],
                          },
                          {
                              locale: 'en',
                              title: '',
                              description: '',
                              details: [{ text: '', image_path: null, remove_image: false }],
                          },
                      ],
        },
    });

    const {
        control,
        handleSubmit,
        register,
        setValue,
        getValues,
        formState: { errors, isSubmitting },
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'translations',
        keyName: 'key',
    });

    const currentTranslations = useWatch({ control, name: 'translations' });

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [removeBanner, setRemoveBanner] = useState(false);
    const [bannerExistingUrl] = useState<string | null>(initialData?.banner_image_url ?? null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const bannerPreviewUrl = useMemo(() => {
        if (bannerFile) return URL.createObjectURL(bannerFile);
        if (removeBanner) return null;
        return bannerExistingUrl;
    }, [bannerFile, removeBanner, bannerExistingUrl]);

    const bannerMediaType = useMemo(() => {
        if (bannerFile) {
            return bannerFile.type.startsWith('video/') ? 'video' : 'image';
        }
        return detectMediaType(bannerPreviewUrl);
    }, [bannerFile, bannerPreviewUrl]);

    useEffect(() => {
        return () => {
            if (bannerFile) URL.revokeObjectURL(URL.createObjectURL(bannerFile));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [detailFiles, setDetailFiles] = useState<DetailFilesByLocale>({});

    const setDetailFile = (locale: string, index: number, file: File | null) => {
        setDetailFiles((prev) => {
            const next = { ...prev };
            const localeMap = { ...(next[locale] ?? {}) };
            if (file === null) {
                delete localeMap[index];
            } else {
                localeMap[index] = file;
            }
            next[locale] = localeMap;
            return next;
        });
    };

    const addLanguage = (locale: string) => {
        if (currentTranslations.some((tr) => tr.locale === locale)) return;
        append({
            locale,
            title: '',
            description: '',
            details: [{ text: '', image_path: null, remove_image: false }],
        });
        setActiveTab(locale);
    };

    const onSubmit = async (data: FormValues) => {
        const fd = new FormData();
        fd.append('version', data.version);
        fd.append('type', data.type);
        fd.append('released_at', format(data.released_at, 'yyyy-MM-dd'));
        fd.append('is_active', '1');

        if (bannerFile) {
            fd.append('banner_image', bannerFile);
        }
        if (removeBanner && !bannerFile) {
            fd.append('remove_banner_image', '1');
        }

        data.translations.forEach((tr, trIdx) => {
            fd.append(`translations[${trIdx}][locale]`, tr.locale);
            fd.append(`translations[${trIdx}][title]`, tr.title);
            fd.append(`translations[${trIdx}][description]`, tr.description ?? '');

            const filteredDetails = tr.details.filter(
                (d, idx) => d.text.trim() !== '' || d.image_path || detailFiles[tr.locale]?.[idx],
            );

            filteredDetails.forEach((detail, dIdx) => {
                const origIdx = tr.details.indexOf(detail);
                fd.append(`translations[${trIdx}][details][${dIdx}][text]`, detail.text);
                if (detail.image_path && !detail.remove_image) {
                    fd.append(
                        `translations[${trIdx}][details][${dIdx}][image_path]`,
                        detail.image_path,
                    );
                }
                if (detail.remove_image) {
                    fd.append(`translations[${trIdx}][details][${dIdx}][remove_image]`, '1');
                }

                const uploaded = detailFiles[tr.locale]?.[origIdx];
                if (uploaded instanceof File) {
                    fd.append(`detail_images[${tr.locale}][${dIdx}]`, uploaded);
                }
            });
        });

        await onSave(fd);
    };

    const remainingLocales = ALL_AVAILABLE_LOCALES.filter(
        (code) => !currentTranslations.some((tr) => tr.locale === code),
    );

    const ErrorMessage = ({ error }: { error?: string }) => {
        if (!error) return null;
        return <p className="mt-1 text-xs text-red-500">{error}</p>;
    };

    const tabsListRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        if (tabsListRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    };

    useEffect(() => {
        const ref = tabsListRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            checkScroll();

            const observer = new MutationObserver(checkScroll);
            observer.observe(ref, { childList: true, subtree: true });

            return () => {
                ref.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
                observer.disconnect();
            };
        }
    }, [fields.length]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsListRef.current) {
            const scrollAmount = 250;
            tabsListRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        const scrollToActiveTab = () => {
            const container = tabsListRef.current;
            if (!container) return;

            const activeTabEl = container.querySelector(`[data-state="active"]`) as HTMLElement;

            if (activeTabEl) {
                activeTabEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
            setTimeout(checkScroll, 300);
        };

        const timer = setTimeout(() => {
            scrollToActiveTab();
            checkScroll();
        }, 150);

        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setBannerFile(file);
            setRemoveBanner(false);
        }
    };

    const handleBannerClear = () => {
        setBannerFile(null);
        setRemoveBanner(!!bannerExistingUrl);
        if (bannerInputRef.current) {
            bannerInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0 space-y-6">
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
                <div className="min-w-0 space-y-2">
                    <Label htmlFor="version">{t('whats_new.form.version')}</Label>
                    <Controller
                        control={control}
                        name="version"
                        render={({ field }) => (
                            <CreatableCombobox
                                id="version"
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                options={versionOptions}
                                placeholder={t('whats_new.form.version_placeholder')}
                                searchPlaceholder={t('whats_new.form.version_search_placeholder')}
                                createLabel={(v) =>
                                    t('whats_new.form.version_create_label', { version: v })
                                }
                                error={!!errors.version}
                            />
                        )}
                    />
                    <ErrorMessage error={errors.version?.message} />
                </div>

                <div className="min-w-0 space-y-2">
                    <Label>{t('whats_new.form.change_type')}</Label>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={WhatsNewType.NEW_FEATURE}>
                                        {t('whats_new.types.NEW_FEATURE')}
                                    </SelectItem>
                                    <SelectItem value={WhatsNewType.IMPROVEMENT}>
                                        {t('whats_new.types.IMPROVEMENT')}
                                    </SelectItem>
                                    <SelectItem value={WhatsNewType.BUG_FIX}>
                                        {t('whats_new.types.BUG_FIX')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <ErrorMessage error={errors.type?.message} />
                </div>

                <div className="flex min-w-0 flex-col space-y-2 pt-1">
                    <Controller
                        control={control}
                        name="released_at"
                        render={({ field }) => (
                            <DatePicker
                                label={t('whats_new.form.release_date')}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <ErrorMessage error={errors.released_at?.message} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>{t('whats_new.form.banner_image')}</Label>
                <div className="flex flex-col gap-3">
                    {bannerPreviewUrl ? (
                        <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-xl border border-bg_border_element bg-bg_secondary sm:h-[260px]">
                            {bannerMediaType === 'video' ? (
                                <video
                                    src={bannerPreviewUrl}
                                    className="relative z-10 h-full w-auto max-w-full bg-black object-contain"
                                    controls
                                    playsInline
                                    preload="metadata"
                                />
                            ) : (
                                <>
                                    <img
                                        src={bannerPreviewUrl}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                                    />
                                    <img
                                        src={bannerPreviewUrl}
                                        alt="banner"
                                        className="relative z-10 h-full w-auto max-w-full object-contain"
                                    />
                                </>
                            )}
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('whats_new.form.remove_media')}
                                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-bg_primary/90 text-red-600 shadow hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                            onClick={handleBannerClear}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {t('whats_new.form.remove_media')}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="flex h-32 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-bg_border_element bg-bg_secondary/60 text-sm font-medium text-text_secondary transition-colors hover:border-main_color hover:bg-main_color/5 hover:text-main_color"
                        >
                            <ImagePlus className="h-5 w-5" />
                            {t('whats_new.form.upload_banner')}
                        </button>
                    )}
                    <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleBannerChange}
                    />
                    {bannerPreviewUrl && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="self-start"
                            onClick={() => bannerInputRef.current?.click()}
                        >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            {t('whats_new.form.replace_banner')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-bg_border_element bg-bg_primary shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bg_border_element bg-bg_secondary/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Label className="font-bold text-text_primary">
                            {t('whats_new.form.translations')}
                        </Label>
                        <span className="text-xs font-normal text-text_secondary">
                            {t('whats_new.form.translations_hint')}
                        </span>
                    </div>

                    <div className="w-full sm:w-[240px]">
                        <CountryFlagSelect
                            value=""
                            onValueChange={addLanguage}
                            options={remainingLocales}
                            placeholder={t('whats_new.form.add_language')}
                            type={CountryFlagSelectType.Language}
                            flagMapping={LANGUAGE_FLAG_MAPPING}
                            disabled={remainingLocales.length === 0}
                            className="h-9"
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
                    <div className="relative flex h-12 w-full min-w-0 max-w-full items-center border-b border-bg_border_element bg-bg_primary">
                        {showLeftArrow && (
                            <div className="absolute bottom-0 left-0 top-0 z-10 flex w-12 items-center justify-start bg-gradient-to-r from-bg_primary via-bg_primary/90 to-transparent">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 h-7 w-7 shrink-0 rounded-full border border-bg_border_element bg-bg_primary shadow-sm hover:bg-bg_secondary"
                                    onClick={() => scrollTabs('left')}
                                >
                                    <ChevronLeft className="h-4 w-4 text-text_secondary" />
                                </Button>
                            </div>
                        )}

                        <TabsList
                            ref={tabsListRef}
                            className="p-0[-ms-overflow-style:none] flex h-full w-full min-w-0 flex-1 items-center justify-start overflow-x-auto overflow-y-hidden scroll-smooth rounded-none border-none bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {fields.map((field, index) => {
                                const isRequired = REQUIRED_LOCALES.includes(field.locale);
                                const hasError = !!errors.translations?.[index]?.title;

                                return (
                                    <TabsTrigger
                                        key={field.key}
                                        value={field.locale}
                                        className={cn(
                                            'relative flex h-full shrink-0 items-center gap-2 whitespace-nowrap rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-main_color data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                                            hasError && 'text-red-500',
                                        )}
                                    >
                                        <ReactCountryFlag
                                            countryCode={LANGUAGE_FLAG_MAPPING[field.locale]}
                                            svg
                                            style={{ width: '1.2em', height: '1.2em' }}
                                        />
                                        <span className="text-sm font-medium">
                                            {getCapitalizedDisplayName(
                                                field.locale,
                                                CountryFlagSelectType.Language,
                                                currentUiLanguage,
                                            )}
                                            {isRequired && (
                                                <span
                                                    className={cn(
                                                        'ml-1',
                                                        hasError
                                                            ? 'text-red-500'
                                                            : 'text-text_secondary/70',
                                                    )}
                                                >
                                                    *
                                                </span>
                                            )}
                                        </span>
                                        {!isRequired && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    remove(index);
                                                    if (activeTab === field.locale)
                                                        setActiveTab('cs');
                                                }}
                                                className="ml-1 text-text_secondary/70 hover:text-red-500"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {showRightArrow && (
                            <div className="absolute bottom-0 right-0 top-0 z-10 flex w-12 items-center justify-end bg-gradient-to-l from-bg_primary via-bg_primary/90 to-transparent">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mr-1 h-7 w-7 shrink-0 rounded-full border border-bg_border_element bg-bg_primary shadow-sm hover:bg-bg_secondary"
                                    onClick={() => scrollTabs('right')}
                                >
                                    <ChevronRight className="h-4 w-4 text-text_secondary" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {fields.map((field, index) => (
                        <TabsContent
                            key={field.key}
                            value={field.locale}
                            className="mt-0 min-w-0 p-6"
                        >
                            <TranslationFields
                                index={index}
                                locale={field.locale}
                                control={control}
                                register={register}
                                errors={errors}
                                getValues={getValues}
                                setValue={setValue}
                                t={t}
                                detailFiles={detailFiles[field.locale] ?? {}}
                                setDetailFile={(idx, file) =>
                                    setDetailFile(field.locale, idx, file)
                                }
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    {t('whats_new.form.cancel')}
                </Button>
                <Button
                    type="submit"
                    variant="main"
                    className="min-w-[120px]"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? t('whats_new.form.saving')
                        : initialData
                          ? t('whats_new.form.save_changes')
                          : t('whats_new.form.create')}
                </Button>
            </div>
        </form>
    );
}

interface TranslationFieldsProps {
    index: number;
    locale: string;
    control: any;
    register: any;
    errors: any;
    getValues: any;
    setValue: any;
    t: (key: string) => string;
    detailFiles: Record<number, File | null>;
    setDetailFile: (index: number, file: File | null) => void;
}

function TranslationFields({
    index,
    locale,
    control,
    register,
    errors,
    getValues,
    setValue,
    t,
    detailFiles,
    setDetailFile,
}: TranslationFieldsProps) {
    const details = useWatch({
        control,
        name: `translations.${index}.details`,
    });

    const handleAddDetail = () => {
        const current = getValues(`translations.${index}.details`) ?? [];
        setValue(`translations.${index}.details`, [
            ...current,
            { text: '', image_path: null, remove_image: false },
        ]);
    };

    const handleRemoveDetail = (detailIndex: number) => {
        const current = getValues(`translations.${index}.details`) ?? [];
        setValue(
            `translations.${index}.details`,
            current.filter((_: unknown, i: number) => i !== detailIndex),
        );
        setDetailFile(detailIndex, null);
    };

    const hasTitleError = !!errors.translations?.[index]?.title;

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label className="text-text_secondary">
                    {t('whats_new.form.title_label')}{' '}
                    <span
                        className={cn(
                            'ml-0.5',
                            hasTitleError ? 'text-red-500' : 'text-text_primary',
                        )}
                    >
                        *
                    </span>
                </Label>
                <Input
                    {...register(`translations.${index}.title`)}
                    placeholder={t('whats_new.form.title_placeholder')}
                    className={hasTitleError ? 'border-red-500' : ''}
                />
                {hasTitleError && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.translations[index].title.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-text_secondary">
                    {t('whats_new.form.description_label')}
                </Label>
                <Textarea
                    {...register(`translations.${index}.description`)}
                    placeholder={t('whats_new.form.description_placeholder')}
                    rows={2}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center justify-between text-text_secondary">
                        {t('whats_new.form.details_label')}
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleAddDetail}
                    >
                        <Plus className="mr-1 h-3 w-3" /> {t('whats_new.form.add_detail')}
                    </Button>
                </div>

                {(details ?? []).map((detail: any, dIdx: number) => (
                    <DetailRow
                        key={dIdx}
                        index={index}
                        detailIndex={dIdx}
                        register={register}
                        setValue={setValue}
                        currentImagePath={detail?.image_path ?? null}
                        currentRemoveFlag={!!detail?.remove_image}
                        uploadedFile={detailFiles[dIdx] ?? null}
                        onUpload={(file) => setDetailFile(dIdx, file)}
                        onRemove={() => handleRemoveDetail(dIdx)}
                        t={t}
                        locale={locale}
                    />
                ))}

                {(details?.length ?? 0) === 0 && (
                    <p className="text-sm italic text-text_secondary/70">
                        {t('whats_new.form.no_details')}
                    </p>
                )}
            </div>
        </div>
    );
}

interface DetailRowProps {
    index: number;
    detailIndex: number;
    register: any;
    setValue: any;
    currentImagePath: string | null;
    currentRemoveFlag: boolean;
    uploadedFile: File | null;
    onUpload: (file: File | null) => void;
    onRemove: () => void;
    t: (key: string) => string;
    locale: string;
}

function DetailRow({
    index,
    detailIndex,
    register,
    setValue,
    currentImagePath,
    currentRemoveFlag,
    uploadedFile,
    onUpload,
    onRemove,
    t,
    locale,
}: DetailRowProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const previewUrl = useMemo(() => {
        if (uploadedFile) return URL.createObjectURL(uploadedFile);
        if (currentRemoveFlag) return null;
        if (currentImagePath) return `/whats-new/images/${currentImagePath}`;
        return null;
    }, [uploadedFile, currentRemoveFlag, currentImagePath]);

    const previewMediaType = useMemo(() => {
        if (uploadedFile) {
            return uploadedFile.type.startsWith('video/') ? 'video' : 'image';
        }
        return detectMediaType(previewUrl);
    }, [uploadedFile, previewUrl]);

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            onUpload(file);
            setValue(`translations.${index}.details.${detailIndex}.remove_image`, false);
        }
    };

    const handleClearImage = () => {
        onUpload(null);
        if (inputRef.current) inputRef.current.value = '';
        if (currentImagePath) {
            setValue(`translations.${index}.details.${detailIndex}.remove_image`, true);
        }
    };

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-bg_border_element bg-bg_primary p-3">
            <div className="flex gap-2">
                <Input
                    {...register(`translations.${index}.details.${detailIndex}.text`)}
                    placeholder={t('whats_new.form.detail_placeholder')}
                />
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => inputRef.current?.click()}
                                className="flex-shrink-0 hover:bg-main_color/10 hover:text-main_color"
                                aria-label={t('whats_new.form.attach_image')}
                            >
                                <ImagePlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('whats_new.form.attach_image')}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                onClick={onRemove}
                                aria-label={t('whats_new.form.remove_detail')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('whats_new.form.remove_detail')}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFile}
                    data-locale={locale}
                />
            </div>
            {previewUrl && (
                <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-md border border-bg_border_element bg-bg_secondary sm:h-[240px]">
                    {previewMediaType === 'video' ? (
                        <video
                            src={previewUrl}
                            className="relative z-10 h-full w-auto max-w-full bg-black object-contain"
                            controls
                            playsInline
                            preload="metadata"
                        />
                    ) : (
                        <>
                            <img
                                src={previewUrl}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                            />
                            <img
                                src={previewUrl}
                                alt=""
                                className="relative z-10 h-full w-auto max-w-full object-contain"
                            />
                        </>
                    )}
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearImage}
                                    aria-label={t('whats_new.form.remove_media')}
                                    className="absolute right-1.5 top-1.5 h-7 w-7 rounded-full bg-bg_primary/90 text-red-600 shadow hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('whats_new.form.remove_media')}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
}
