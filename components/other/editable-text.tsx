import { Textarea } from '@/components/ui/textarea';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

export interface TextElement {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
    width?: number;
    height?: number;
}

interface EditableTextProps {
    element: TextElement;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onChange: (id: string, newAttrs: Partial<TextElement>) => void;
    onDelete?: (id: string) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
}

export const COMMON_TEXT_STYLES: React.CSSProperties = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    textAlign: 'left',
    lineHeight: '1.4',
    padding: '4px',
    paddingLeft: '10px',
    boxSizing: 'border-box',
    display: 'block',
    outline: 'none',
    overflow: 'hidden',
    resize: 'none',
    fontFamily: 'inherit',
    fontWeight: 'bold',
};

export function EditableText({
    element,
    isSelected,
    onSelect,
    onChange,
    onDelete,
    onInteractionStart,
    onInteractionEnd,
}: EditableTextProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    const resizeStartRef = useRef<{
        width: number;
        height: number;
        fontSize: number;
        x: number;
        y: number;
    }>({
        width: 0,
        height: 0,
        fontSize: 0,
        x: 0,
        y: 0,
    });

    const latestYRef = useRef<number>(element.y);
    const wasDragged = useRef(false);
    const wasSelectedOnDown = useRef(false);

    const [isEditing, setIsEditing] = useState(element.text === '');
    const [dynamicFontSize, setDynamicFontSize] = useState(element.fontSize);

    useEffect(() => {
        setDynamicFontSize(element.fontSize);
        latestYRef.current = element.y;
    }, [element.fontSize, element.y]);

    useEffect(() => {
        if (!isSelected && isEditing) {
            setIsEditing(false);
        }
    }, [isSelected, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    useLayoutEffect(() => {
        if (textRef.current) {
            const safeWidth = Math.max(element.width || 0, 20);
            textRef.current.style.width = `${safeWidth}px`;

            const actualHeight = textRef.current.offsetHeight;
            const currentHeight = element.height || 0;

            if (Math.abs(actualHeight - currentHeight) > 1) {
                onChange(element.id, { height: actualHeight });
            }
        }
    }, [element.text, dynamicFontSize, element.width, element.height, onChange, element.id]);

    const handleDragStart = () => {
        wasDragged.current = false;
        onInteractionStart?.();
    };

    const handleDrag = () => {
        wasDragged.current = true;
    };

    const handleDragStop = (_e: any, d: { x: number; y: number }) => {
        if (wasDragged.current) {
            onChange(element.id, { x: d.x, y: d.y });
        }
        onInteractionEnd?.();
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isEditing && !wasDragged.current) {
            e.stopPropagation();

            if (wasSelectedOnDown.current) {
                setIsEditing(true);
            }

            onSelect(element.id);
        }
    };

    const handleResizeStart = (_e: any, _dir: string, ref: HTMLElement) => {
        onInteractionStart?.();
        const currentWidth = parseInt(ref.style.width, 10) || ref.offsetWidth;
        const currentHeight = parseInt(ref.style.height, 10) || ref.offsetHeight;

        resizeStartRef.current = {
            width: currentWidth,
            height: currentHeight,
            fontSize: dynamicFontSize,
            x: element.x,
            y: element.y,
        };

        latestYRef.current = element.y;
    };

    const handleResize = (
        _e: any,
        direction: string,
        ref: HTMLElement,
        _delta: any,
        position: { x: number; y: number },
    ) => {
        if (!textRef.current) return;

        const newWidth = parseInt(ref.style.width, 10);
        const startState = resizeStartRef.current;

        if (direction === 'left' || direction === 'right') {
            textRef.current.style.width = `${newWidth}px`;
            setDynamicFontSize(startState.fontSize);
        } else {
            if (startState.width > 0) {
                const scaleFactor = newWidth / startState.width;
                const newFontSize = Math.max(12, startState.fontSize * scaleFactor);

                setDynamicFontSize(newFontSize);

                textRef.current.style.fontSize = `${newFontSize}px`;
                textRef.current.style.width = `${newWidth}px`;
                if (inputRef.current) inputRef.current.style.fontSize = `${newFontSize}px`;
            }
        }

        const newTextHeight = textRef.current.offsetHeight;
        ref.style.height = `${newTextHeight}px`;

        if (direction.includes('top')) {
            const newY = startState.y + startState.height - newTextHeight;
            ref.style.transform = `translate(${position.x}px, ${newY}px)`;
            latestYRef.current = newY;
        }
    };

    const handleResizeStop = (
        _e: any,
        direction: string,
        ref: HTMLElement,
        _delta: any,
        position: { x: number; y: number },
    ) => {
        if (!textRef.current) return;
        const newWidth = parseInt(ref.style.width, 10);
        const finalContentHeight = textRef.current.offsetHeight;

        let finalY = position.y;

        if (direction.includes('top')) {
            finalY = latestYRef.current;
        }

        onChange(element.id, {
            width: newWidth,
            height: finalContentHeight,
            fontSize: dynamicFontSize,
            x: position.x,
            y: finalY,
        });
        onInteractionEnd?.();
    };

    const handleBlur = () => {
        setIsEditing(false);

        if (element.text.trim() === '') {
            onDelete?.(element.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
        }
    };

    return (
        <Rnd
            size={{
                width: element.width || 'auto',
                height: element.height || 'auto',
            }}
            position={{ x: element.x, y: element.y }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragStop={handleDragStop}
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            onResizeStop={handleResizeStop}
            disableDragging={isEditing}
            enableUserSelectHack={!isEditing}
            lockAspectRatio={false}
            enableResizing={
                isSelected
                    ? {
                          bottomRight: true,
                          topRight: true,
                          bottomLeft: true,
                          topLeft: true,
                          right: true,
                          left: true,
                          top: false,
                          bottom: false,
                      }
                    : false
            }
            onMouseDown={(e) => {
                if (!isEditing) {
                    e.stopPropagation();

                    wasSelectedOnDown.current = isSelected;

                    onSelect(element.id);
                }
            }}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                cursor: isEditing ? 'text' : 'move',
                pointerEvents: 'auto',
                zIndex: isSelected ? 30 : 20,
            }}
            bounds="parent"
        >
            <div
                className={`editable-text-box relative flex size-full items-start justify-center ${
                    isSelected
                        ? 'border border-dashed border-primary ring-1 ring-bg_primary'
                        : 'border border-transparent'
                }`}
                style={{ padding: '0px', boxSizing: 'border-box' }}
                onMouseUp={handleMouseUp}
            >
                {isSelected && (
                    <>
                        <div className="absolute -left-1.5 -top-1.5 size-3 cursor-nwse-resize rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-yellow-500 hover:bg-yellow-400" />
                        <div className="absolute -right-1.5 -top-1.5 size-3 cursor-nesw-resize rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-yellow-500 hover:bg-yellow-400" />
                        <div className="absolute -bottom-1.5 -left-1.5 size-3 cursor-nesw-resize rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-yellow-500 hover:bg-yellow-400" />
                        <div className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-yellow-500 hover:bg-yellow-400" />
                        <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 cursor-ew-resize rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-yellow-500 hover:bg-yellow-400" />
                        <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 cursor-ew-resize rounded-full border border-gray-400 bg-white shadow-sm transition-colors hover:border-yellow-500 hover:bg-yellow-400" />
                    </>
                )}

                <span
                    ref={textRef}
                    style={{
                        ...COMMON_TEXT_STYLES,
                        fontSize: `${dynamicFontSize}px`,
                        color: 'transparent',
                        textShadow: 'none',
                        width: '100%',
                        minHeight: `${dynamicFontSize}px`,
                        position: 'relative',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}
                >
                    {element.text}
                    {element.text.endsWith('\n') && <br />}
                    {element.text === '' && <>&nbsp;</>}
                </span>

                {isEditing ? (
                    <Textarea
                        ref={inputRef}
                        className="absolute inset-0 size-full bg-transparent"
                        style={{
                            ...COMMON_TEXT_STYLES,
                            fontSize: `${dynamicFontSize}px`,
                            color: element.color,
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 2,
                        }}
                        value={element.text}
                        onChange={(e) => onChange(element.id, { text: e.target.value })}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{
                            ...COMMON_TEXT_STYLES,
                            fontSize: `${dynamicFontSize}px`,
                            color: element.color,
                            textShadow: '0px 0px 2px rgba(255,255,255,0.8)',
                            zIndex: 2,
                            pointerEvents: 'none',
                        }}
                    >
                        {element.text}
                    </div>
                )}
            </div>
        </Rnd>
    );
}
