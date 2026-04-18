import "./globals.css";

export default function RootLayout({ children }: any) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
