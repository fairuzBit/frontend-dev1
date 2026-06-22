import { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/api/services/adminService';
import { normalizeList } from '@/lib/apiData';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSemester, setNewSemester] = useState('1');

  const fetchCourses = async () => {
    try {
      const response = await adminService.getCourses();
      setCourses(normalizeList(response));
    } catch {
      setError('Gagal memuat mata kuliah dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;
    try {
      await adminService.createCourse({ name: newName, code: newCode, semester: newSemester });
      setNewName('');
      setNewCode('');
      setIsAdding(false);
      fetchCourses();
    } catch {
      alert('Gagal menambah mata kuliah');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Hapus mata kuliah ini?')) return;
    try {
      await adminService.deleteCourse(id);
      fetchCourses();
    } catch {
      alert('Gagal menghapus mata kuliah');
    }
  };

  // Group courses by semester up to semester 5
  const semesters = [1, 2, 3, 4, 5];
  
  const getCoursesBySemester = (semester: number) => {
    return courses.filter((course) => course.semester === semester || course.semester === String(semester));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mata Kuliah per Semester (1 - 5)</CardTitle>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 rounded-lg btn-glass-primary px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h4 className="font-semibold text-slate-800">Tambah Mata Kuliah Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Nama Mata Kuliah</label>
                  <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded-lg border p-2" placeholder="Cth: Kalkulus" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Kode</label>
                  <input required value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full rounded-lg border p-2" placeholder="Cth: CS001" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Semester</label>
                  <select value={newSemester} onChange={e => setNewSemester(e.target.value)} className="w-full rounded-lg border p-2 bg-white">
                    {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm rounded-lg btn-glass">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg btn-glass-primary">Simpan</button>
              </div>
            </form>
          )}

          {loading ? <p className="text-sm text-slate-500">Memuat mata kuliah...</p> : null}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          {!loading && !error && courses.length === 0 ? <p className="text-sm text-slate-500">Belum ada mata kuliah dari backend.</p> : null}
          
          <div className="space-y-8 mt-4">
            {semesters.map((semester) => {
              const semesterCourses = getCoursesBySemester(semester);
              return (
                <div key={semester}>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Semester {semester}</h3>
                  {semesterCourses.length === 0 && !loading ? (
                    <p className="text-sm text-slate-500 italic">Tidak ada mata kuliah untuk semester ini.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {semesterCourses.map((course, index) => (
                        <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">{(course.name as string) ?? 'Nama Mata Kuliah'}</span>
                              <span className="text-sm text-slate-500">Kode: {(course.code as string) ?? '-'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(course.id as number)} 
                            className="p-2 btn-glass-destructive rounded-lg"
                            title="Hapus Mata Kuliah"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
