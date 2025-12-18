import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Lock,
  BarChart3,
  Sparkles,
  BookOpen,
  Users,
  Zap,
  Shield,
  Cloud,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center animate-pulse">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: CheckCircle,
      title: 'Control Total del Progreso',
      description: 'Marca materias aprobadas, en curso o pendientes. Visualiza tu avance académico con estadísticas en tiempo real y gráficos intuitivos.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      icon: Lock,
      title: 'Validación Inteligente',
      description: 'El sistema verifica automáticamente prerrequisitos y correquisitos, alertándote sobre materias disponibles para inscribir.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      icon: BarChart3,
      title: 'Malla Curricular Visual',
      description: 'Visualiza tu pensum completo con código de colores: aprobadas, disponibles y bloqueadas. Todo en un vistazo.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      icon: Cloud,
      title: 'Sincronización en la Nube',
      description: 'Tus datos están seguros y sincronizados. Accede desde cualquier dispositivo sin perder tu progreso.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      icon: Zap,
      title: 'Rendimiento Óptimo',
      description: 'Aplicación rápida y responsive. Carga instantánea incluso con pensums extensos de múltiples semestres.',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      icon: Shield,
      title: 'Datos Protegidos',
      description: 'Tu información académica está cifrada y protegida. Control total sobre tu privacidad y datos personales.',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Crea tu Cuenta',
      description: 'Regístrate gratis en segundos. Solo necesitas un correo electrónico para comenzar.',
      icon: Users
    },
    {
      step: '02',
      title: 'Configura tu Pensum',
      description: 'Ingresa las materias de tu carrera, semestres y prerrequisitos. O importa uno existente.',
      icon: BookOpen
    },
    {
      step: '03',
      title: 'Gestiona tu Progreso',
      description: 'Marca materias completadas y visualiza tu avance hacia la graduación.',
      icon: Target
    }
  ];

  const stats = [
    { value: '100%', label: 'Gratis', sublabel: 'Sin costos ocultos' },
    { value: '∞', label: 'Materias', sublabel: 'Sin límites' },
    { value: '24/7', label: 'Disponible', sublabel: 'Acceso siempre' },
    { value: '☁️', label: 'Cloud', sublabel: 'Sincronizado' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-300 group-hover:shadow-primary/40 group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">Pensum Manager</span>
              <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">Gestión Académica Inteligente</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="hidden sm:inline-flex">Iniciar Sesión</Button>
            </Link>
            <Link to="/auth">
              <Button className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-lg shadow-primary/25">
                Comenzar Gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>La forma inteligente de gestionar tu carrera</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up">
              Tu <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">trayectoria académica</span>
              <br className="hidden sm:block" />
              <span className="text-muted-foreground">bajo control total</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up stagger-1 leading-relaxed">
              Digitaliza tu pensum universitario, visualiza tu progreso semestre a semestre y toma decisiones informadas sobre qué materias inscribir.
              <span className="text-foreground font-medium"> Todo en un solo lugar.</span>
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-105">
                  <Sparkles className="h-5 w-5" />
                  Comenzar Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up stagger-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Configuración en minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-medium mt-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Funcionalidades
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Todo lo que necesitas para <span className="gradient-text">triunfar</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Herramientas diseñadas específicamente para estudiantes universitarios que quieren tomar el control de su carrera.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-card/50 backdrop-blur-sm rounded-2xl border ${feature.border} p-8 transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 animate-fade-in-up overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                <div className="relative">
                  <div className={`h-14 w-14 rounded-2xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 md:py-32 border-t border-border/50 bg-gradient-to-b from-card/50 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              Empieza en minutos
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              ¿Cómo <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">funciona</span>?
            </h2>
            <p className="text-muted-foreground text-lg">
              Tres pasos simples para transformar cómo gestionas tu carrera universitaria.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 hover:bg-card transition-all duration-300 hover:shadow-lg">
                  <div className="absolute -top-4 left-8 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Paso {step.step}
                  </div>

                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 mt-2">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-cyan-500/20" />
            <div className="absolute inset-0 bg-hero-pattern opacity-20" />

            {/* Glowing orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />

            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20">
                <TrendingUp className="h-4 w-4" />
                <span>Únete ahora</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                ¿Listo para tomar el control de tu <span className="gradient-text">carrera</span>?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
                Comienza gratis hoy y únete a estudiantes que ya gestionan su trayectoria académica de forma inteligente.
              </p>

              <Link to="/auth">
                <Button size="lg" className="h-14 px-10 text-base gap-2 bg-white text-background hover:bg-white/90 shadow-2xl transition-all duration-300 hover:scale-105">
                  <GraduationCap className="h-5 w-5" />
                  Crear Cuenta Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <p className="mt-4 text-sm text-muted-foreground">
                Sin tarjeta de crédito • Configuración en 2 minutos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-semibold">Pensum Manager</span>
                <p className="text-xs text-muted-foreground">Gestión Académica Inteligente</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pensum Manager. Todos los derechos reservados. Dedicado a mi hermana Lina Marcela
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
