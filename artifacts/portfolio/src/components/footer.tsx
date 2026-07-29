export function Footer() {
  return (
    <footer className="border-t-[3px] border-black bg-white py-8 relative z-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display font-bold text-xl uppercase tracking-wider">
          Martin Dominic Luspo <span className="text-primary">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
