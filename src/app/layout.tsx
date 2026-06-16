import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Cup Sweepstakes 2026',
  description: 'FIFA World Cup 2026 Sweepstakes'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="sticky top-0 z-50 border-b border-green-500/15 bg-[#060f09]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="text-2xl group-hover:animate-float inline-block transition-transform group-hover:scale-110">⚽</span>
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-gradient-green">WC26</span>{' '}
                <span className="text-white/90">Sweepstakes</span>
              </span>
            </Link>
            <div className="flex gap-1 text-sm font-medium">
              {[
                { href: '/', label: 'Dashboard' },
                { href: '/standings', label: 'Standings' },
                { href: '/draw', label: 'The Draw' },
                { href: '/prizes', label: 'Prizes' }
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-green-500/10 transition-all duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>
        <footer className="text-center text-xs text-slate-600 pb-10 animate-fade-in">
          <div className="mx-auto max-w-6xl px-4 pt-6 border-t border-green-500/10">
            Data updated daily via football-data.org
          </div>
        </footer>
      </body>
    </html>
  )
}
