import { ProtectedPageShell } from "@/components/shared/protected-page-shell";
import { SettingsClient } from "@/components/features/settings/settings-client";

export default function SettingsPage() {
  return (
    <ProtectedPageShell
      description="Manage your profile, GitHub connection, local Ollama endpoint, and account controls."
      eyebrow="Settings"
      title="Manage your TicketForge account"
    >
      <SettingsClient />
    </ProtectedPageShell>
  );
}
