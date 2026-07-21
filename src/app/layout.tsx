import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ParkingProvider } from "@/lib/ParkingContext";
import { DashboardShell } from "@/components/DashboardShell";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "NexGate | Enterprise Parking Management & Smart Mobility SaaS",
    template: "%s | NexGate Enterprise SaaS",
  },
  description:
    "Platform SaaS Manajemen Parkir Real-Time Enterprise dengan Integrasi Gate In/Out, Pemindaian AI OCR Plat Nomor, Pembayaran Multi-Channel, & Analytics.",
  keywords: [
    "Parking SaaS",
    "Smart Parking System",
    "Manajemen Parkir Enterprise",
    "AI OCR Gate Scanner",
    "NexGate Subsystem",
    "Parking Dashboard Realtime",
  ],
  authors: [{ name: "NexGate Engineering Team" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "NexGate | Enterprise Parking Management SaaS",
    description:
      "Kelola operasional gate, transaksi, dan pemantauan parkir secara real-time dengan teknologi AI OCR presisi tinggi.",
    siteName: "NexGate SaaS Platform",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexGate | Smart Parking Management SaaS",
    description: "Sistem Manajemen Parkir Enterprise Modern dengan AI OCR & Realtime Gate Monitoring.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#0F172A] text-slate-200 antialiased selection:bg-indigo-500 selection:text-white`}>
        <ParkingProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
        </ParkingProvider>
      </body>
    </html>
  );
}
