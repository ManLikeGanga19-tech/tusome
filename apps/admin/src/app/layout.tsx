import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Tusome Admin",
  description: "Tusome internal administration panel",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
