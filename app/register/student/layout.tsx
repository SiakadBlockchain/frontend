export default function StudentRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <main>{children}</main>
    </div>
  );
}