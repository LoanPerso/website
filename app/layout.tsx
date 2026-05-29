import "./globals.css";
import { Cormorant_Garamond, DM_Sans, Inter } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/_components/theme-provider";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Neutral UI typeface for the admin back office (Stripe/Linear/Notion feel).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://quickfund.fr"),
  title: {
    default: "Quickfund",
    template: "%s | Quickfund",
  },
  description: "Credit transparent. Reponse garantie en 24h. Decisions expliquees.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Quickfund",
    title: "Quickfund",
    description: "Credit transparent. Reponse garantie en 24h. Decisions expliquees.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Quickfund" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quickfund",
    description: "Credit transparent. Reponse garantie en 24h. Decisions expliquees.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// Applied before paint to avoid a flash of the wrong theme. Admin-only for now:
// only sets the `dark` class on /admin routes (the public site has its own
// `dark:` utilities and must stay light). Reads the stored preference or the OS.
const themeScript = `(function(){try{if(location.pathname.indexOf('/admin')!==0)return;var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children, params }: Props) {
  return (
    <html
      lang={params.locale || 'et'}
      className={`${dmSans.variable} ${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
