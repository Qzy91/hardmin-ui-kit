import { Checkbox } from '@/components/ui/checkbox';

interface Props {
    checked: boolean;
    indeterminate?: boolean;
    onChange: (checked: boolean) => void;
}

export function IndeterminateCheckbox({ checked, indeterminate, onChange }: Props) {
    return (
        <Checkbox
            checked={indeterminate ? 'indeterminate' : checked}
            onCheckedChange={(val) => onChange(!!val)}
            onClick={(e) => e.stopPropagation()}
        />
    );
}
