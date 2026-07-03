import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'

export const title = 'Barvy'
export const hidden = true

// Tokens that map to HC CSS vars (Tailwind classes)
const brandTokens = [
  {
    label: 'Zlatá',
    tailwind: 'bg-main_color',
    cssVar: '--main-color',
    lightHex: '#D1B97A',
    darkHex: '#896C24',
    role: 'Aktiv, brand, navigace',
  },
  {
    label: 'Zlatá – tón',
    tailwind: 'bg-main_color_secondary',
    cssVar: '--main-color-secondary',
    lightHex: '#F0E3B8',
    darkHex: '#3E392D',
    role: 'Světlý tón zlaté, hover pozadí',
  },
  {
    label: 'Zlatá – ink',
    tailwind: 'bg-text_dark_main_color',
    cssVar: '--text-dark-main-color',
    lightHex: '#896C24',
    darkHex: '#D1B97A',
    role: 'Tmavá zlatá text na světlém pozadí',
  },
]

// Semantic colors from designer spec (CSS custom props, no Tailwind alias)
const semanticTokens = [
  {
    label: 'Zelená',
    cssVar: '--color-green',
    lightHex: '#2E9E59',
    darkHex: '#23874A',
    role: 'Úspěch, aktivní stav',
  },
  {
    label: 'Červená',
    cssVar: '--color-red',
    lightHex: '#DC4B46',
    darkHex: '#C93C37',
    role: 'Chyba, nebezpečí',
  },
  {
    label: 'Modrá',
    cssVar: '--color-blue',
    lightHex: '#3B82C4',
    darkHex: '#2E6CAC',
    role: 'Info, odkaz',
  },
  {
    label: 'Fialová',
    cssVar: '--color-purple',
    lightHex: '#7C5CBE',
    darkHex: '#6446AB',
    role: 'Speciální akce',
  },
  {
    label: 'Oranžová',
    cssVar: '--color-orange',
    lightHex: '#E8833A',
    darkHex: '#D4742B',
    role: 'Varování',
  },
]

const surfaceTokens = [
  {
    label: 'Stránka',
    tailwind: 'bg-bg_primary',
    cssVar: '--bg-primary',
    lightHex: '#FFFFFF',
    darkHex: '#0F0F0F',
    role: 'Pozadí stránky',
  },
  {
    label: 'Panel',
    tailwind: 'bg-bg_secondary',
    cssVar: '--bg-secondary',
    lightHex: '#F7F7F7',
    darkHex: '#171717',
    role: 'Panel, postranní lišta',
  },
  {
    label: 'Ohraničení',
    tailwind: 'bg-bg_border_element',
    cssVar: '--bg-border-element',
    lightHex: '#D9D9D9',
    darkHex: '#383838',
    role: 'Ohraničení prvků',
  },
]

const textTokens = [
  {
    label: 'Primární',
    tailwind: 'bg-text_primary',
    cssVar: '--text-primary',
    lightHex: '#000000',
    darkHex: '#FFFFFF',
    role: 'Hlavní text',
  },
  {
    label: 'Sekundární',
    tailwind: 'bg-text_secondary',
    cssVar: '--text-secondary',
    lightHex: '#595959',
    darkHex: '#C7C7C7',
    role: 'Méně důležitý text',
  },
  {
    label: 'Chybový',
    tailwind: 'bg-text_alert',
    cssVar: '--text-alert',
    lightHex: '#AC0000',
    darkHex: '#C47070',
    role: 'Chybové hlášky',
  },
]

// Commodity layer colors from designer spec
const commodityTokens = [
  {
    label: 'Elektřina',
    cssVar: '--color-red-tint',
    solidCssVar: '--color-red',
    role: 'Elektřina (EL)',
  },
  {
    label: 'Voda',
    cssVar: '--color-blue-tint',
    solidCssVar: '--color-blue',
    role: 'Voda (WA)',
  },
  {
    label: 'Plyn',
    cssVar: '--color-purple-tint',
    solidCssVar: '--color-purple',
    role: 'Plyn (GA)',
  },
  {
    label: 'Teplo',
    cssVar: '--color-orange-tint',
    solidCssVar: '--color-orange',
    role: 'Teplo (HE)',
  },
  {
    label: 'ESG',
    cssVar: '--color-green-tint',
    solidCssVar: '--color-green',
    role: 'ESG metriky',
  },
  {
    label: 'Přehled',
    cssVar: '--color-gold-tint',
    solidCssVar: '--main-color',
    role: 'Přehled / Zlatá',
  },
]

