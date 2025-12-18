import { useState, useEffect, useRef } from 'react';
import { useProgram } from '@/hooks/useProgram';
import { useDocumentTitle } from '@/hooks/useUtils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProgressBar from '@/components/dashboard/ProgressBar';
import PensumGrid from '@/components/dashboard/PensumGrid';
import StatusLegend from '@/components/dashboard/StatusLegend';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  useDocumentTitle('Dashboard');

  const {
    program,
    loading,
    error,
    getSubjectsBySemester,
    toggleSubjectApproval,
    getTotalCredits,
    getApprovedCredits,
    getProgressPercentage,
    refetch
  } = useProgram();

  // Use a ref to track if onboarding was completed - persists across re-renders
  const onboardingCompleted = useRef(false);
  const [togglingSubject, setTogglingSubject] = useState<string | null>(null);
  // Force re-render after onboarding complete
  const [, forceUpdate] = useState({});

  const handleSubjectClick = async (subjectId: string) => {
    if (togglingSubject) return; // Prevent double-clicks

    setTogglingSubject(subjectId);

    try {
      const result = await toggleSubjectApproval(subjectId);
      if (!result.success && result.error) {
        toast({
          title: 'No disponible',
          description: result.error,
          variant: 'destructive'
        });
      } else if (result.success) {
        toast({
          title: '¡Actualizado!',
          description: 'El estado de la materia ha sido actualizado.',
        });
      }
    } finally {
      setTogglingSubject(null);
    }
  };

  const handleWizardComplete = async () => {
    console.log('handleWizardComplete: Starting...');
    // Mark onboarding as completed using ref (persists across re-renders)
    onboardingCompleted.current = true;
    // Force a re-render
    forceUpdate({});
    // Refetch program data
    await refetch();
    console.log('handleWizardComplete: Refetch complete');
    // Force another re-render after refetch
    forceUpdate({});
  };

  // Reset the ref when program is loaded
  useEffect(() => {
    if (program && onboardingCompleted.current) {
      console.log('Program loaded after onboarding, resetting flag');
      onboardingCompleted.current = false;
    }
  }, [program]);

  // Error state - only show if there's a real error message
  if (error && error.trim() && !loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Error al cargar datos</h2>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSkeleton variant="dashboard" />
      </DashboardLayout>
    );
  }

  // Show onboarding wizard ONLY if:
  // 1. No program exists
  // 2. AND onboarding hasn't just been completed
  const shouldShowOnboarding = !program && !onboardingCompleted.current;

  console.log('Dashboard render:', {
    hasProgram: !!program,
    loading,
    onboardingCompleted: onboardingCompleted.current,
    shouldShowOnboarding
  });

  if (shouldShowOnboarding) {
    return <OnboardingWizard onComplete={handleWizardComplete} />;
  }

  // If we just completed onboarding but program isn't loaded yet, show loading
  if (!program) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Cargando tu programa...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const subjectsBySemester = getSubjectsBySemester();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground">
              {program.total_semesters} semestres
            </p>
          </div>
          <StatusLegend />
        </div>

        {/* Progress Bar */}
        <ProgressBar
          approvedCredits={getApprovedCredits()}
          totalCredits={getTotalCredits()}
          percentage={getProgressPercentage()}
        />

        {/* Pensum Grid */}
        <div className="bg-card rounded-xl border p-4 shadow-soft transition-all duration-300">
          <h2 className="font-semibold mb-4">Malla Curricular</h2>
          <PensumGrid
            subjectsBySemester={subjectsBySemester}
            totalSemesters={program.total_semesters}
            onSubjectClick={handleSubjectClick}
            loadingSubject={togglingSubject}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
