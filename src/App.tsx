import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { LanguageProvider } from './contexts/language-context'
import { ThemeProvider } from './contexts/theme-context'
import { buildSections } from './use-pages'

const sections = buildSections()
const firstPage = sections[0]?.pages[0]

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <HashRouter>
      <AppLayout sections={sections}>
        <Routes>
          {sections.flatMap((section) =>
            section.pages.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={<page.component />}
              />
            )),
          )}
          {firstPage ? (
            <Route path="/" element={<Navigate to={firstPage.path} replace />} />
          ) : (
            <Route
              path="/"
              element={
                <div className="p-8 text-text_secondary">
                  Zatím žádné stránky. Přidej soubor do <code>pages/</code>.
                </div>
              }
            />
          )}
          <Route
            path="*"
            element={
              <div className="p-8 text-text_secondary">Stránka nenalezena.</div>
            }
          />
        </Routes>
      </AppLayout>
    </HashRouter>
    </LanguageProvider>
    </ThemeProvider>
  )
}
