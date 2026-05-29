import "./globals.css";

export const metadata = {
  title: "Stereochemistry True 3D Newman Lab",
  description: "Interactive 3D conformational analysis with Newman projection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
