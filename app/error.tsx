"use client";

import { Button } from "@/_components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Une erreur est survenue
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()}>Reessayer</Button>
    </div>
  );
}
