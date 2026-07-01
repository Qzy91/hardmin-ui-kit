import { ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface Props {
    value: string;
    icon: React.ElementType;
    label: string;
    activeClass?: string;
}

export function FeedbackToggleItem({
    value,
    icon: Icon,
    label,
    activeClass = 'data-[state=on]:border-main_color data-[state=on]:bg-main_color/10 data-[state=on]:text-main_color',
}: Props) {
    return (
        <ToggleGroupItem
            value={value}
            className={cn(
                'flex h-auto w-full flex-col items-center justify-center gap-1.5 rounded-lg border px-4 py-3 text-center transition-colors [&_svg]:size-6',
                'border-border hover:border-muted-foreground/50 hover:bg-accent/50',
                activeClass,
            )}
        >
            <Icon />
            <span className="text-xs font-medium">{label}</span>
        </ToggleGroupItem>
    );
}
