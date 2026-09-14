import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ServiceWorkerRegistration from "@/components/ui/ServiceWorkerRegistration";
import { AuthProvider } from "@/hooks/useAuth";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0D766E",
};

export const metadata: Metadata = {
  title: {
    template: "%s | DeepSee",
    default: "DeepSee | Local Clinical Decision Support",
  },
  description:
    "On-premise clinical decision support for explainable, human-in-the-loop diagnostic review.",
  keywords: [
    "clinical decision support",
    "local medical AI",
    "X-ray analysis",
    "differential diagnosis",
    "medical imaging",
  ],
  authors: [{ name: "DeepSee Team" }],
  category: "Healthcare",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f5f8f7] text-[#18323a]">
        <ServiceWorkerRegistration />
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
