import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "AutoPay Bounties",
  description: "PR merged -> automatic SOL payment on Solana"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <NavBar />
          <main className="mx-auto max-w-5xl p-4">{children}</main>
        </AppWalletProvider>
      </body>
    </html>
  );
}
