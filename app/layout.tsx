import { Toaster } from "sonner";
import "./globals.css";
import { Inter } from "next/font/google";
import { NextUIProvider } from "@nextui-org/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RAG AI",
  description: "RAG AI chatbot for CNB",
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
          {children}
          <Toaster richColors position="top-right" />
        </NextUIProvider>
      </body>
    </html>
  );
}
