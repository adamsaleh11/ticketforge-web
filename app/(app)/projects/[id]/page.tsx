import { ProjectDetailClient } from "@/components/features/projects/project-detail-client";

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  return <ProjectDetailClient projectId={params.id} />;
}
