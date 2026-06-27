import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Burger Hut Admin Console",
  description: "Authorized Access Store Management Console",
  manifest: "/admin-manifest.json",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
