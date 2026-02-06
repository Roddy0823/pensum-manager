import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Lock,
  BarChart3,
  BookOpen,
  Users,
  Zap,
  Shield,
  Cloud,
  TrendingUp,
  Target,
  Clock,
  Smartphone,
  Share2,
  PlusSquare,
  Download
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Iniciar Sesión</Button>
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
              <GraduationCap className="h-4 w-4" />
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

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
              <Link to="/auth?register=true">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-105">
                  <GraduationCap className="h-5 w-5" />
                  Comenzar Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up stagger-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Fácil de usar</span>
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
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              Empieza en minutos
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              ¿Cómo <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">funciona</span>?
            </h2>
            <p className="text-muted-foreground text-lg">
              Tres pasos simples para transformar cómo gestionas tu carrera universitaria.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group relative flex gap-6 items-start p-6 rounded-2xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 opacity-0 translate-y-8 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-300">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Install PWA Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-medium mb-4">
                <Smartphone className="h-4 w-4" />
                <span>Instala la App</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Úsala como <span className="gradient-text">aplicación nativa</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Agrega Pensum Manager a la pantalla de inicio de tu celular para acceder rápidamente, sin abrir el navegador.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* iOS Instructions */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 hover:border-border transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">iPhone / iPad</h3>
                    <p className="text-sm text-muted-foreground">Safari</p>
                  </div>
                </div>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">1</div>
                    <div className="text-sm pt-0.5">
                      <p>Abre <strong className="text-foreground">pensum-manager.netlify.app</strong> en Safari</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">2</div>
                    <div className="text-sm pt-0.5 flex items-center gap-2">
                      <p>Toca el botón <strong className="text-foreground">Compartir</strong></p>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">3</div>
                    <div className="text-sm pt-0.5 flex items-center gap-2">
                      <p>Selecciona <strong className="text-foreground">"Añadir a pantalla de inicio"</strong></p>
                      <PlusSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 hover:border-border transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24C14.77 8.35 12.93 8 11 8c-1.93 0-3.77.35-5.47.91L3.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L4.4 9.48C1.91 11.03 0 13.71 0 17h22c0-3.29-1.91-5.97-4.4-7.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Android</h3>
                    <p className="text-sm text-muted-foreground">Chrome</p>
                  </div>
                </div>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">1</div>
                    <div className="text-sm pt-0.5">
                      <p>Abre <strong className="text-foreground">pensum-manager.netlify.app</strong> en Chrome</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">2</div>
                    <div className="text-sm pt-0.5">
                      <p>Toca el menú <strong className="text-foreground">⋮</strong> (tres puntos)</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">3</div>
                    <div className="text-sm pt-0.5 flex items-center gap-2">
                      <p>Selecciona <strong className="text-foreground">"Instalar app"</strong> o <strong className="text-foreground">"Añadir a inicio"</strong></p>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/15 to-cyan-500/10 border border-border/50">
            {/* Glowing orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <TrendingUp className="h-4 w-4" />
                <span>Únete ahora</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                ¿Listo para tomar el control de tu <span className="gradient-text">carrera</span>?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
                Comienza gratis hoy y únete a estudiantes que ya gestionan su trayectoria académica de forma inteligente.
              </p>

              <Link to="/auth?register=true">
                <Button size="lg" className="h-14 px-10 text-base gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-105">
                  <GraduationCap className="h-5 w-5" />
                  Crear Cuenta Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <p className="mt-4 text-sm text-muted-foreground">
                100% gratuito • Configuración en 2 minutos
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
              © {new Date().getFullYear()} Pensum Manager. Todos los derechos reservados. Dedicado a mi hermana Lina Carvajal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
