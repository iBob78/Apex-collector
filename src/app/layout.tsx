import { Inter } from 'next/font/google'
import './globals.css'
import Menu from '@/components/Menu'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Apex Collector',
  description: 'Collect and analyze your data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Menu />
        <main>{children}</main>
      </body>
    </html>
  )
}