type SimpleToken = {
  label: string
  tailwind?: string
  cssVar: string
  lightHex: string
  darkHex: string
  role: string
}

function ColorSwatch({ token, isDark }: { token: SimpleToken; isDark: boolean }) {
  const hex = isDark ? token.darkHex : token.lightHex
  return (
    <div className="flex min-w-[130px] flex-col gap-2">
      <div
        className={cn(
          'h-16 w-full rounded-lg border border-bg_border_element',
          token.tailwind,
        )}
        style={token.tailwind ? undefined : { backgroundColor: hex }}
      />
      <div className="space-y-0.5">
        <div className="text-sm font-medium text-text_primary">{token.label}</div>
        {token.tailwind && (
          <div className="font-mono text-xs text-text_secondary">{token.tailwind}</div>
        )}
        <div className="font-mono text-xs text-text_secondary">{token.cssVar}</div>
        <div className="font-mono text-xs text-text_secondary">{hex}</div>
        <div className="text-xs text-text_secondary">{token.role}</div>
      </div>
    </div>
  )
}

function CommoditySwatch({ token }: { token: (typeof commodityTokens)[0] }) {
  return (
    <div className="flex min-w-[120px] flex-col gap-2">
      <div
        className="relative h-16 w-full overflow-hidden rounded-lg border border-bg_border_element"
        style={{ backgroundColor: `var(${token.cssVar})` }}
      >
        <div
          className="absolute left-2 top-2 h-3 w-3 rounded-full"
          style={{ backgroundColor: `var(${token.solidCssVar})` }}
        />
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-medium text-text_primary">{token.label}</div>
        <div className="font-mono text-xs text-text_secondary">{token.cssVar}</div>
        <div className="text-xs text-text_secondary">{token.role}</div>
      </div>
    </div>
  )
}

function ColorSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text_primary">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-text_secondary">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-6">{children}</div>
    </div>
  )
}

export default function BarevnePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-10 p-8">
      <div>
        <h1 className="text-xl font-bold text-text_primary">Design tokeny – barvy</h1>
        <p className="mt-1 text-sm text-text_secondary">
          Přehled barevných tokenů z HC projektu. Tokeny se automaticky mění při přepnutí světlého /
          tmavého režimu.
        </p>
      </div>

      <ColorSection
        title="Zlatá – brandová barva"
        description="Primární barva projektu. Používá se pro aktivní prvky, navigaci a brand identitu."
      >
        {brandTokens.map((t) => (
          <ColorSwatch key={t.cssVar} token={t} isDark={isDark} />
        ))}
      </ColorSection>

      <ColorSection
        title="Sémantické barvy"
        description="Barevná paleta pro stavy a akce. Dostupné přes CSS proměnné var(--color-*)."
      >
        {semanticTokens.map((t) => (
          <ColorSwatch key={t.cssVar} token={t} isDark={isDark} />
        ))}
      </ColorSection>

      <ColorSection
        title="Plochy (Surfaces)"
        description="Pozadí stránek, panelů a ohraničení. Základní vrstva pro rozvržení."
      >
        {surfaceTokens.map((t) => (
          <ColorSwatch key={t.cssVar} token={t} isDark={isDark} />
        ))}
      </ColorSection>

      <ColorSection title="Text" description="Barvy textu pro různé úrovně důležitosti.">
        {textTokens.map((t) => (
          <ColorSwatch key={t.cssVar} token={t} isDark={isDark} />
        ))}
      </ColorSection>

      <ColorSection
        title="Komodity"
        description="Barevné odlišení typů komodit v EMS modulu. Tón je pozadí, puntík je plná barva."
      >
        {commodityTokens.map((t) => (
          <CommoditySwatch key={t.cssVar} token={t} />
        ))}
      </ColorSection>
    </div>
  )
}
