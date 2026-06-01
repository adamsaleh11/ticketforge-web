"use client";

import { useState } from "react";
import { OllamaSetupWizard } from "@/components/features/settings/ollama-setup-wizard";
import { Button } from "@/components/ui/button";

export default function OllamaQaPage() {
  const [isOpen, setOpen] = useState(true);

  return (
    <main className="min-h-screen p-6">
      <Button onClick={() => setOpen(true)} type="button">
        Open wizard
      </Button>
      <OllamaSetupWizard context="new-project" onOpenChange={setOpen} open={isOpen} />
    </main>
  );
}
