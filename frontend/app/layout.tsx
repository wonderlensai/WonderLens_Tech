import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WonderLens AI',
  description: 'Industrial vision intelligence built around your operational problems.',
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
