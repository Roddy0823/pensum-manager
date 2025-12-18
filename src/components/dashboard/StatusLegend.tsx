import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatusLegend() {
  const statuses = [
    { icon: Check, label: 'Aprobada', iconBg: 'bg-success/10', iconColor: 'text-success' },
    { icon: Circle, label: 'Disponible', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { icon: Lock, label: 'Bloqueada', iconBg: 'bg-muted', iconColor: 'text-muted-foreground/50' }
  ];

  return (
    <div className="flex items-center gap-4 bg-card/50 rounded-xl px-4 py-2 border">
      {statuses.map((status, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", status.iconBg)}>
            <status.icon className={cn("h-3.5 w-3.5", status.iconColor)} />
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{status.label}</span>
        </div>
      ))}
    </div>
  );
}
