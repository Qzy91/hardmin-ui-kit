import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DatePicker } from '@/components/other/date-picker'
import { DatePickerSimple } from '@/components/other/date-picker-simple'
import { cs } from 'date-fns/locale'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { MultiSelect } from '@/components/other/multi-select'
import { ResponsiveTabs } from '@/components/other/responsive-tabs'
import { EnergyManagementTabs } from '@/components/energy-management/EnergyManagementTabs'
import type { EnergyManagementTabItem } from '@/components/energy-management/EnergyManagementTabs'
import { UnifiedTable, RowActionsMenu } from '@/components/table'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  Component,
  Droplets,
  Eye,
  Flame,
  Info,
  Leaf,
  LayoutGrid,
  Pencil,
  Search,
  Thermometer,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

export const title = 'Katalog komponent'
export const icon = Component

/* ─────────────────────────── Layout helpers ─────────────────────────────── */

function ComponentSection({
  id,
  n,
  name,
  en,
  importPath,
  children,
}: {
  id: string
  n: number
  name: string
  en: string
  importPath: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-lg border border-bg_border_element bg-bg_primary overflow-hidden">
      <div className="flex items-center gap-3 border-b border-bg_border_element bg-bg_secondary px-5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-main_color text-xs font-bold text-text_primary flex-shrink-0">
          {n}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-text_primary">{name}</span>
          <span className="ml-2 text-text_secondary text-sm">({en})</span>
        </div>
        <code className="hidden text-xs font-mono text-text_secondary sm:block">{importPath}</code>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function VariantRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-bg_border_element last:border-0">
      <span className="w-44 flex-shrink-0 pt-1 text-xs font-mono text-text_secondary">{label}</span>
      <div className="flex flex-1 min-w-0 flex-wrap items-start gap-3">{children}</div>
    </div>
  )
}

/* ─────────────────────────── Mock table data ─────────────────────────────── */

interface MockRow { id: number; name: string; status: string; amount: string }
const TABLE_DATA: MockRow[] = [
  { id: 1, name: 'Faktura #2025-001', status: 'Zaplaceno', amount: '12 500 Kč' },
  { id: 2, name: 'Faktura #2025-002', status: 'Čeká', amount: '8 200 Kč' },
  { id: 3, name: 'Faktura #2025-003', status: 'Po splatnosti', amount: '3 900 Kč' },
]
const TABLE_COLS: ColumnDef<MockRow, unknown>[] = [
  { accessorKey: 'name', header: 'Název' },
  {
    accessorKey: 'status', header: 'Stav',
    cell: ({ getValue }) => {
      const v = getValue() as string
      const variant = v === 'Zaplaceno' ? 'success' : v === 'Po splatnosti' ? 'destructive' : 'warning'
      return <Badge variant={variant}>{v}</Badge>
    },
  },
  { accessorKey: 'amount', header: 'Částka' },
]

/* ════════════════════════════ PAGE ════════════════════════════════════════ */

