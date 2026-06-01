import { ProtectedPageShell } from "@/components/shared/protected-page-shell";
import { SettingsClient } from "@/components/features/settings/settings-client";

export default function SettingsPage() {
  return (
    <ProtectedPageShell
      description="Configure provider settings for cloud and local model generation."
      eyebrow="Settings"
      title="Manage your TicketForge account."
    >
      <SettingsClient />
    </ProtectedPageShell>
  );
}
