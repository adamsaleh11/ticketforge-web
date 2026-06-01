import { ProtectedPageShell } from "@/components/shared/protected-page-shell";

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <ProtectedPageShell
      description={`Project ${params.id} will load through authenticated API calls in the project workflow slice.`}
      eyebrow="Project"
      title="Protected project workspace"
    />
  );
}
