import "./globals.css";
import AuthProvider from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Hostel Management Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}