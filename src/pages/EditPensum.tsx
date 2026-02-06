import { useState } from 'react';
import { useProgram } from '@/hooks/useProgram';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PrerequisiteSelector from '@/components/pensum/PrerequisiteSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Edit2, BookOpen, Link2, GraduationCap, PenLine } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Subject } from '@/types/database';

export default function EditPensum() {
  const {
    program,
    subjects,
    prerequisites,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    addPrerequisite,
    removePrerequisite
  } = useProgram();

  const [newSubject, setNewSubject] = useState({ name: '', semester: '1', credits: '3' });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (loading || !program) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const subjectsSorted = [...subjects].sort((a, b) => a.semester - b.semester);

  // Group subjects by semester for display
  const subjectsBySemester = subjects.reduce((acc, subject) => {
    if (!acc[subject.semester]) acc[subject.semester] = [];
    acc[subject.semester].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      toast({ title: 'Error', description: 'Ingresa el nombre de la materia', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const result = await addSubject(
      program.id,
      newSubject.name.trim(),
      parseInt(newSubject.semester),
      parseInt(newSubject.credits)
    );
    setSubmitting(false);

    if (result) {
      toast({ title: 'Materia agregada', description: `${newSubject.name} añadida al semestre ${newSubject.semester}` });
      setNewSubject({ name: '', semester: newSubject.semester, credits: '3' });
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    setSubmitting(true);
    const success = await updateSubject(editingSubject.id, {
      name: editingSubject.name,
      semester: editingSubject.semester,
      credits: editingSubject.credits
    });
    setSubmitting(false);

    if (success) {
      toast({ title: 'Materia actualizada' });
      setEditDialogOpen(false);
      setEditingSubject(null);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    const success = await deleteSubject(subject.id);
    if (success) {
      toast({ title: 'Materia eliminada', description: `${subject.name} fue eliminada` });
    }
  };

  const handlePrerequisiteToggle = async (subjectId: string, prerequisiteId: string, isAdding: boolean): Promise<boolean> => {
    if (isAdding) {
      const success = await addPrerequisite(subjectId, prerequisiteId);
      if (success) {
        toast({ title: 'Prerrequisito agregado' });
      }
      return success;
    } else {
      const success = await removePrerequisite(subjectId, prerequisiteId);
      if (success) {
        toast({ title: 'Prerrequisito eliminado' });
      }
      return success;
    }
  };

  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
                <PenLine className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Editar Pensum</h1>
                <p className="text-muted-foreground">{program.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-8 px-3">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              {subjects.length} materias
            </Badge>
            <Badge variant="outline" className="h-8 px-3">
              {totalCredits} créditos
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
            <TabsTrigger
              value="subjects"
              className="h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Materias</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {subjects.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="prerequisites"
              className="h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              <span>Prerrequisitos</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {prerequisites.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6 mt-6">
            {/* Add new subject card */}
            <Card className="border-dashed border-2 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  Agregar nueva materia
                </CardTitle>
                <CardDescription>
                  Añade materias a tu pensum indicando el semestre y créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6 space-y-2">
                    <Label className="text-sm">Nombre de la materia</Label>
                    <Input
                      placeholder="Ej: Cálculo I"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-2">
                    <Label className="text-sm">Semestre</Label>
                    <Select
                      value={newSubject.semester}
                      onValueChange={(v) => setNewSubject(prev => ({ ...prev, semester: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: program.total_semesters }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            Semestre {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-3 space-y-2">
                    <Label className="text-sm">Créditos</Label>
                    <Select
                      value={newSubject.credits}
                      onValueChange={(v) => setNewSubject(prev => ({ ...prev, credits: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(c => (
                          <SelectItem key={c} value={String(c)}>{c} créditos</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4 h-11" onClick={handleAddSubject} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Agregar materia
                </Button>
              </CardContent>
            </Card>

            {/* Existing subjects grouped by semester */}
            {subjectsSorted.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Sin materias</h3>
                  <p className="text-muted-foreground text-sm text-center max-w-sm">
                    Comienza agregando las materias de tu carrera usando el formulario de arriba.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.keys(subjectsBySemester)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map(semester => (
                    <Card key={semester}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{semester}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base">Semestre {semester}</CardTitle>
                              <CardDescription className="text-xs">
                                {subjectsBySemester[semester].length} materias • {subjectsBySemester[semester].reduce((acc, s) => acc + s.credits, 0)} créditos
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid gap-2">
                          {subjectsBySemester[semester].map(subject => (
                            <div
                              key={subject.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl",
                                "bg-muted/30 hover:bg-muted/50 transition-colors group"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{subject.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {subject.credits} créditos
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Dialog open={editDialogOpen && editingSubject?.id === subject.id} onOpenChange={(open) => {
                                  setEditDialogOpen(open);
                                  if (!open) setEditingSubject(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => setEditingSubject({ ...subject })}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Editar materia</DialogTitle>
                                    </DialogHeader>
                                    {editingSubject && (
                                      <div className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                          <Label>Nombre</Label>
                                          <Input
                                            value={editingSubject.name}
                                            onChange={(e) => setEditingSubject(prev => prev ? { ...prev, name: e.target.value } : null)}
                                            className="h-11"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>Semestre</Label>
                                            <Select
                                              value={String(editingSubject.semester)}
                                              onValueChange={(v) => setEditingSubject(prev => prev ? { ...prev, semester: parseInt(v) } : null)}
                                            >
                                              <SelectTrigger className="h-11">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {Array.from({ length: program.total_semesters }, (_, i) => (
                                                  <SelectItem key={i + 1} value={String(i + 1)}>
                                                    Semestre {i + 1}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Créditos</Label>
                                            <Select
                                              value={String(editingSubject.credits)}
                                              onValueChange={(v) => setEditingSubject(prev => prev ? { ...prev, credits: parseInt(v) } : null)}
                                            >
                                              <SelectTrigger className="h-11">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {[1, 2, 3, 4, 5, 6].map(c => (
                                                  <SelectItem key={c} value={String(c)}>{c} créditos</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter className="mt-6">
                                      <DialogClose asChild>
                                        <Button variant="outline">Cancelar</Button>
                                      </DialogClose>
                                      <Button onClick={handleUpdateSubject} disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar cambios
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar materia?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción eliminará "{subject.name}" y todos sus prerrequisitos configurados. Esta acción no se puede deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteSubject(subject)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Prerequisites Tab */}
          <TabsContent value="prerequisites" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Link2 className="h-4 w-4 text-primary" />
                  </div>
                  Configurar prerrequisitos
                </CardTitle>
                <CardDescription>
                  Selecciona qué materias debe aprobar el estudiante antes de cursar cada asignatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrerequisiteSelector
                  subjects={subjects}
                  prerequisites={prerequisites}
                  onToggle={handlePrerequisiteToggle}
                  totalSemesters={program.total_semesters}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
