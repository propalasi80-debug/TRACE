import type { Metadata, Viewport } from "next";
// Self-hosted: no external font requests at runtime, and builds work offline.
// Saira carries a width axis, which lets display type sit closer to the
// proportions of the TRACE wordmark.
import "@fontsource-variable/inter";
import "@fontsource-variable/saira/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://trace-pearl-six.vercel.app"),
  title: {
    default: "TRACE",
    template: "%s · TRACE",
  },
  description:
    "TRACE reads every gaming account you own and turns years of playing into one rating, one library and one profile.",
  openGraph: {
    title: "TRACE",
    description: "Your gaming life. One identity.",
    siteName: "TRACE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050609",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
