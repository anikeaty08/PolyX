import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "PolyX – Gasless Social on Polygon",
  description: "Post, like, retweet, and quote with sponsored gas on Polygon Amoy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


