import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConfirmProvider } from "@/components/providers/confirm-provider";
import { ThemedToaster } from "@/components/common/themed-toaster";
import { CookieBanner } from "@/components/common/cookie-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "RideCloudMoto — Carnet d'entretien moto & scooter",
    template: "%s · RideCloudMoto",
  },
  description:
    "Suivez l'entretien, l'historique et les rappels de votre moto ou scooter. Plan d'entretien constructeur, fiches techniques et notifications.",
  applicationName: "RideCloudMoto",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RideCloudMoto",
  },
  icons: {
    icon: [
      { url: "/logo16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FACC15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ConfirmProvider>
            {children}
            <CookieBanner />
            <ThemedToaster />
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
