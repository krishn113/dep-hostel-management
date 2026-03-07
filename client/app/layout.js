import "./globals.css";
import AuthProvider from "@/context/AuthContext";

export const metadata = {
  title: "...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}