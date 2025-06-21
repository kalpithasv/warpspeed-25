import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Toaster />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
