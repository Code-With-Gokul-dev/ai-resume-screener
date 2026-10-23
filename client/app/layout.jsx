import Header from "@/components/Header";
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Resume Screener",
  description: "Rank resumes against a job description with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
