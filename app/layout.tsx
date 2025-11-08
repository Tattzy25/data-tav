import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Brigit AI - The Next Era of Data Generation",
  description: "The world’s first truly limitless, hyper-connected data engine. Generate, transform, and deliver data exactly how you want, when you want, wherever you want.",
  generator: "brigit.ai",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased m-0`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
