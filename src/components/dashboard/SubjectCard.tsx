import { cn } from '@/lib/utils';
import { Lock, Check, Circle, BookOpen, Loader2 } from 'lucide-react';
import type { SubjectWithStatus } from '@/types/database';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SubjectCardProps {
  subject: SubjectWithStatus;
  onClick: () => void;
  isLoading?: boolean;
}

export default function SubjectCard({ subject, onClick, isLoading = false }: SubjectCardProps) {
  const statusConfig = {
    approved: {
      bg: 'bg-success/10 border-success/20 hover:bg-success/15 hover:border-success/30',
      iconBg: 'bg-success/20',
      icon: Check,
      iconColor: 'text-success',
      cursor: 'cursor-pointer',
      shadow: 'hover:shadow-glow-success'
    },
    available: {
      bg: 'bg-card border-border hover:bg-accent hover:border-primary/20',
      iconBg: 'bg-primary/10',
      icon: Circle,
      iconColor: 'text-primary',
      cursor: 'cursor-pointer',
      shadow: 'hover:shadow-soft'
    },
    blocked: {
      bg: 'bg-muted/30 border-border/50',
      iconBg: 'bg-muted',
      icon: Lock,
      iconColor: 'text-muted-foreground/50',
      cursor: 'cursor-not-allowed',
      shadow: ''
    }
  };

  const config = statusConfig[subject.status];
  const Icon = isLoading ? Loader2 : config.icon;
  const isDisabled = subject.status === 'blocked' || isLoading;

  const card = (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        config.bg,
        isDisabled ? 'cursor-not-allowed' : config.cursor,
        !isDisabled && config.shadow,
        (subject.status === 'blocked' || isLoading) && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform",
          config.iconBg,
          !isDisabled && 'group-hover:scale-110'
        )}>
          <Icon className={cn(
            "h-4 w-4",
            isLoading ? 'animate-spin text-primary' : config.iconColor
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {subject.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>{subject.credits} cr.</span>
            </div>
            {subject.prerequisites.length > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="text-xs text-muted-foreground">
                  {subject.prerequisites.length} prereq.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );

  if (subject.status === 'blocked' && subject.missingPrerequisites.length > 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {card}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-4">
          <p className="font-semibold mb-2 text-destructive">Prerrequisitos pendientes:</p>
          <ul className="space-y-1">
            {subject.missingPrerequisites.map(prereq => (
              <li key={prereq.id} className="flex items-center gap-2 text-sm">
                <Lock className="h-3 w-3 text-muted-foreground" />
                {prereq.name}
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (subject.status === 'approved' && !isLoading) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {card}
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">Click para desmarcar</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return card;
}

