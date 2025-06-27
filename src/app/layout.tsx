import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

// app/layout.tsx

// import { Inter } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import Footer from "~/components/footer";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

export const metadata: Metadata = {
  title: "Car Listings",
  description: "View scraped car listings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      {/* <body className={`font-sans ${inter.variable}`}> */}
      <body className={`font-sans ${GeistSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <TRPCReactProvider>
            <main className="flex min-h-screen flex-col">{children}</main>
            <Footer />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
