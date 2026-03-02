export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-card px-8 py-3 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
      <span>
        © {year}{' '}
        <span className="font-semibold text-foreground">
          With<span className="text-indigo-500">Vendor</span>
        </span>
        {' '}— Platform Vendor Wedding & Event Multi-Tenant
      </span>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</a>
        <span className="text-border">|</span>
        <a href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</a>
        <span className="text-border">|</span>
        <a href="#" className="hover:text-foreground transition-colors">Bantuan</a>
      </div>
    </footer>
  );
}
