import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-white p-4">
      <div className="text-center p-8 md:p-12 border-cartoon shadow-[8px_8px_0_0_#000] rounded-3xl max-w-md mx-auto relative overflow-hidden">
        {/* Striped overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 12px)"
          }}
        />
        
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-display text-primary mb-4 drop-shadow-[2px_2px_0_#000]">
            404
          </h1>
          <h2 className="text-2xl font-display uppercase mb-4 text-black">
            Level Not Found
          </h2>
          <p className="font-sans font-bold text-gray-600 mb-8">
            The grid coordinate you're looking for doesn't exist in this sector.
          </p>
          <Link href="/" className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-display text-lg font-semibold uppercase bg-white text-black border-cartoon shadow-cartoon shadow-cartoon-hover shadow-cartoon-active transition-all active:translate-y-1 active:translate-x-1 active:shadow-none hover:bg-gray-50">
            Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}
