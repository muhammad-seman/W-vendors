import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/app/_components/ui/card';
import { Badge } from '@/app/_components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Pengguna" value="11.8M" change="+2.5%" />
        <StatCard title="Pengguna Baru" value="8.236K" change="-1.2%" isNegative />
        <StatCard title="Pengguna Aktif" value="2.352M" change="+11%" />
        <StatCard title="Pendaftaran Baru" value="8K" change="+5.2%" />
      </div>

      {/* Middle 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-card-foreground">Target</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/80" />Tercapai</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted/30" />Sisa</div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6 h-[250px]">
            {/* Simple CSS ring as placeholder for Recharts RadialBar */}
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[16px] border-muted/30 border-l-slate-500 border-t-slate-500 transform rotate-45">
              <span className="text-3xl font-bold text-card-foreground -rotate-45">67%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-card-foreground">Tipe Akun Teraktif</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/80" />Sangat Aktif</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted/30" />Tidak Aktif</div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6 h-[250px]">
             {/* Simple CSS pie as placeholder for Recharts PieChart */}
             <div className="relative h-40 w-40 rounded-full bg-muted/30 overflow-hidden" style={{ background: 'conic-gradient(#64748b 0% 45%, #94a3b8 45% 60%, #cbd5e1 60% 85%, #e2e8f0 85% 100%)'}}>
               <div className="absolute inset-0 border-[4px] border-white rounded-full"></div>
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-card-foreground">Negara Aktif</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/80" />Sangat Aktif</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted/30" />Tidak Aktif</div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6 h-[250px]">
            <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center text-muted-foreground/60 text-sm">
              [World Map SVG Area]
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-card-foreground">Pengguna per Negara</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <CountryRow flag="🇺🇸" name="Amerika Serikat" percent="27.5%" value="4.5M" />
              <CountryRow flag="🇦🇺" name="Australia" percent="11.2%" value="2.3M" />
              <CountryRow flag="🇨🇳" name="Tiongkok" percent="9.4%" value="2M" />
              <CountryRow flag="🇩🇪" name="Jerman" percent="8%" value="1.7M" />
              <CountryRow flag="🇷🇴" name="Rumania" percent="7.9%" value="1.6M" />
              <CountryRow flag="🇯🇵" name="Jepang" percent="6.1%" value="1.2M" />
              <CountryRow flag="🇳🇱" name="Belanda" percent="5.9%" value="1M" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-card-foreground">5 Pengguna Terlaris</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-8">
            <div className="relative h-40 w-40 rounded-full border-[24px] border-muted/50 border-t-slate-500 border-r-slate-400 flex-shrink-0">
               {/* CSS Donut Chart */}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <UserRow name="Nama Pengguna" value="$1.2M" change="+8.2%" />
              <UserRow name="Nama Pengguna" value="$800K" change="+7%" />
              <UserRow name="Nama Pengguna" value="$645K" change="+2.5%" />
              <UserRow name="Nama Pengguna" value="$590K" change="-6.5%" isNegative />
              <UserRow name="Nama Pengguna" value="$342K" change="+1.7%" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isNegative }: { title: string, value: string, change: string, isNegative?: boolean }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <Badge variant="secondary" className={`text-xs ${isNegative ? 'bg-muted-foreground/80 text-white' : 'bg-muted/20 text-muted-foreground'}`}>
          {change}
        </Badge>
      </CardContent>
    </Card>
  );
}

function CountryRow({ flag, name, percent, value }: { flag: string, name: string, percent: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3 w-1/2">
        <span>{flag}</span>
        <span className="text-muted-foreground">{name}</span>
      </div>
      <div className="text-right text-muted-foreground w-1/4">{percent}</div>
      <div className="text-right text-muted-foreground w-1/4">{value}</div>
    </div>
  );
}

function UserRow({ name, value, change, isNegative }: { name: string, value: string, change: string, isNegative?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted/50"></div>
        <span className="text-muted-foreground">{name}</span>
      </div>
      <div className="text-muted-foreground">{value}</div>
      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 min-w-10 justify-center flex ${isNegative ? 'bg-muted-foreground/80 text-white' : 'bg-muted/20 text-muted-foreground'}`}>
        {change}
      </Badge>
    </div>
  );
}
