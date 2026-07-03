import { BookOpen, CheckCircle, FolderArchive, MessageSquare, Monitor, Plus, RefreshCw, Sparkles, Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const title = 'Úvod & Instrukce'
export const icon = BookOpen

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4">
      <h2 className="text-xl font-bold text-text_primary">{title}</h2>
      {children}
    </section>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-main_color text-sm font-bold text-text_primary">
        {n}
      </div>
      <div className="space-y-1 pt-0.5">
        <p className="font-semibold text-text_primary">{title}</p>
        <div className="text-sm text-text_secondary">{children}</div>
      </div>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-bg_border_element bg-bg_secondary px-4 py-3 font-mono text-sm text-text_primary">
      {children}
    </pre>
  )
}

function InfoBox({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-main_color/30 bg-main_color/5 p-4">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-main_color" />
      <div className="space-y-1">
        <p className="font-semibold text-text_primary">{title}</p>
        <div className="text-sm text-text_secondary">{children}</div>
      </div>
    </div>
  )
}

export default function UvodInstrukce() {
  return (
    <div className="min-h-screen bg-bg_secondary">
      <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-text_secondary" />
        <span className="text-text_secondary text-sm">Dokumentace</span>
        <span className="text-text_secondary mx-1">–</span>
        <h1 className="text-xl font-bold text-text_primary">Úvod & Instrukce</h1>
      </div>

      <div className="px-8 py-8 max-w-3xl space-y-10">

        {/* Co je UI Kit */}
        <Section title="Co je Hardmin UI Kit?">
          <p className="text-sm text-text_secondary leading-relaxed">
            <strong className="text-text_primary">Hardmin UI Kit</strong> je samostatná React aplikace pro rychlé prototypování UI stránek
            HardminCloudu. Funguje bez backendu, bez Dockeru, bez PHP — stačí Node.js a prohlížeč.
          </p>
          <p className="text-sm text-text_secondary leading-relaxed">
            Slouží k vizualizaci nových obrazovek pomocí reálných HC komponent a designových tokenů.
            Stránky vytvářené v UI Kitu je pak možné předat vývojovému týmu jako referenci nebo přímo produkcionalizovat.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { icon: Monitor, label: 'Žádný backend', desc: 'Pouze Node.js + prohlížeč' },
              { icon: Sparkles, label: 'AI-first', desc: 'Stránky tvoří Claude' },
              { icon: RefreshCw, label: 'Živé preview', desc: 'Vite HMR, žádný restart' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-bg_border_element bg-bg_primary p-4 text-center">
                <item.icon className="mx-auto mb-2 h-6 w-6 text-main_color" />
                <p className="font-semibold text-text_primary text-sm">{item.label}</p>
                <p className="text-xs text-text_secondary mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Separator />

        {/* Spuštění */}
        <Section id="spusteni" title="Spuštění projektu">
          <div className="space-y-3">
            <Step n={1} title="Nainstalujte závislosti">
              <CodeBlock>npm install</CodeBlock>
            </Step>
            <Step n={2} title="Spusťte vývojový server">
              <CodeBlock>npm run dev</CodeBlock>
              <p className="mt-1">Aplikace bude dostupná na <strong className="text-text_primary font-mono">http://localhost:5200</strong></p>
            </Step>
            <Step n={3} title="TypeScript kontrola (volitelné)">
              <CodeBlock>npm run types</CodeBlock>
            </Step>
          </div>
          <InfoBox icon={CheckCircle} title="Žádný restart není potřeba">
            Vite automaticky detekuje nové soubory a aktualizuje prohlížeč. Po přidání nové stránky
            se ihned zobrazí v postranním panelu.
          </InfoBox>
        </Section>

        <Separator />

        {/* Workflow */}
        <Section id="workflow" title="Jak vytvořit novou stránku">
          <div className="space-y-3">
            <Step n={1} title="Otevřete VS Code v projektu hardmin-ui-kit">
              Ujistěte se, že pracujete ve složce <code className="rounded bg-bg_secondary px-1.5 py-0.5 font-mono text-xs">hardmin-ui-kit</code>, ne v HardminCloudu.
            </Step>
            <Step n={2} title="Pořiďte screenshot reference">
              Screenshot z reálné HC aplikace, Figmy nebo jiného zdroje. Čím přesnější reference, tím lepší výsledek.
            </Step>
            <Step n={3} title="Napište Claudovi do VS Code chatu">
              Popište co chcete přidat a přiložte screenshot. Příklady:
              <div className="mt-2 space-y-2">
                {[
                  'Přidej stránku "Seznam uživatelů" do sekce administrace',
                  'Vytvoř novou sekci "Fakturace" s přehledovou stránkou',
                  'Přidej detail zařízení jako modální okno na stránce devices',
                ].map((ex) => (
                  <div key={ex} className="flex items-start gap-2 rounded-md border border-bg_border_element bg-bg_primary px-3 py-2">
                    <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-main_color" />
                    <span className="text-sm text-text_primary italic">"{ex}"</span>
                  </div>
                ))}
              </div>
            </Step>
            <Step n={4} title="Claude vytvoří soubor automaticky">
              Stránka se okamžitě zobrazí v postranním panelu na <strong className="text-text_primary font-mono">localhost:5200</strong>.
              Není třeba nic restartovat.
            </Step>
          </div>
        </Section>

        <Separator />

        {/* Jak opravit výsledek */}
        <Section id="opravy" title="Jak opravit výsledek & referovat na komponenty">
          <p className="text-sm text-text_secondary leading-relaxed">
            Pokud Claude negeneroval přesně to, co jste chtěli, můžete výsledek upřesnit.
            Nejefektivnější způsob je <strong className="text-text_primary">referovat na komponent číslem nebo názvem</strong> ze stránky
            <em> Katalog komponent</em>.
          </p>
          <div className="space-y-2">
            {[
              { label: 'Podle čísla', ex: 'Místo tlačítka "Uložit" použij komponent #1 s variantou main' },
              { label: 'Podle názvu', ex: 'Stav uživatele zobraz pomocí Badge s variantou success' },
              { label: 'Oprava konkrétního místa', ex: 'V řádku tabulky změň ikonové tlačítko smazat na Button size="icon" variant="ghost" s červenou ikonou' },
              { label: 'Doplnění části', ex: 'Nad tabulkou přidej filtr pomocí Select — viz komponent #6' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-bg_border_element bg-bg_primary p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-text_secondary mb-1">{item.label}</p>
                <p className="text-sm text-text_primary italic">"{item.ex}"</p>
              </div>
            ))}
          </div>
        </Section>

        <Separator />

        {/* CLI */}
        <Section id="cli" title="Alternativa: Claude Code CLI">
          <p className="text-sm text-text_secondary leading-relaxed">
            Místo VS Code chatu lze použít terminál s Claude Code CLI. V terminálu fungují slash příkazy:
          </p>
          <div className="space-y-2">
            {[
              { cmd: '/build-page', desc: 'Přidat novou stránku do existující sekce' },
              { cmd: '/create-project', desc: 'Vytvořit novou sekci v postranním panelu' },
              { cmd: '/sync-components', desc: 'Synchronizovat komponenty z HardminCloudu' },
            ].map((item) => (
              <div key={item.cmd} className="flex items-center gap-3 rounded-md border border-bg_border_element bg-bg_primary px-4 py-2.5">
                <Terminal className="h-4 w-4 flex-shrink-0 text-main_color" />
                <code className="font-mono text-sm font-bold text-text_primary w-40">{item.cmd}</code>
                <span className="text-sm text-text_secondary">{item.desc}</span>
              </div>
            ))}
          </div>
          <InfoBox icon={Terminal} title="VS Code vs CLI">
            Ve VS Code chatu slash příkazy nefungují — pište popisy přirozeným jazykem.
            V terminálu (<code className="font-mono text-xs">claude</code> příkaz) slash příkazy fungují plně.
          </InfoBox>
        </Section>

        <Separator />

        {/* Struktura */}
        <Section id="struktura" title="Struktura projektu">
          <CodeBlock>{`pages/
  {sekce}/
    _section.ts      ← název, ikona, skupina v sidebaru
    index.tsx        ← první stránka (zobrazí se jako "Přehled")
    seznam.tsx       ← viditelná stránka v sidebaru
    detail.tsx       ← skrytá stránka: export const hidden = true
    _data.ts         ← sdílená mock data (nezobrazí se v sidebaru)

components/
  ui/                ← shadcn komponenty (nesynchronizovat ručně)
  other/             ← HC specifické komponenty
  table/             ← UnifiedTable, RowActionsMenu`}</CodeBlock>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Skupiny v sidebaru', value: 'MODULY · ADMINISTRACE · nebo vlastní text' },
              { label: 'Skrytá stránka', value: 'export const hidden = true' },
              { label: 'Navigace na detail', value: 'navigate(`/sekce/detail?id=${row.id}`)' },
              { label: 'Design tokeny', value: 'bg-bg_primary · text-main_color · border-bg_border_element' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-bg_border_element bg-bg_primary p-3">
                <p className="text-xs font-bold text-text_secondary uppercase tracking-wider mb-1">{item.label}</p>
                <code className="text-xs font-mono text-text_primary">{item.value}</code>
              </div>
            ))}
          </div>
          <InfoBox icon={FolderArchive} title="Předání stránek">
            Kromě <code className="rounded bg-bg_secondary px-1.5 py-0.5 font-mono text-xs">pages/dokumentace</code> jsou
            všechny složky v <code className="rounded bg-bg_secondary px-1.5 py-0.5 font-mono text-xs">pages/</code> v
            .gitignore. Pro předání stránek stačí složku zazipovat a u druhého uživatele ji vložit do jeho{' '}
            <code className="rounded bg-bg_secondary px-1.5 py-0.5 font-mono text-xs">pages/</code>.
          </InfoBox>
        </Section>

        <Separator />

        {/* Dostupné knihovny */}
        <Section id="knihovny" title="Dostupné knihovny">
          <p className="text-sm text-text_secondary leading-relaxed">
            Tyto knihovny jsou předinstalované. Neinstaluj nic navíc.
          </p>
          <div className="rounded-lg border border-bg_border_element bg-bg_primary divide-y divide-bg_border_element">
            {[
              { name: 'recharts', desc: 'Grafy a vizualizace dat — BarChart, LineChart, AreaChart, PieChart' },
              { name: 'lucide-react', desc: 'Ikony — 6 000+ ikon, např. Trash2, Plus, Search, ChevronDown' },
              { name: 'shadcn/ui + Radix UI', desc: 'UI komponenty — Button, Dialog, Select, Tabs, Tooltip a další (viz Katalog komponent)' },
              { name: '@tanstack/react-table', desc: 'Tabulky — použij přes UnifiedTable, nevolej přímo' },
              { name: 'react-router-dom', desc: 'Navigace — useNavigate, useSearchParams, Link' },
              { name: 'date-fns', desc: 'Práce s daty — formátování a parsování, používá DatePicker interně' },
              { name: 'tailwindcss', desc: 'CSS utility třídy a design tokeny (bg-bg_primary, text-main_color…)' },
            ].map((lib) => (
              <div key={lib.name} className="flex items-baseline gap-3 px-4 py-3">
                <code className="w-52 flex-shrink-0 text-xs font-mono font-bold text-text_primary">{lib.name}</code>
                <span className="text-sm text-text_secondary">{lib.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Quick nav */}
        <div className="rounded-lg border border-main_color/30 bg-main_color/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-main_color" />
            <p className="font-semibold text-text_primary">Katalog komponent</p>
          </div>
          <p className="text-sm text-text_secondary">
            Všechny dostupné komponenty s živými příklady a variantami najdete na stránce{' '}
            <strong className="text-text_primary">Katalog komponent</strong> v tomto menu.
            Každý komponent má číslo pro snadnou referenci.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Button #1', 'Badge #2', 'Input #3', 'Select #6', 'Tabs #11', 'Dialog #12', 'UnifiedTable #15'].map((c) => (
              <Badge key={c} variant="outline" className="font-mono text-xs">{c}</Badge>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
