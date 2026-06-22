import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Parking Demo – Udin Park",
  description: "Simulasi interaktif parkir 3D dengan kontrol keyboard untuk Daihatsu Ayla B 8789 DI.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  // Fullscreen layout is handled by DashboardShell in the root layout
  // which detects /demo route and removes sidebar/topnav
  return <>{children}</>;
}
