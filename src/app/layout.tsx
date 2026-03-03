import "./globals.css";

export const metadata = {
  title: "Quiz App",
  description: "Teste de Nível Básico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}