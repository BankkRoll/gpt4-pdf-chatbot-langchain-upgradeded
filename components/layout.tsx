interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-800 text-gray-950 antialiased px-4 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 w-full sm:w-1/2 min-w-min max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-lightBlue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <main className="mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