export default function KatalogKomponent() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectVal, setSelectVal] = useState('opt1')
  const [checkA, setCheckA] = useState(true)
  const [checkB, setCheckB] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)
  const [radio, setRadio] = useState('r1')
  const [date, setDate] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [multiVal, setMultiVal] = useState<string[]>([])
  const [progress] = useState(65)
  const [emsTab, setEmsTab] = useState('overview')
  const [responsiveTab, setResponsiveTab] = useState('zakladni')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [dateSimple, setDateSimple] = useState<Date | null>(null)

  const EMS_TABS: EnergyManagementTabItem[] = [
    { id: 'overview', label: 'Přehled', icon: BarChart3, colorClass: 'bg-main_color/20', textColorClass: 'text-text_primary', borderColorClass: 'border-main_color/45' },
    { id: 'electricity', label: 'Elektřina', icon: Zap, colorClass: 'bg-red-100/50', textColorClass: 'text-red-600', borderColorClass: 'border-red-300/70' },
    { id: 'water', label: 'Voda', icon: Droplets, colorClass: 'bg-blue-100/50', textColorClass: 'text-blue-600', borderColorClass: 'border-blue-300/70' },
    { id: 'gas', label: 'Plyn', icon: Flame, colorClass: 'bg-purple-100/50', textColorClass: 'text-purple-600', borderColorClass: 'border-purple-300/70' },
    { id: 'heat', label: 'Teplo', icon: Thermometer, colorClass: 'bg-orange-100/50', textColorClass: 'text-orange-600', borderColorClass: 'border-orange-300/70' },
    { id: 'esg', label: 'ESG', icon: Leaf, colorClass: 'bg-green-100/50', textColorClass: 'text-green-600', borderColorClass: 'border-green-300/70' },
  ]

  const MULTI_OPTIONS = [
    { value: 'ems', label: 'EMS' },
    { value: 'billing', label: 'Fakturace' },
    { value: 'users', label: 'Uživatelé' },
    { value: 'reports', label: 'Reporty' },
  ]

  return (
    <div className="min-h-screen bg-bg_secondary">
      <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
        <Component className="h-5 w-5 text-text_secondary" />
        <span className="text-text_secondary text-sm">Dokumentace</span>
        <span className="text-text_secondary mx-1">–</span>
        <h1 className="text-xl font-bold text-text_primary">Katalog komponent</h1>
      </div>

      <div className="flex">
        {/* ── Sticky right TOC ── */}
        <aside className="hidden xl:block w-52 flex-shrink-0 order-last">
          <div className="sticky top-6 py-6 pr-6 pl-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text_secondary">Obsah</p>
            <nav className="space-y-0.5">
              {[
                ['btn','#1 Button'],['badge','#2 Badge'],['input','#3 Input'],
                ['label','#4 Label'],['textarea','#5 Textarea'],['select','#6 Select'],
                ['checkbox','#7 Checkbox'],['switch','#8 Switch'],['radio','#9 RadioGroup'],
                ['datepicker','#10 DatePicker'],['tabs','#11 Tabs / EnergyTabs'],['dialog','#12 Dialog'],
                ['tooltip','#13 Tooltip'],['dropdown','#14 DropdownMenu'],['table','#15 UnifiedTable'],
                ['avatar','#16 Avatar'],['separator','#17 Separator'],['skeleton','#18 Skeleton'],
                ['spinner','#19 Spinner'],['alert','#20 Alert'],['card','#21 Card'],
                ['progress','#22 Progress'],['searchinput','#23 SearchInput'],
                ['multiselect','#24 MultiSelect'],['accordion','#25 Accordion'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="block w-full text-left rounded px-2 py-1 text-xs font-mono text-text_secondary hover:bg-bg_primary hover:text-main_color transition-colors"
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 px-8 py-6 space-y-6">

        {/* ── #1 Button ── */}
        <ComponentSection id="btn" n={1} name="Tlačítko" en="Button" importPath="@/components/ui/button">
          <VariantRow label='variant="default"'>
            <Button>Uložit</Button>
          </VariantRow>
          <VariantRow label='variant="main"'>
            <Button variant="main">Vytvořit</Button>
            <span className="text-xs text-text_secondary">— zlaté, primární CTA</span>
          </VariantRow>
          <VariantRow label='variant="outline"'>
            <Button variant="outline">Zrušit</Button>
          </VariantRow>
          <VariantRow label='variant="destructive"'>
            <Button variant="destructive">Smazat</Button>
          </VariantRow>
          <VariantRow label='variant="ghost"'>
            <Button variant="ghost">Skrýt</Button>
          </VariantRow>
          <VariantRow label='variant="link"'>
            <Button variant="link">Zobrazit více</Button>
          </VariantRow>
          <VariantRow label='variant="success_confirm"'>
            <Button variant="success_confirm">Potvrdit</Button>
          </VariantRow>
          <VariantRow label='size="sm"'>
            <Button size="sm">Malé</Button>
            <Button variant="outline" size="sm">Malé outline</Button>
          </VariantRow>
          <VariantRow label='size="lg"'>
            <Button size="lg">Velké</Button>
          </VariantRow>
          <VariantRow label='size="icon" + Tooltip'>
            <TooltipProvider delayDuration={200}>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Upravit">
                      <Pencil className="h-4 w-4 text-main_color" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upravit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Smazat">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Smazat</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Detail">
                      <Eye className="h-4 w-4 text-text_secondary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Detail</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <span className="text-xs text-text_secondary">— vždy obali Tooltip</span>
          </VariantRow>
          <VariantRow label="s ikonou vlevo">
            <Button variant="main" className="gap-2"><Bell className="h-4 w-4" />Oznámení</Button>
            <Button variant="outline" className="gap-2"><Search className="h-4 w-4" />Hledat</Button>
          </VariantRow>
          <VariantRow label="disabled">
            <Button disabled>Nedostupné</Button>
            <Button variant="outline" disabled>Nedostupné</Button>
          </VariantRow>
        </ComponentSection>

        {/* ── #2 Badge ── */}
        <ComponentSection id="badge" n={2} name="Odznak" en="Badge" importPath="@/components/ui/badge">
          <VariantRow label='variant="success"'><Badge variant="success">Aktivní</Badge><Badge variant="success">Zaplaceno</Badge><Badge variant="success">Ověřeno</Badge></VariantRow>
          <VariantRow label='variant="warning"'><Badge variant="warning">Čeká</Badge><Badge variant="warning">Pending</Badge></VariantRow>
          <VariantRow label='variant="destructive"'><Badge variant="destructive">Smazáno</Badge><Badge variant="destructive">Chyba</Badge><Badge variant="destructive">Po splatnosti</Badge></VariantRow>
          <VariantRow label='variant="outline"'><Badge variant="outline">Neaktivní</Badge><Badge variant="outline">Neutrální</Badge></VariantRow>
          <VariantRow label='variant="secondary"'><Badge variant="secondary">Sekundární</Badge></VariantRow>
          <VariantRow label='variant="default"'><Badge>Výchozí</Badge></VariantRow>
          <VariantRow label="s vlastní barvou"><Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">Informace</Badge><Badge variant="outline" className="border-green-300 text-green-700">Vlastní zelená</Badge></VariantRow>
        </ComponentSection>

        {/* ── #3 Input ── */}
        <ComponentSection id="input" n={3} name="Vstupní pole" en="Input" importPath="@/components/ui/input">
          <VariantRow label="default">
            <Input placeholder="Zadejte hodnotu…" className="w-64" />
          </VariantRow>
          <VariantRow label="s ikonou (prefix)">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text_secondary" />
              <Input placeholder="Hledat…" className="pl-9" />
            </div>
          </VariantRow>
          <VariantRow label='type="email"'>
            <Input type="email" placeholder="jan.novak@firma.cz" className="w-64" />
          </VariantRow>
          <VariantRow label='type="number"'>
            <Input type="number" placeholder="0" className="w-32" />
          </VariantRow>
          <VariantRow label="readOnly">
            <Input value="Pouze ke čtení" readOnly className="w-64" />
          </VariantRow>
          <VariantRow label="disabled">
            <Input placeholder="Nedostupné" disabled className="w-64" />
          </VariantRow>
        </ComponentSection>

        {/* ── #4 Label ── */}
        <ComponentSection id="label" n={4} name="Popisek" en="Label" importPath="@/components/ui/label">
          <VariantRow label="základní">
            <div className="space-y-1.5">
              <Label htmlFor="ex-input">Název organizace</Label>
              <Input id="ex-input" placeholder="Hardmin s.r.o." className="w-64" />
            </div>
          </VariantRow>
          <VariantRow label="s hvězdičkou (povinné)">
            <div className="space-y-1.5">
              <Label htmlFor="ex-req">E-mail <span className="text-red-500">*</span></Label>
              <Input id="ex-req" type="email" placeholder="Povinné pole" className="w-64" />
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #5 Textarea ── */}
        <ComponentSection id="textarea" n={5} name="Textová oblast" en="Textarea" importPath="@/components/ui/textarea">
          <VariantRow label="default">
            <Textarea placeholder="Napište poznámku…" className="w-80 min-h-[80px]" />
          </VariantRow>
          <VariantRow label="rows={6}">
            <Textarea placeholder="Delší text…" rows={6} className="w-80" />
          </VariantRow>
          <VariantRow label="disabled">
            <Textarea placeholder="Nedostupné" disabled className="w-80" />
          </VariantRow>
        </ComponentSection>

        {/* ── #6 Select ── */}
        <ComponentSection id="select" n={6} name="Výběr" en="Select" importPath="@/components/ui/select">
          <VariantRow label="základní">
            <Select value={selectVal} onValueChange={setSelectVal}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Vyberte…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="opt1">Možnost 1</SelectItem>
                <SelectItem value="opt2">Možnost 2</SelectItem>
                <SelectItem value="opt3">Možnost 3</SelectItem>
              </SelectContent>
            </Select>
          </VariantRow>
          <VariantRow label="s placeholder">
            <Select>
              <SelectTrigger className="w-52"><SelectValue placeholder="Vyberte stav…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktivní</SelectItem>
                <SelectItem value="inactive">Neaktivní</SelectItem>
              </SelectContent>
            </Select>
          </VariantRow>
          <VariantRow label="disabled">
            <Select disabled>
              <SelectTrigger className="w-52"><SelectValue placeholder="Nedostupné" /></SelectTrigger>
              <SelectContent><SelectItem value="x">x</SelectItem></SelectContent>
            </Select>
          </VariantRow>
        </ComponentSection>

        {/* ── #7 Checkbox ── */}
        <ComponentSection id="checkbox" n={7} name="Zaškrtávací políčko" en="Checkbox" importPath="@/components/ui/checkbox">
          <VariantRow label="checked">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text_primary">
              <Checkbox checked={checkA} onCheckedChange={(v) => setCheckA(v === true)} />
              Pouze aktivní záznamy
            </label>
          </VariantRow>
          <VariantRow label="unchecked">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text_primary">
              <Checkbox checked={checkB} onCheckedChange={(v) => setCheckB(v === true)} />
              Zobrazit smazané
            </label>
          </VariantRow>
          <VariantRow label="disabled">
            <label className="flex cursor-not-allowed items-center gap-2 text-sm text-text_secondary">
              <Checkbox disabled />
              Nedostupné
            </label>
          </VariantRow>
        </ComponentSection>

        {/* ── #8 Switch ── */}
        <ComponentSection id="switch" n={8} name="Přepínač" en="Switch" importPath="@/components/ui/switch">
          <VariantRow label="on/off">
            <div className="flex items-center gap-3">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              <Label className="cursor-pointer" onClick={() => setSwitchOn((v) => !v)}>
                {switchOn ? 'Zapnuto' : 'Vypnuto'}
              </Label>
            </div>
          </VariantRow>
          <VariantRow label="disabled">
            <div className="flex items-center gap-3">
              <Switch disabled />
              <Label className="text-text_secondary">Nedostupné</Label>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #9 RadioGroup ── */}
        <ComponentSection id="radio" n={9} name="Přepínač možností" en="RadioGroup" importPath="@/components/ui/radio-group">
          <VariantRow label="vertikální">
            <RadioGroup value={radio} onValueChange={setRadio} className="space-y-2">
              {['r1', 'r2', 'r3'].map((v, i) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`rg-${v}`} />
                  <Label htmlFor={`rg-${v}`} className="cursor-pointer">Možnost {i + 1}</Label>
                </div>
              ))}
            </RadioGroup>
          </VariantRow>
          <VariantRow label="horizontální">
            <RadioGroup value={radio} onValueChange={setRadio} className="flex gap-6">
              {['r1', 'r2', 'r3'].map((v, i) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`rgh-${v}`} />
                  <Label htmlFor={`rgh-${v}`} className="cursor-pointer">Opt. {i + 1}</Label>
                </div>
              ))}
            </RadioGroup>
          </VariantRow>
        </ComponentSection>

        {/* ── #10 DatePicker ── */}
        <ComponentSection id="datepicker" n={10} name="Výběr datumu" en="DatePicker" importPath="@/components/other/date-picker">
          <VariantRow label="základní">
            <DatePicker label="Datum" value={date} onChange={(d) => setDate(d ?? null)} className="w-56" />
          </VariantRow>
          <VariantRow label="bez popisku">
            <DatePicker hideLabel value={date} onChange={(d) => setDate(d ?? null)} className="w-56" />
          </VariantRow>
          <VariantRow label="bez dropdownu (label)">
            <DatePickerSimple
              label="Datum připomínky"
              value={dateSimple}
              onChange={(d) => setDateSimple(d ?? null)}
              className="w-56"
            />
          </VariantRow>
          <VariantRow label="rozsah dat (range)">
            <div className="space-y-2">
              <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative w-64 justify-start pr-10 text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>{format(dateRange.from, 'dd.MM')} – {format(dateRange.to, 'dd.MM.yyyy')}</>
                        ) : (
                          format(dateRange.from, 'dd.MM.yyyy')
                        )
                      ) : (
                        <span className="text-muted-foreground">Vyberte rozsah</span>
                      )}
                    </span>
                    {dateRange?.from && (
                      <div
                        role="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-bg_secondary"
                        onClick={(e) => { e.stopPropagation(); setDateRange(undefined) }}
                      >
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={cs}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-text_secondary">
                Přímé použití <code className="font-mono">Calendar</code> s <code className="font-mono">mode="range" numberOfMonths={'{2}'}</code> — bez wrapper komponenty.
              </p>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #11 Tabs ── */}
        <ComponentSection id="tabs" n={11} name="Záložky" en="Tabs" importPath="@/components/ui/tabs">
          <VariantRow label="základní (s rámečkem)">
            <div className="w-full max-w-md rounded-md bg-bg_secondary p-4">
              <Tabs defaultValue="t1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="t1">Přehled</TabsTrigger>
                  <TabsTrigger value="t2">Detail</TabsTrigger>
                  <TabsTrigger value="t3">Historie</TabsTrigger>
                </TabsList>
                <TabsContent value="t1" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Obsah záložky Přehled</TabsContent>
                <TabsContent value="t2" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Obsah záložky Detail</TabsContent>
                <TabsContent value="t3" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Obsah záložky Historie</TabsContent>
              </Tabs>
            </div>
          </VariantRow>
          <VariantRow label="na celou šířku (v dialogu)">
            <div className="w-full">
              <Tabs defaultValue="t1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="t1">Struktura</TabsTrigger>
                  <TabsTrigger value="t2">Parametry</TabsTrigger>
                  <TabsTrigger value="t3">Koncepty</TabsTrigger>
                </TabsList>
                <TabsContent value="t1" className="rounded-md border border-bg_border_element p-4 text-sm text-text_secondary">Obsah záložky Struktura</TabsContent>
                <TabsContent value="t2" className="rounded-md border border-bg_border_element p-4 text-sm text-text_secondary">Obsah záložky Parametry</TabsContent>
                <TabsContent value="t3" className="rounded-md border border-bg_border_element p-4 text-sm text-text_secondary">Obsah záložky Koncepty</TabsContent>
              </Tabs>
            </div>
          </VariantRow>
          <VariantRow label="průhledné (detail stránka — bez rámečku)">
            <div className="w-full max-w-md rounded-md bg-bg_secondary p-4">
              <Tabs defaultValue="t1" className="w-full">
                <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
                  <TabsTrigger value="t1">Základní info</TabsTrigger>
                  <TabsTrigger value="t2">Organizace</TabsTrigger>
                  <TabsTrigger value="t3">Aktivity</TabsTrigger>
                </TabsList>
                <TabsContent value="t1" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Obsah záložky</TabsContent>
                <TabsContent value="t2" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Organizace</TabsContent>
                <TabsContent value="t3" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Aktivity</TabsContent>
              </Tabs>
            </div>
          </VariantRow>
          <VariantRow label="s ikonami (kategorie)">
            <Tabs defaultValue="prehled" className="w-full max-w-lg">
              <TabsList>
                <TabsTrigger value="prehled" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" />Přehled
                </TabsTrigger>
                <TabsTrigger value="elektrina" className="gap-1.5">
                  <Bell className="h-4 w-4" />Elektřina
                </TabsTrigger>
                <TabsTrigger value="voda" className="gap-1.5">
                  <Info className="h-4 w-4" />Voda
                </TabsTrigger>
                <TabsTrigger value="plyn" className="gap-1.5">
                  <AlertCircle className="h-4 w-4" />Plyn
                </TabsTrigger>
              </TabsList>
              <TabsContent value="prehled" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Přehled</TabsContent>
              <TabsContent value="elektrina" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Elektřina</TabsContent>
              <TabsContent value="voda" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Voda</TabsContent>
              <TabsContent value="plyn" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Plyn</TabsContent>
            </Tabs>
          </VariantRow>
          <VariantRow label="ResponsiveTabs (scrollovatelné)">
            <div className="w-full max-w-2xl space-y-2">
              <ResponsiveTabs
                value={responsiveTab}
                onValueChange={setResponsiveTab}
                tabs={[
                  { value: 'zakladni', label: 'Základní informace' },
                  { value: 'obecne', label: 'Obecné nastavení' },
                  { value: 'zarizeni', label: 'Zařízení' },
                  { value: 'uzivatele', label: 'Uživatelé' },
                  { value: 'kontakty', label: 'Kontaktní osoby' },
                  { value: 'protokoly', label: 'Protokoly aktivit' },
                ]}
              >
                <TabsContent value="zakladni" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Základní informace</TabsContent>
                <TabsContent value="obecne" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Obecné nastavení</TabsContent>
                <TabsContent value="zarizeni" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Zařízení</TabsContent>
                <TabsContent value="uzivatele" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Uživatelé</TabsContent>
                <TabsContent value="kontakty" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Kontaktní osoby</TabsContent>
                <TabsContent value="protokoly" className="rounded-md border border-bg_border_element bg-bg_primary p-4 text-sm text-text_secondary">Protokoly aktivit</TabsContent>
              </ResponsiveTabs>
              <p className="text-xs text-text_secondary">
                Import: <code className="font-mono">@/components/other/responsive-tabs</code> — automaticky přidává šipky při přetečení. Použij pro detail stránky s mnoha záložkami.
              </p>
            </div>
          </VariantRow>
          <VariantRow label="EnergyManagementTabs (s barevným borde rem)">
            <div className="w-full max-w-2xl space-y-2">
              <EnergyManagementTabs
                tabs={EMS_TABS}
                activeTabId={emsTab}
                onTabChange={setEmsTab}
              />
              <p className="text-xs text-text_secondary">
                Import: <code className="font-mono">@/components/energy-management/EnergyManagementTabs</code> — vlastní HC komponent (není shadcn). Každá záložka má <code className="font-mono">colorClass</code>, <code className="font-mono">textColorClass</code>, <code className="font-mono">borderColorClass</code> z Tailwindu.
              </p>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #12 Dialog ── */}
        <ComponentSection id="dialog" n={12} name="Modální okno" en="Dialog" importPath="@/components/ui/dialog">
          <VariantRow label="základní">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>Otevřít dialog</Button>
            <Dialog open={dialogOpen} onOpenChange={(o: boolean) => setDialogOpen(o)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Potvrdit akci</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-text_secondary">
                  Opravdu chcete provést tuto akci? Tato operace je nevratná.
                </p>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Zrušit</Button>
                  <Button variant="destructive" onClick={() => setDialogOpen(false)}>Smazat</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </VariantRow>
          <VariantRow label="max-w-lg / max-w-2xl / max-w-4xl">
            <span className="text-xs text-text_secondary">Šířka se nastavuje přes className na DialogContent</span>
          </VariantRow>
        </ComponentSection>

        {/* ── #13 Tooltip ── */}
        <ComponentSection id="tooltip" n={13} name="Tip" en="Tooltip" importPath="@/components/ui/tooltip">
          <VariantRow label="nad tlačítkem">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>Nápověda pro tuto akci</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </VariantRow>
          <VariantRow label="nad textem">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help border-b border-dashed border-text_secondary text-sm text-text_primary">
                    Podtržený text
                  </span>
                </TooltipTrigger>
                <TooltipContent>Vysvětlení pojmu</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </VariantRow>
        </ComponentSection>

        {/* ── #14 DropdownMenu ── */}
        <ComponentSection id="dropdown" n={14} name="Rozbalovací nabídka" en="DropdownMenu" importPath="@/components/ui/dropdown-menu">
          <VariantRow label="základní">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Akce <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Zobrazit</DropdownMenuItem>
                <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Upravit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />Smazat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </VariantRow>
        </ComponentSection>

        {/* ── #15 UnifiedTable ── */}
        <ComponentSection id="table" n={15} name="Tabulka" en="UnifiedTable" importPath="@/components/table">
          <p className="mb-3 text-xs text-text_secondary">
            Props: <code className="font-mono">data · columns · onRowClick · renderRowActions · rowTone · pageSize · showColumnSelector · showResultsCount</code>
          </p>
          <UnifiedTable
            data={TABLE_DATA}
            columns={TABLE_COLS}
            renderRowActions={(row: MockRow) => (
              <RowActionsMenu items={[
                { label: 'Detail', icon: <Eye className="h-4 w-4" />, onClick: () => {} },
                { label: 'Upravit', icon: <Pencil className="h-4 w-4" />, onClick: () => {} },
                { type: 'separator' as const },
                { label: 'Smazat', icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, isDestructive: true },
              ]} />
            )}
          />
          <div className="mt-4 text-xs text-text_secondary space-y-1">
            <p><code className="font-mono">{"rowTone={(row) => row.deleted ? 'deleted' : undefined}"}</code> — červený řádek pro smazané záznamy</p>
            <p><code className="font-mono">{"onRowClick={(row) => navigate(`/sekce/detail?id=${row.id}`)}"}</code> — navigace na detail</p>
          </div>
        </ComponentSection>

        {/* ── #16 Avatar ── */}
        <ComponentSection id="avatar" n={16} name="Avatar" en="Avatar" importPath="@/components/ui/avatar">
          <VariantRow label="s obrázkem">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </VariantRow>
          <VariantRow label="fallback (iniciály)">
            <Avatar><AvatarFallback className="bg-main_color text-text_primary">JN</AvatarFallback></Avatar>
            <Avatar><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
          </VariantRow>
        </ComponentSection>

        {/* ── #17 Separator ── */}
        <ComponentSection id="separator" n={17} name="Oddělovač" en="Separator" importPath="@/components/ui/separator">
          <VariantRow label='orientation="horizontal"'>
            <div className="w-64"><Separator /></div>
          </VariantRow>
          <VariantRow label='orientation="vertical"'>
            <div className="flex h-8 items-center gap-3">
              <span className="text-sm text-text_primary">Vlevo</span>
              <Separator orientation="vertical" />
              <span className="text-sm text-text_primary">Vpravo</span>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #18 Skeleton ── */}
        <ComponentSection id="skeleton" n={18} name="Kostra (načítání)" en="Skeleton" importPath="@/components/ui/skeleton">
          <VariantRow label="řádky textu">
            <div className="space-y-2 w-64">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </VariantRow>
          <VariantRow label="karta">
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #19 Spinner ── */}
        <ComponentSection id="spinner" n={19} name="Načítání" en="Spinner" importPath="@/components/ui/spinner">
          <VariantRow label="default">
            <Spinner />
            <span className="text-sm text-text_secondary">Načítání…</span>
          </VariantRow>
        </ComponentSection>

        {/* ── #20 Alert ── */}
        <ComponentSection id="alert" n={20} name="Upozornění" en="Alert" importPath="@/components/ui/alert">
          <VariantRow label='variant="default"'>
            <Alert className="max-w-md">
              <Info className="h-4 w-4" />
              <AlertTitle>Informace</AlertTitle>
              <AlertDescription>Tato akce bude provedena ihned.</AlertDescription>
            </Alert>
          </VariantRow>
          <VariantRow label='variant="destructive"'>
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chyba</AlertTitle>
              <AlertDescription>Operaci se nepodařilo dokončit.</AlertDescription>
            </Alert>
          </VariantRow>
        </ComponentSection>

        {/* ── #21 Card ── */}
        <ComponentSection id="card" n={21} name="Karta" en="Card" importPath="@/components/ui/card">
          <VariantRow label="základní">
            <Card className="w-64">
              <CardHeader>
                <CardTitle>Název karty</CardTitle>
                <CardDescription>Krátký popis obsahu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text_secondary">Obsah karty — statistika, info, akce.</p>
              </CardContent>
            </Card>
          </VariantRow>
          <VariantRow label="stat karta (custom)">
            <div className="rounded-lg border border-bg_border_element bg-bg_primary p-5 w-48">
              <p className="text-sm text-text_secondary">Celkem uživatelů</p>
              <p className="mt-1 text-3xl font-bold text-text_primary">142</p>
              <p className="mt-1 text-xs text-green-600">+12 tento měsíc</p>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #22 Progress ── */}
        <ComponentSection id="progress" n={22} name="Průběh" en="Progress" importPath="@/components/ui/progress">
          <VariantRow label="základní">
            <div className="w-64 space-y-1.5">
              <Progress value={progress} />
              <p className="text-xs text-text_secondary text-right">{progress} %</p>
            </div>
          </VariantRow>
        </ComponentSection>

        {/* ── #23 Vyhledávací pole ── */}
        <ComponentSection id="searchinput" n={23} name="Vyhledávací pole" en="Input + Search icon" importPath="@/components/ui/input">
          <VariantRow label="s ikonou (doporučeno)">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text_secondary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat podle jména…"
                className="pl-9"
              />
            </div>
          </VariantRow>
          <p className="mt-1 text-xs text-text_secondary">
            <code className="font-mono">SearchInput</code> z <code className="font-mono">components/other/</code> je HC-specifický (vyžaduje Inertia router) — nepoužívej ho v prototypech. Místo toho použij <code className="font-mono">Input</code> s ikonou <code className="font-mono">Search</code> vlevo.
          </p>
        </ComponentSection>

        {/* ── #24 MultiSelect ── */}
        <ComponentSection id="multiselect" n={24} name="Vícehodnotový výběr" en="MultiSelect" importPath="@/components/other/multi-select">
          <VariantRow label="základní">
            <MultiSelect
              options={MULTI_OPTIONS}
              selectedValues={multiVal}
              onChange={setMultiVal}
              placeholder="Vyberte moduly…"
              className="w-72"
            />
          </VariantRow>
        </ComponentSection>

        {/* ── #25 Accordion ── */}
        <ComponentSection id="accordion" n={25} name="Akordeon" en="Accordion" importPath="@/components/ui/accordion">
          <VariantRow label='type="single"'>
            <Accordion type="single" collapsible className="w-80">
              <AccordionItem value="a1">
                <AccordionTrigger>Sekce 1</AccordionTrigger>
                <AccordionContent className="text-sm text-text_secondary">Obsah první sekce.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="a2">
                <AccordionTrigger>Sekce 2</AccordionTrigger>
                <AccordionContent className="text-sm text-text_secondary">Obsah druhé sekce.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="a3">
                <AccordionTrigger>Sekce 3</AccordionTrigger>
                <AccordionContent className="text-sm text-text_secondary">Obsah třetí sekce.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </VariantRow>
        </ComponentSection>

        {/* Design tokeny */}
        <section className="rounded-lg border border-bg_border_element bg-bg_primary overflow-hidden">
          <div className="flex items-center gap-3 border-b border-bg_border_element bg-bg_secondary px-5 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-main_color text-xs font-bold text-text_primary">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="font-bold text-text_primary">Design tokeny</span>
            <span className="text-text_secondary text-sm">(povinné — nikdy nepoužívej hardcoded barvy)</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { token: 'bg-bg_primary', desc: 'bílé panely, karty', color: 'bg-white border border-gray-200' },
              { token: 'bg-bg_secondary', desc: 'pozadí stránky', color: 'bg-gray-100 border border-gray-200' },
              { token: 'border-bg_border_element', desc: 'hranice', color: 'border-2 border-gray-300 bg-transparent' },
              { token: 'text-text_primary', desc: 'hlavní text', color: 'bg-gray-900' },
              { token: 'text-text_secondary', desc: 'tlumený text, popisky', color: 'bg-gray-500' },
              { token: 'bg-main_color', desc: 'zlatá brandová barva', color: 'bg-amber-300' },
            ].map((t) => (
              <div key={t.token} className="flex items-center gap-3 rounded-md border border-bg_border_element p-3">
                <div className={`h-8 w-8 flex-shrink-0 rounded-md ${t.color}`} />
                <div>
                  <code className="text-xs font-mono font-bold text-text_primary">{t.token}</code>
                  <p className="text-xs text-text_secondary">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        </div> {/* end flex-1 main content */}
      </div> {/* end flex */}
    </div>
  )
}
