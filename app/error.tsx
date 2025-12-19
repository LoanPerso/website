"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="page">
      <h1>Une erreur est survenue</h1>
      <p>{error.message}</p>
      <button className="button primary" onClick={() => reset()}>
        Reessayer
      </button>
    </div>
  );
}
