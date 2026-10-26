import type { Metadata } from "next"
import { Fraunces, Source_Sans_3 } from "next/font/google"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getSiteUrl } from "@/lib/site"
import "./globals.css"

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const description =
  "A catalog of classic Major League Baseball blunders, from Merkle's Boner to a perfect game that wasn't."

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Hall of Shame",
    template: "%s · Hall of Shame",
  },
  description,
  openGraph: {
    title: "Hall of Shame",
    description,
    type: "website",
    locale: "en_US",
    siteName: "Hall of Shame",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-cream focus:px-3 focus:py-2 focus:text-navy"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
