import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ViewTransition } from "react";

import "./global.css";
import "./global.scss";

const chillRound = localFont({
  src: "../../../public/fonts/ChillRoundM.otf",
});

export const metadata: Metadata = {
  title: "Silva Admin",
  description: "Silva admin application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <ViewTransition>
      <html lang={locale}>
        <body className={chillRound.className}>
          <NextIntlClientProvider>
            <main>{children}</main>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransition>
  );
}
