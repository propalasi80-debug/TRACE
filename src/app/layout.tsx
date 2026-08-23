import type { Metadata, Viewport } from "next";
// Fonts are self-hosted rather than fetched from Google at build time:
// no external requests at runtime, and the build works offline.
import "@fontsource-variable/inter";
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/chakra-petch/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trace — Your gaming life. One identity.",
  description:
    "Trace reads every account you own and turns years of playing into one rating, one library and one profile that finally belongs to you.",
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
