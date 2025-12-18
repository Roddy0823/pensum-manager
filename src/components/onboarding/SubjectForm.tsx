import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SubjectFormProps {
  totalSemesters: number;
  onAdd: (name: string, semester: number, credits: number) => Promise<void>;
}

export default function SubjectForm({ totalSemesters, onAdd }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1');
  const [credits, setCredits] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa el nombre de la materia',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    await onAdd(name.trim(), parseInt(semester), parseInt(credits));
    setLoading(false);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="subjectName">Nombre de la materia</Label>
          <Input
            id="subjectName"
            placeholder="Ej: Cálculo I"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Semestre</Label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalSemesters }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Semestre {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-2 w-32">
          <Label>Créditos</Label>
          <Select value={credits} onValueChange={setCredits}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map(c => (
                <SelectItem key={c} value={String(c)}>
                  {c} créditos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar materia
        </Button>
      </div>
    </form>
  );
}
