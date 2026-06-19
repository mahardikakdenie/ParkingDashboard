import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { ParkingProvider } from "@/lib/ParkingContext";

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
          <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {children}
              </main>
            </div>
          </div>
        </ParkingProvider>
      </body>
    </html>
  );
}

