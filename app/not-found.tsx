import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <Link className="button ghost" href="/">
        Retour a l'accueil
      </Link>
    </div>
  );
}
