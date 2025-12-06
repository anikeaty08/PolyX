import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "../components/Providers";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "PolyX – Gasless Social on Polygon",
  description: "Post, like, retweet, and quote with sponsored gas on Polygon Amoy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <Providers>
          <Sidebar />
          <main className="md:ml-72 min-h-screen">
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}




