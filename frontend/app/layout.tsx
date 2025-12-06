import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "../components/Providers";
import { Navigation } from "../components/Navigation";

export const metadata = {
  title: "PolyX – Gasless Social on Polygon",
  description: "Post, like, retweet, and quote with sponsored gas on Polygon Amoy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navigation />
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}




