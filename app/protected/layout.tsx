

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen flex flex-col items-center" style={{ overscrollBehavior: 'none' }}>
      
      <div className="relative z-10 flex-1 w-full flex flex-col gap-20 items-center">
          {children}

       
      </div>
    </main>
  );
}
