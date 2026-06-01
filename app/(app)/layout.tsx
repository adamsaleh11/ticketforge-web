import { AppNav } from "@/components/shared/app-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative z-10 min-h-screen">
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
