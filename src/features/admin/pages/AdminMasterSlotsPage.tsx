import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/api/services/adminService';
import { normalizeList } from '@/lib/apiData';

export default function AdminMasterSlotsPage() {
  const [slots, setSlots] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const fetchSlots = async () => {
    try {
      const response = await adminService.getMasterSlots();
      setSlots(normalizeList(response));
    } catch {
      setError('Gagal memuat master slot dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newStartTime || !newEndTime) return;
    try {
      await adminService.createMasterSlot({ code: newCode, start_time: newStartTime, end_time: newEndTime });
      setNewCode('');
      setNewStartTime('');
      setNewEndTime('');
      setIsAdding(false);
      fetchSlots();
    } catch {
      alert('Gagal menambah master slot');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Hapus master slot ini?')) return;
    try {
      await adminService.deleteMasterSlot(id);
      fetchSlots();
    } catch {
      alert('Gagal menghapus master slot');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Master Slots Waktu</CardTitle>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h4 className="font-semibold text-slate-800">Tambah Master Slot Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Kode Sesi</label>
                  <input required value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full rounded-lg border p-2" placeholder="Cth: Sesi-13" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Waktu Mulai</label>
                  <input required type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} className="w-full rounded-lg border p-2 bg-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Waktu Selesai</label>
                  <input required type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} className="w-full rounded-lg border p-2 bg-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm rounded-lg btn-glass">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700">Simpan</button>
              </div>
            </form>
          )}

          {loading ? <p className="text-sm text-slate-500">Memuat master slot...</p> : null}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          {!loading && !error && slots.length === 0 ? <p className="text-sm text-slate-500">Belum ada master slot dari backend.</p> : null}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700"><CalendarDays className="h-5 w-5" /></div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{(slot.code as string) ?? 'Sesi'}</span>
                    <span className="text-sm text-slate-500">{(slot.start_time as string)?.substring(0, 5)} - {(slot.end_time as string)?.substring(0, 5)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(slot.id as number)} 
                  className="p-2 btn-glass-destructive rounded-lg"
                  title="Hapus Master Slot"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
