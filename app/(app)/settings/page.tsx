import { ProtectedPageShell } from "@/components/shared/protected-page-shell";

export default function SettingsPage() {
  return (
    <ProtectedPageShell
      description="Account and provider settings will use this protected surface as the product grows."
      eyebrow="Settings"
      title="Manage your TicketForge account."
    />
  );
}
