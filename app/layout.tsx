import { Toaster } from "sonner";
import "./globals.css";
import { Inter } from "next/font/google";
import { NextUIProvider } from "@nextui-org/react";
import PlaygroundSettingsProvider from "@/context/playground-settings-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NarcoNet AI",
  description: "NarcoNet AI Chatbot for CNB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextUIProvider>
          <PlaygroundSettingsProvider>{children}</PlaygroundSettingsProvider>
          <Toaster richColors position="bottom-left" />
        </NextUIProvider>
      </body>
    </html>
  );
}
