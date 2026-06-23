import React, { useEffect, useState } from 'react';
import { Star, Calendar, Clock, Loader2, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { tutorService } from '@/api/services/tutorService';

interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  satisfaction_percent: number;
  rating_distribution: Array<{ rating: number; count: number }>;
}

export default function TutorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchReviews = async (currentPage: number, currentRating: number | null) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page: currentPage };
      if (currentRating) {
        params.rating = currentRating;
      }
      
      const response = await tutorService.getReviews(params);
      
      setReviews(response.data || []);
      setMeta(response.meta || null);
      if (response.summary) {
        setSummary(response.summary);
      }
      setError(null);
    } catch {
      setError('Gagal memuat ulasan dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page, filterRating);
  }, [page, filterRating]);

  const handleFilterClick = (rating: number | null) => {
    setFilterRating(rating);
    setPage(1); // Reset to first page
  };

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    const dateObj = new Date(dateStr);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  };

  // Render Stars Helper
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} 
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Ulasan & Rating</h1>

      {/* Summary Card */}
      <div className="bg-[#F8FBFB] border border-emerald-50 rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
          
          {/* Left: Average Rating */}
          <div className="flex-1">
            <h3 className="text-[11px] font-bold text-emerald-700 tracking-wider mb-2">RATA-RATA RATING</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-extrabold text-textPrimary">{summary?.average_rating.toFixed(1) || '0.0'}</span>
              <span className="text-lg font-bold text-slate-400">/ 5.0</span>
            </div>
            {renderStars(Math.round(summary?.average_rating || 0))}
          </div>

          {/* Right: Distribution Bars */}
          <div className="flex-[2] space-y-2.5">
            {[5, 4, 3, 2, 1].map((ratingNum) => {
              const item = summary?.rating_distribution?.find(r => r.rating === ratingNum);
              const count = item?.count || 0;
              const maxCount = summary?.total_reviews || 1;
              const percent = (count / maxCount) * 100;
              
              return (
                <div key={ratingNum} className="flex items-center gap-4">
                  {/* Small 5 Stars */}
                  <div className="flex items-center gap-0.5 w-24 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= ratingNum ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} 
                      />
                    ))}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${ratingNum >= 4 ? 'bg-emerald-700' : 'bg-emerald-400'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  
                  {/* Count */}
                  <div className="w-8 text-right text-sm font-bold text-textPrimary">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-emerald-100 my-6"></div>

        <div className="flex items-center justify-between">
          <div className="flex gap-12">
            <div>
              <p className="text-2xl font-bold text-textPrimary">{summary?.total_reviews || 0}</p>
              <p className="text-xs font-medium text-slate-500">Total Ulasan</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-textPrimary">{summary?.satisfaction_percent || 0}%</p>
              <p className="text-xs font-medium text-slate-500">Kepuasan Mahasiswa</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full btn-glass flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          onClick={() => handleFilterClick(null)}
          className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
            filterRating === null 
              ? 'btn-glass' 
              : 'btn-glass text-slate-600 dark:text-slate-400'
          }`}
        >
          Semua
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => handleFilterClick(rating)}
            className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
              filterRating === rating 
                ? 'btn-glass' 
                : 'btn-glass text-slate-600 dark:text-slate-400'
            }`}
          >
            {rating} Bintang
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-rose-500 font-medium">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-[32px]">
            <p className="text-slate-500 font-medium">Belum ada ulasan untuk filter ini.</p>
          </div>
        ) : (
          reviews.map((review) => {
            const learnerName = review.learner?.name || 'Learner';
            const initials = learnerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            
            return (
              <div key={review.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex gap-5">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden">
                  {review.learner?.avatar ? (
                    <img src={review.learner.avatar} alt={learnerName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-bold text-textPrimary text-base">{learnerName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                        {review.course?.name || 'MATA KULIAH'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {formatDate(review.session_date)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {review.session_time || '-'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stars Top Right */}
                    <div className="shrink-0">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                p === page 
                  ? 'btn-glass-primary shadow-sm' 
                  : 'btn-glass'
              }`}
            >
              {p}
            </button>
          ))}
          
          <button 
            disabled={page === meta.last_page}
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
            className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
