import { useState, useMemo, useEffect } from 'react';
import { UploadCloud, CheckCircle2, ChevronRight, GraduationCap, Briefcase, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { learnerService } from '@/api/services/learnerService';
import { publicService } from '@/api/services/publicService';
import { useNavigate } from 'react-router-dom';
import { normalizeList } from '@/lib/apiData';

export default function TutorApplicationPage() {
  const navigate = useNavigate();
  const [currentSemester, setCurrentSemester] = useState<number>(3);
  const [semesterInputValue, setSemesterInputValue] = useState<string>('3'); // Separate state for typing
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [bio, setBio] = useState<string>('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await publicService.getCourses();
        setCourses(normalizeList(response));
      } catch (err) {
        console.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  // Array to hold files based on required count
  const requiredFilesCount = Math.max(1, currentSemester - 1);
  const [transcriptFiles, setTranscriptFiles] = useState<(File | null)[]>(Array(requiredFilesCount).fill(null));

  // Filter courses based on current semester (can only teach past semesters)
  const availableCourses = useMemo(() => {
    return courses.filter(course => (course.semester || 1) < currentSemester);
  }, [currentSemester, courses]);

  const handleSemesterChange = (val: string) => {
    setSemesterInputValue(val); // Always update what they type

    const parsed = parseInt(val);
    
    // Only update the actual semantic semester if it's a valid number
    if (!isNaN(parsed)) {
      const newSem = Math.min(5, Math.max(3, parsed));
      setCurrentSemester(newSem);
      
      // Reset selected courses that are no longer valid
      setCourseIds(prev => prev.filter(id => {
        return courses.find(c => c.id.toString() === id && (c.semester || 1) < newSem);
      }));

      // Adjust transcript files array size
      const newRequiredCount = Math.max(1, newSem - 1);
      setTranscriptFiles(prev => {
        const newFiles = [...prev];
        if (newFiles.length < newRequiredCount) {
          return [...newFiles, ...Array(newRequiredCount - newFiles.length).fill(null)];
        }
        return newFiles.slice(0, newRequiredCount);
      });
    }
  };

  const handleSemesterBlur = () => {
    // When they leave the input, if it's empty or invalid, force it back to current valid state
    setSemesterInputValue(currentSemester.toString());
  };

  const handleFileChange = (index: number, file: File | null) => {
    setTranscriptFiles(prev => {
      const newArr = [...prev];
      newArr[index] = file;
      return newArr;
    });
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCertificateFiles(prev => [...prev, ...newFiles]);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleAddPortfolioLink = () => {
    if (portfolioLinks.length < 5) {
      setPortfolioLinks([...portfolioLinks, '']);
    }
  };

  const handleRemovePortfolioLink = (index: number) => {
    if (portfolioLinks.length > 1) {
      setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
    }
  };

  const handlePortfolioChange = (index: number, value: string) => {
    const newLinks = [...portfolioLinks];
    newLinks[index] = value;
    setPortfolioLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courseIds.length === 0 || transcriptFiles.some(f => f === null)) {
      alert("Mohon lengkapi semua field yang wajib!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('current_semester', currentSemester.toString());
      courseIds.forEach(id => {
        formData.append('course_ids[]', id);
      });
      
      // Append all transcript files as an array
      transcriptFiles.forEach((file) => {
        if (file) {
          formData.append('transcript_files[]', file);
        }
      });
      
      formData.append('bio', bio);
      portfolioLinks.forEach((link) => {
        if (link.trim() !== '') {
          formData.append('portfolio_urls[]', link.trim());
        }
      });
      
      certificateFiles.forEach((file) => {
        formData.append('certificate_files[]', file);
      });

      await learnerService.upgradeToTutor(formData);
      setShowSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan sistem';
      // Fallback to alert for errors, but we can also use custom UI later if needed
      alert('Gagal: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid lg:grid-cols-[45%_55%] gap-8 lg:gap-12 relative z-10 pb-12">
      
      {/* Left Column: Thesis & Information */}
      <div className="flex flex-col pt-8 lg:pt-16 lg:sticky lg:top-8 h-fit">
        <div className="bg-white/60 dark:bg-bgSecondary/60 backdrop-blur-xl border border-white/50 dark:border-borderColor rounded-[32px] shadow-xl shadow-slate-200/20 dark:shadow-none p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold tracking-widest text-xs uppercase mb-6 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full w-fit">
            <GraduationCap className="w-4 h-4" />
            KonekDin Tutor
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
            Bantu yang lain,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
              Kembangkan dirimu.
            </span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed max-w-md mb-10">
            Bagikan keahlianmu pada mata kuliah yang telah kamu kuasai. Menjadi tutor tidak hanya menambah penghasilan, tapi juga mengasah pemahamanmu sendiri.
          </p>

          <div className="space-y-8 max-w-md">
            {[
              { title: "Verifikasi Semester", desc: "Upload transkrip nilai sesuai jumlah semester yang telah kamu lewati." },
              { title: "Pilih Mata Kuliah", desc: "Kamu hanya bisa mengajar mata kuliah dari semester di bawahmu." },
              { title: "Tunggu Persetujuan", desc: "Sistem akan memverifikasi IPK dan nilaimu secara otomatis sebelum kamu bisa mengajar." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Application Form or Success State */}
      <div className="bg-white/80 dark:bg-bgSecondary rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-borderColor p-8 lg:p-10">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 h-full">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pengajuan Berhasil!</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
              Terima kasih telah mendaftar menjadi tutor KonekDin. Tim admin kami akan meninjau berkas Anda dalam 1x24 jam kerja.
            </p>
            <div className="pt-6 w-full">
              <Button 
                onClick={() => navigate('/learner/profile')}
                className="w-full h-14 rounded-2xl text-base font-bold btn-glass-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Kembali ke Profil
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section 1: Akademik */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-borderColor pb-4">
                1. Informasi Akademik
              </h3>
              
              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase ml-1">
                  Semester Berjalan <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="number" 
                  min="3" max="5"
                  value={semesterInputValue}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  onBlur={handleSemesterBlur}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-bgPrimary border-slate-300 dark:border-borderColor focus-visible:ring-brand-500 text-lg font-bold px-5 text-slate-900 dark:text-white"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Minimal semester 3, maksimal 5. Anda memerlukan {requiredFilesCount} transkrip nilai.</p>
              </div>

              {/* Dynamic Transcripts Upload */}
              <div className="space-y-4 pt-2">
                <label className="block text-[11px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase ml-1 mb-2">
                  Dokumen Transkrip <span className="text-red-500">*</span>
                </label>
                
                <div className="grid gap-4">
                  {Array.from({ length: requiredFilesCount }).map((_, i) => (
                    <div key={i} className="relative group">
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-colors
                        ${transcriptFiles[i] ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' : 'border-slate-300 dark:border-borderColor bg-slate-50 dark:bg-bgPrimary group-hover:border-brand-400'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                          ${transcriptFiles[i] ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600'}`}>
                          {transcriptFiles[i] ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                        </div>
                        <div className="truncate pr-4">
                          <p className={`font-bold text-sm truncate ${transcriptFiles[i] ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                            {transcriptFiles[i] ? transcriptFiles[i]?.name : `Transkrip Semester ${i + 1}`}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {transcriptFiles[i] ? 'Siap diunggah' : 'Format PDF (Maks. 5MB)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Pemilihan Matkul */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-borderColor pb-4">
                2. Mata Kuliah & Keahlian
              </h3>

              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase ml-1">
                  Mata Kuliah Diajarkan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {availableCourses.length > 0 ? availableCourses.map(c => (
                    <label 
                      key={c.id} 
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        courseIds.includes(c.id.toString()) 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' 
                          : 'border-slate-200 dark:border-borderColor hover:border-brand-300 dark:hover:border-brand-600 bg-slate-50 dark:bg-bgPrimary'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        value={c.id}
                        checked={courseIds.includes(c.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCourseIds([...courseIds, c.id.toString()]);
                          } else {
                            setCourseIds(courseIds.filter(id => id !== c.id.toString()));
                          }
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {c.name}
                        </span>
                        {c.semester && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            Semester {c.semester}
                          </span>
                        )}
                      </div>
                    </label>
                  )) : (
                    <p className="text-xs text-red-500 font-semibold mt-1 col-span-full">Tidak ada matkul tersedia untuk semester ini.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                  Keahlian & Bio Singkat <span className="text-slate-400 font-medium normal-case tracking-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute top-4 left-4 w-5 h-5 text-slate-400" />
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={4} 
                    placeholder="Ceritakan keahlian spesifikmu, gaya mengajarmu..." 
                    className="w-full rounded-2xl border border-slate-300 dark:border-borderColor bg-slate-50 dark:bg-bgPrimary pl-12 pr-5 py-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[11px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1.5">
                    Link Portofolio <span className="text-slate-400 font-medium normal-case tracking-normal">(Opsional)</span>
                  </label>
                  {portfolioLinks.length < 5 && (
                    <button 
                      type="button" 
                      onClick={handleAddPortfolioLink}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                    >
                      + Tambah Link
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {portfolioLinks.map((link, index) => (
                    <div key={index} className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-slate-400" />
                        <Input 
                          type="url"
                          value={link} 
                          onChange={(e) => handlePortfolioChange(index, e.target.value)} 
                          placeholder="https://github.com/username" 
                          className="h-14 rounded-2xl bg-slate-50 dark:bg-bgPrimary border-slate-300 dark:border-borderColor focus-visible:ring-brand-500 text-sm font-medium text-slate-900 dark:text-white pl-12 pr-5 placeholder-slate-400"
                        />
                      </div>
                      {portfolioLinks.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemovePortfolioLink(index)}
                          className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center btn-glass-destructive"
                          title="Hapus Link"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold tracking-widest text-slate-600 dark:text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                  Sertifikat Pendukung <span className="text-slate-400 font-medium normal-case tracking-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCertificateChange}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-bold
                      file:btn-glass
                      cursor-pointer"
                  />
                  {certificateFiles.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {certificateFiles.map((f, i) => (
                        <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-bgPrimary rounded-2xl border border-slate-200 dark:border-borderColor">
                          <span className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setCertificateFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-xs text-red-500 font-bold hover:text-red-700 px-2.5 py-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0 transition-colors"
                          >
                            Hapus
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 ml-1">Format: PDF, JPG, PNG (Maks. 5MB/file)</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-borderColor">
              <Button 
                type="submit" 
                disabled={isSubmitting || availableCourses.length === 0}
                className="w-full h-14 rounded-2xl text-base font-bold btn-glass-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 group disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sedang Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Pengajuan Tutor
                    <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4">
                Dengan mengirim pengajuan, Anda menyetujui syarat & ketentuan KonekDin.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
