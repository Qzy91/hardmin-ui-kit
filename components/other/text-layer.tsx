import { useLanguage } from '@/contexts/language-context';
import { useEffect, useRef, useState } from 'react';
import { EditableText, TextElement } from './editable-text';

interface TextLayerProps {
    isActive: boolean;
    elements: TextElement[];
    setElements: React.Dispatch<React.SetStateAction<TextElement[]>>;
    currentColor: string;
}

export function TextLayer({ isActive, elements, setElements, currentColor }: TextLayerProps) {
    const { t } = useLanguage();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const isInteracting = useRef(false);

    const handleInteractionStart = () => {
        isInteracting.current = true;
    };

    const handleInteractionEnd = () => {
        setTimeout(() => {
            isInteracting.current = false;
        }, 100);
    };

    useEffect(() => {
        const handleGlobalMouseDown = (e: MouseEvent) => {
            if (!selectedId) return;
            const target = e.target as HTMLElement;

            if (target.classList.contains('text-layer-background')) return;

            if (target.closest('.chart-toolbar-interaction')) return;

            if (target.closest('.react-draggable') || target.closest('.editable-text-box')) return;

            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                if (target.closest('.editable-text-box')) return;
            }

            setSelectedId(null);
        };

        window.addEventListener('mousedown', handleGlobalMouseDown);
        return () => {
            window.removeEventListener('mousedown', handleGlobalMouseDown);
        };
    }, [selectedId]);

    const handleLayerClick = (e: React.MouseEvent) => {
        if (!isActive) return;

        if (isInteracting.current) return;

        if (selectedId) {
            setSelectedId(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const newId = Date.now().toString();

        const newElement: TextElement = {
            id: newId,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            text: '',
            color: currentColor,
            fontSize: 16,
            width: 200,
            height: 30,
        };

        setElements((prev) => [...prev, newElement]);
        setSelectedId(newId);
    };

    const handleElementChange = (id: string, newAttrs: Partial<TextElement>) => {
        setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...newAttrs } : el)));
    };

    const handleDeleteElement = (id: string) => {
        setElements((prev) => prev.filter((el) => el.id !== id));
        if (selectedId === id) setSelectedId(null);

        isInteracting.current = false;
    };

    return (
        <div
            className="text-layer-background absolute inset-0 z-20 overflow-hidden"
            style={{
                pointerEvents: isActive ? 'auto' : 'none',
                cursor: isActive ? 'default' : 'default',
            }}
            onClick={handleLayerClick}
        >
            {elements.map((el) => (
                <EditableText
                    key={el.id}
                    element={el}
                    isSelected={selectedId === el.id}
                    onSelect={setSelectedId}
                    onChange={handleElementChange}
                    onDelete={handleDeleteElement}
                    onInteractionStart={handleInteractionStart}
                    onInteractionEnd={handleInteractionEnd}
                />
            ))}

            {isActive && elements.length === 0 && (
                <div className="pointer-events-none absolute right-4 top-4 rounded-md bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                    {t('common.clickToAddText')}
                </div>
            )}
        </div>
    );
}
