import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SocketProvider } from "@/components/SocketProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillSwap - Exchange Skills, Build Connections",
  description: "Connect with others to exchange skills and learn together. Join our community of skill swappers.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <SocketProvider>
            {children}
            <Toaster />
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
