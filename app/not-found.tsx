import Link from "next/link";

import { Button } from "@/_components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Page introuvable
      </h1>
      <Button asChild variant="outline">
        <Link href="/">Retour a l'accueil</Link>
      </Button>
    </div>
  );
}
