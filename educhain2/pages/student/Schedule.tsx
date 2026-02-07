import React, { useEffect, useMemo, useState } from 'react';
import { scheduleAPI, examAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, MapPin, User, FileText, ChevronRight, ChevronLeft, Download, Info } from 'lucide-react';

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'study' | 'exam'>('study');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = [
    { label: 'Thu 2', value: 1 },
    { label: 'Thu 3', value: 2 },
    { label: 'Thu 4', value: 3 },
    { label: 'Thu 5', value: 4 },
    { label: 'Thu 6', value: 5 },
    { label: 'Thu 7', value: 6 },
    { label: 'Chu Nhat', value: 7 }
  ];

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [scheduleData, examData] = await Promise.all([
          scheduleAPI.getAll(user.id),
          examAPI.getAll(user.id)
        ]);
        setSchedules(scheduleData);
        setExams(examData);
      } catch (error) {
        console.error('Load schedule/exam failed:', error);
        setSchedules([]);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const scheduleByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    days.forEach((d) => { map[d.value] = []; });
    schedules.forEach((s) => {
      if (!map[s.dayOfWeek]) map[s.dayOfWeek] = [];
      map[s.dayOfWeek].push(s);
    });
    return map;
  }, [schedules]);

  if (loading) return <div className="text-slate-500 font-medium">Dang tai lich trinh...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lich trinh ca nhan</h1>
          <p className="text-slate-500">Theo doi lich hoc va lich thi tu du lieu server.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('study')}
            className={`px-6 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'study' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Lich hoc tuan
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-6 py-2 rounded-lg font-bold transition-all text-sm ${activeTab === 'exam' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Lich thi
          </button>
        </div>
      </header>

      {activeTab === 'study' ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-800">Lich hoc tu server</span>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {days.map((day) => {
              const daySchedules = scheduleByDay[day.value] || [];
              return (
                <div key={day.value} className="space-y-4">
                  <div className="p-3 rounded-xl text-center font-bold text-sm bg-white text-slate-700 border border-slate-100 shadow-sm">
                    {day.label}
                  </div>

                  <div className="space-y-3">
                    {daySchedules.length > 0 ? daySchedules.map((item) => (
                      <div key={item._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{item.courseCode}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-3 group-hover:text-blue-600 transition-colors leading-tight">{item.courseName}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-semibold text-slate-700">P. {item.room}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-50 pt-2">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate italic">{item.teacherName}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        <span className="text-xs text-slate-300 italic">Trong</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Lich thi hoc ky</h3>
                  <p className="text-slate-500 text-sm">Du lieu exam tu MongoDB</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm">
                <Download className="w-4 h-4" />
                Tai lich thi
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <th className="px-6 py-4 rounded-l-xl">Mon hoc</th>
                    <th className="px-6 py-4 text-center">Ngay thi</th>
                    <th className="px-6 py-4 text-center">Gio thi</th>
                    <th className="px-6 py-4 text-center">Phong</th>
                    <th className="px-6 py-4 text-center">So bao danh</th>
                    <th className="px-6 py-4 rounded-r-xl text-center">Hinh thuc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <p className="font-bold text-slate-800">{exam.courseName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{exam.courseCode}</p>
                      </td>
                      <td className="px-6 py-6 text-center"><span className="text-sm font-bold text-slate-700">{exam.date}</span></td>
                      <td className="px-6 py-6 text-center"><span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{exam.time}</span></td>
                      <td className="px-6 py-6 text-center font-bold text-slate-700">{exam.room}</td>
                      <td className="px-6 py-6 text-center"><span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded text-slate-600">{exam.seatNumber}</span></td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">{exam.format}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
              <Info className="w-6 h-6 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800 leading-relaxed">
                Lich thi hien duoc lay truc tiep tu collection exams.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
