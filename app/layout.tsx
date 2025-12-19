import "./globals.css";

export const metadata = {
  title: "Website",
  description: "Base Next.js project"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
