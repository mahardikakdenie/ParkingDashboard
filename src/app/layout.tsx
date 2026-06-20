import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ParkingProvider } from "@/lib/ParkingContext";
import { DashboardShell } from "@/components/DashboardShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Parking SaaS Subsystem",
  description: "Real-time parking management dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParkingProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
        </ParkingProvider>
      </body>
    </html>
  );
}

