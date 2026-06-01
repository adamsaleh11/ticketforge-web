import { ProtectedPageShell } from "@/components/shared/protected-page-shell";

export default function ProjectsPage() {
  return (
    <ProtectedPageShell
      description="Project workflows will live here after the authenticated shell is in place."
      eyebrow="Projects"
      title="Your project plans are protected."
    />
  );
}
