import "./globals.css";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

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

export const metadata = {
  title: "Quickfund",
  description: "Premium financing for your projects",
};

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function RootLayout({ children, params }: Props) {
  return (
    <html lang={params.locale || 'et'} className={`${dmSans.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
