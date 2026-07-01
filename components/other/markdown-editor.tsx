import '@mdxeditor/editor/style.css';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { normalizeMarkdownImages } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { MARKDOWN_CONTENT_CLASS_NAME } from '@/sections/service-module/device-inventory/components/markdown-content-styles';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
    BoldItalicUnderlineToggles,
    convertSelectionToNode$,
    currentBlockType$,
    headingsPlugin,
    imagePlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import { $createParagraphNode } from 'lexical';
import { ImagePlus, Link2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const BLOCK_TYPE_OPTIONS = ['paragraph', 'quote', 'h2', 'h3'] as const;

interface ToolbarProps {
    editorRef: React.RefObject<MDXEditorMethods | null>;
}

const CustomBlockTypeSelect: React.FC<ToolbarProps> = ({ editorRef }) => {
    const currentBlockType = useCellValue(currentBlockType$);
    const convertSelectionToNode = usePublisher(convertSelectionToNode$);

    const labels: Record<(typeof BLOCK_TYPE_OPTIONS)[number], string> = {
        paragraph: 'Odstavec',
        quote: 'Citát',
        h2: 'Nadpis 2',
        h3: 'Nadpis 3',
    };

    const applyBlockType = (blockType: string) => {
        editorRef.current?.focus(undefined, { defaultSelection: 'rootEnd' });

        requestAnimationFrame(() => {
            switch (blockType) {
                case 'quote':
                    convertSelectionToNode(() => $createQuoteNode());
                    break;
                case 'paragraph':
                    convertSelectionToNode(() => $createParagraphNode());
                    break;
                case 'h2':
                case 'h3':
                    convertSelectionToNode(() => $createHeadingNode(blockType));
                    break;
                default:
                    break;
            }
        });
    };

    return (
        <Select value={currentBlockType || 'paragraph'} onValueChange={applyBlockType}>
            <SelectTrigger
                className="h-8 w-[140px] border-bg_border_element bg-bg_primary text-sm text-text_primary shadow-sm focus:ring-0"
                onMouseDown={(event) => event.preventDefault()}
            >
                <SelectValue placeholder="Odstavec" />
            </SelectTrigger>
            <SelectContent className="z-[120]">
                {BLOCK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                        {labels[option]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

const parseMarkdownLink = (value: string): { text: string; url: string } | null => {
    const trimmedValue = value.trim();
    const match = trimmedValue.match(/^\[([^\]]+)\]\((\S+?)(?:\s+"[^"]*")?\)$/);
    if (!match) {
        return null;
    }
    return { text: match[1], url: match[2] };
};

const CustomLinkDialogButton: React.FC<ToolbarProps> = ({ editorRef }) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');

    const handleOpen = () => {
        const selectedMarkdown = editorRef.current?.getSelectionMarkdown() || '';
        const parsedLink = parseMarkdownLink(selectedMarkdown);

        setText(parsedLink?.text ?? selectedMarkdown);
        setUrl(parsedLink?.url ?? '');
        setOpen(true);
    };

    const handleSubmit = () => {
        editorRef.current?.focus();

        requestAnimationFrame(() => {
            const normalizedUrl = url.trim();
            const normalizedText = (
                text ||
                editorRef.current?.getSelectionMarkdown() ||
                normalizedUrl
            ).trim();

            editorRef.current?.insertMarkdown(
                `[${normalizedText || normalizedUrl}](${normalizedUrl})`,
            );
            setOpen(false);
        });
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text_primary hover:bg-bg_secondary hover:text-text_primary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleOpen}
            >
                <Link2 className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="z-[120] max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('common.link') ?? 'Odkaz'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="md-link-text">Text odkazu</Label>
                            <Input
                                id="md-link-text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Klikni sem"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="md-link-url">URL</Label>
                            <Input
                                id="md-link-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            Zrušit
                        </Button>
                        <Button
                            variant="main"
                            type="button"
                            onClick={handleSubmit}
                            disabled={!url.trim()}
                        >
                            Vložit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

interface ImageToolbarProps extends ToolbarProps {
    onImageUpload?: (file: File, alt?: string) => Promise<string>;
}

const CustomImageDialogButton: React.FC<ImageToolbarProps> = ({ editorRef, onImageUpload }) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [alt, setAlt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const resetState = () => {
        setAlt('');
        setImageUrl('');
        setSelectedFile(null);
        setIsUploading(false);
    };

    const handleOpen = () => {
        resetState();
        setOpen(true);
    };

    const handleSubmit = async () => {
        const normalizedAlt = alt.trim();
        const normalizedUrl = imageUrl.trim();

        if (!selectedFile && !normalizedUrl) {
            return;
        }

        setIsUploading(true);

        try {
            const resolvedUrl =
                selectedFile && onImageUpload
                    ? await onImageUpload(selectedFile, normalizedAlt)
                    : normalizedUrl;

            editorRef.current?.focus();
            requestAnimationFrame(() => {
                editorRef.current?.insertMarkdown(`![${normalizedAlt || 'Image'}](${resolvedUrl})`);
                setOpen(false);
                resetState();
            });
        } catch (error) {
            console.error(error);
            toast.error(t('common.image_dialog.upload_failed') ?? 'Nepodařilo se nahrát obrázek.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text_primary hover:bg-bg_secondary hover:text-text_primary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleOpen}
            >
                <ImagePlus className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="z-[120] max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {t('common.image_dialog.title') ?? 'Vložit obrázek'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {onImageUpload && (
                            <div className="space-y-2">
                                <Label htmlFor="md-image-file">
                                    {t('common.image_dialog.upload_file_label') ?? 'Nahrát soubor'}
                                </Label>
                                <input
                                    id="md-image-file"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    className="hidden"
                                    onChange={(event) =>
                                        setSelectedFile(event.target.files?.[0] ?? null)
                                    }
                                />
                                <div className="flex min-w-0 items-center gap-3">
                                    <Label
                                        htmlFor="md-image-file"
                                        className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-md border border-bg_border_element bg-bg_primary px-3 text-sm font-medium text-text_primary shadow-sm hover:bg-bg_secondary"
                                    >
                                        {t('common.image_dialog.upload_file_label') ??
                                            'Nahrát soubor'}
                                    </Label>
                                    <span className="min-w-0 flex-1 break-all text-sm leading-5 text-text_secondary">
                                        {selectedFile?.name ||
                                            (t('common.image_dialog.no_file_chosen') ??
                                                'Nebyl vybrán žádný soubor')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="md-image-url">
                                {onImageUpload
                                    ? (t('common.image_dialog.or_url_label') ?? 'Nebo URL obrázku')
                                    : (t('common.image_dialog.url_label') ?? 'URL obrázku')}
                            </Label>
                            <Input
                                id="md-image-url"
                                value={imageUrl}
                                onChange={(event) => setImageUrl(event.target.value)}
                                placeholder={
                                    t('common.image_dialog.url_placeholder') ??
                                    'https://example.com/image.jpg'
                                }
                                disabled={!!selectedFile}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="md-image-alt">
                                {t('common.image_dialog.alt_label') ?? 'Alt text'}
                            </Label>
                            <Input
                                id="md-image-alt"
                                value={alt}
                                onChange={(event) => setAlt(event.target.value)}
                                placeholder={
                                    t('common.image_dialog.alt_placeholder') ?? 'Popis obrázku'
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            {t('common.image_dialog.cancel') ?? 'Zrušit'}
                        </Button>
                        <Button
                            variant="main"
                            type="button"
                            onClick={() => void handleSubmit()}
                            disabled={isUploading || (!selectedFile && !imageUrl.trim())}
                        >
                            {isUploading
                                ? (t('common.image_dialog.uploading') ?? 'Nahrávání...')
                                : (t('common.image_dialog.save') ?? 'Vložit obrázek')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

interface MarkdownEditorProps {
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
    minHeight?: number;
    hasError?: boolean;
    className?: string;
    onImageUpload?: (file: File, alt?: string) => Promise<string>;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    minHeight = 200,
    hasError = false,
    className,
    onImageUpload,
}) => {
    const editorRef = useRef<MDXEditorMethods | null>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        if (editor.getMarkdown() !== value) {
            editor.setMarkdown(value ?? '');
        }
    }, [value]);

    const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const link = (event.target as HTMLElement).closest('a[href]');
        if (!link) return;
        event.preventDefault();
        event.stopPropagation();
        window.open(link.getAttribute('href') || '', '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            onClickCapture={handleEditorClick}
            style={{ minHeight }}
            className={cn(
                'overflow-hidden rounded-md border border-bg_border_element bg-bg_primary text-text_primary',
                hasError && 'border-red-500 bg-red-50/30 dark:bg-red-500/10',
                className,
            )}
        >
            <MDXEditor
                ref={editorRef}
                markdown={value ?? ''}
                onChange={(next) => onChange(normalizeMarkdownImages(next))}
                spellCheck
                className={cn(
                    'border-0 shadow-none',
                    '[&_.mdxeditor-toolbar]:flex-wrap [&_.mdxeditor-toolbar]:gap-1 [&_.mdxeditor-toolbar]:border-b [&_.mdxeditor-toolbar]:border-bg_border_element [&_.mdxeditor-toolbar]:bg-bg_primary [&_.mdxeditor-toolbar]:px-2 [&_.mdxeditor-toolbar]:py-2',
                    '[&_.mdxeditor-root-contenteditable]:max-h-[min(50vh,32rem)] [&_.mdxeditor-root-contenteditable]:min-h-[160px] [&_.mdxeditor-root-contenteditable]:overflow-y-auto',
                    '[&_.mdxeditor-root-contenteditable]:bg-bg_primary [&_.mdxeditor-root-contenteditable]:text-text_primary',
                    '[&_.mdxeditor-root-contenteditable]:caret-text_primary [&_.mdxeditor-root-contenteditable]:selection:bg-main_color/25',
                    '[&_.mdxeditor-root-contenteditable_a]:text-main_color',
                    '[&_.mdxeditor-root-contenteditable_blockquote]:border-l-bg_border_element [&_.mdxeditor-root-contenteditable_blockquote]:text-text_secondary',
                    '[&_.mdxeditor-toolbar_button:hover]:bg-bg_secondary [&_.mdxeditor-toolbar_button:hover]:text-text_primary [&_.mdxeditor-toolbar_button]:rounded-md [&_.mdxeditor-toolbar_button]:bg-transparent [&_.mdxeditor-toolbar_button]:text-text_primary',
                    '[&_.mdxeditor-toolbar_button[data-state=on]]:bg-bg_secondary [&_.mdxeditor-toolbar_button[data-state=on]]:text-text_primary',
                    // MDXEditor's bundled style.css colors its toolbar SVG icons via
                    // hard-coded fill values that don't follow the parent text color,
                    // so in dark mode the icons stay dark-on-dark and the toolbar
                    // reads as empty. Force every svg under the toolbar to pick up
                    // `text_primary` via `currentColor`. We don't touch stroke — the
                    // toolbar icons are filled glyphs, not Lucide-style outlines, and
                    // forcing `stroke-current` would draw an unwanted outline.
                    '[&_.mdxeditor-toolbar_svg]:!fill-current [&_.mdxeditor-toolbar_svg]:!text-text_primary',
                )}
                contentEditableClassName={MARKDOWN_CONTENT_CLASS_NAME}
                plugins={[
                    headingsPlugin({ allowedHeadingLevels: [2, 3, 4] }),
                    imagePlugin(
                        onImageUpload
                            ? { imageUploadHandler: (file) => onImageUpload(file) }
                            : undefined,
                    ),
                    linkDialogPlugin(),
                    linkPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
                                <UndoRedo />
                                <CustomBlockTypeSelect editorRef={editorRef} />
                                <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
                                <ListsToggle options={['bullet', 'number']} />
                                <CustomLinkDialogButton editorRef={editorRef} />
                                <CustomImageDialogButton
                                    editorRef={editorRef}
                                    onImageUpload={onImageUpload}
                                />
                            </>
                        ),
                    }),
                ]}
            />
        </div>
    );
};
