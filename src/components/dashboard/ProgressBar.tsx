import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  approvedCredits: number;
  totalCredits: number;
  percentage: number;
}

export default function ProgressBar({ approvedCredits, totalCredits, percentage }: ProgressBarProps) {
  const getProgressMessage = () => {
    if (percentage === 0) return '¡Comienza tu aventura académica!';
    if (percentage < 25) return '¡Buen comienzo!';
    if (percentage < 50) return '¡Vas por buen camino!';
    if (percentage < 75) return '¡Más de la mitad! Sigue así';
    if (percentage < 100) return '¡Ya casi lo logras!';
    return '¡Felicitaciones! Has completado tu carrera 🎉';
  };

  return (
    <div className="bg-card rounded-2xl border p-6 shadow-soft">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left side - Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Progreso Académico</h2>
              <p className="text-sm text-muted-foreground">{getProgressMessage()}</p>
            </div>
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-xl font-bold">{approvedCredits}</div>
              <div className="text-xs text-muted-foreground">Aprobados</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-border" />
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xl font-bold">{totalCredits - approvedCredits}</div>
              <div className="text-xs text-muted-foreground">Restantes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {approvedCredits} de {totalCredits} créditos
          </span>
          <span className="text-sm font-semibold text-primary">{percentage}%</span>
        </div>
        <div className="relative">
          <Progress value={percentage} className="h-3" />
          {percentage > 0 && percentage < 100 && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary border-2 border-background shadow-glow transition-all"
              style={{ left: `calc(${percentage}% - 10px)` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
