import React, { useEffect, useMemo, useState } from 'react';
import { announcementAPI } from '../services/api';
import { Bell, Calendar, Search, Megaphone, Clock, Tag, ChevronRight } from 'lucide-react';

type FilterType = 'All' | 'General' | 'Exam' | 'Schedule' | 'Personal';

const Announcements: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await announcementAPI.getAll();
        setAnnouncements(data);
      } catch (error) {
        console.error('Load announcements failed:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesFilter = filter === 'All' || ann.type === filter;
      const matchesSearch = (ann.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ann.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [announcements, filter, searchTerm]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Exam': return 'bg-red-100 text-red-700 border-red-200';
      case 'Schedule': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Personal': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Exam': return 'Kỳ thi';
      case 'Schedule': return 'Lịch học';
      case 'Personal': return 'Cá nhân';
      default: return 'Chung';
    }
  };

  if (loading) return <div className="text-slate-500 font-medium">Đang tải thông báo...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Thông báo hệ thống</h1>
          <p className="text-slate-500">Cập nhật tin tức mới nhất từ dữ liệu server.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">
          <Bell className="w-4 h-4" />
          {announcements.length} thông báo
        </div>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung thông báo..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {(['All', 'General', 'Exam', 'Schedule', 'Personal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  filter === t
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {t === 'All' ? 'Tất cả' : getTypeText(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((ann) => (
            <div key={ann._id} className="group p-6 bg-slate-50/30 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="hidden md:flex flex-col items-center justify-center min-w-[80px] h-[80px] bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-xl font-black text-slate-800">{(ann.date || '').split('-')[2] || '--'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tháng {(ann.date || '').split('-')[1] || '--'}</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getTypeStyle(ann.type)}`}>
                      {getTypeText(ann.type)}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium md:hidden">
                      <Calendar className="w-3 h-3" />
                      {ann.date}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{ann.title}</h3>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{ann.content}</p>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mới đăng</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Hệ thống</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline">
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                <Megaphone className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy thông báo</h3>
              <p className="text-slate-400 max-w-xs mx-auto">Chưa có dữ liệu phù hợp trên server.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
