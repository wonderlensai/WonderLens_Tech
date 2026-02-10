import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WonderLens Lab',
  description: 'Frontier research on systems for reliable machine vision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-brand-dark text-brand-text font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
