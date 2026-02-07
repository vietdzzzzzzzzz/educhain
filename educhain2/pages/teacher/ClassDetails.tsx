import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, gradeAPI } from '../../services/api';
import {
  Users,
  ChevronLeft,
  Mail,
  GraduationCap,
  FileText,
  BarChart3,
  Search,
  Download,
  MoreVertical
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ClassDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const [courseData, gradeData] = await Promise.all([
          courseAPI.getById(courseId),
          gradeAPI.getByCourse(courseId)
        ]);
        setCourse(courseData);
        setGrades(gradeData);
      } catch (error) {
        console.error('Load class details failed:', error);
        setCourse(null);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const studentsInClass = useMemo(() => {
    if (!course?.students) return [];
    return course.students.filter((s: any) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (s.fullName || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      );
    });
  }, [course, searchTerm]);

  const gradeByStudentId = useMemo(() => {
    const map: Record<string, any> = {};
    grades.forEach((g: any) => {
      const id = g.student?._id || g.student;
      map[id] = g;
    });
    return map;
  }, [grades]);

  const gradeDistribution = useMemo(() => {
    const scoreOf = (g: any) => Number(g?.score || 0);
    return [
      { name: '>= 8.5', value: grades.filter((g) => scoreOf(g) >= 8.5).length, color: '#10b981' },
      { name: '7.0 - 8.4', value: grades.filter((g) => scoreOf(g) >= 7 && scoreOf(g) < 8.5).length, color: '#3b82f6' },
      { name: '5.5 - 6.9', value: grades.filter((g) => scoreOf(g) >= 5.5 && scoreOf(g) < 7).length, color: '#f59e0b' },
      { name: '< 5.5', value: grades.filter((g) => scoreOf(g) < 5.5).length, color: '#ef4444' }
    ];
  }, [grades]);

  const averageScore = useMemo(() => {
    if (!grades.length) return '0.0';
    const total = grades.reduce((sum, g) => sum + Number(g.score || 0), 0);
    return (total / grades.length).toFixed(1);
  }, [grades]);

  if (loading) return <div className="text-slate-500 font-medium">Dang tai chi tiet lop...</div>;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-500 mb-4 font-medium text-lg">Khong tim thay thong tin lop hoc.</p>
        <button onClick={() => navigate('/classes')} className="text-blue-600 font-bold flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Quay lai danh sach
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <nav className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate('/classes')} className="text-slate-500 hover:text-blue-600 transition-colors">Danh sach lop</button>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-800">{course.name}</span>
      </nav>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-6">
          <div className="p-5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <GraduationCap className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900">{course.name}</h1>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{course.code}</span>
            </div>
            <p className="text-slate-500 font-medium">Tin chi: {course.credits} • Si so: {course.students?.length || 0}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 lg:flex-none px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Xuat DS lop
          </button>
          <Link
            to="/grade-entry"
            className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
          >
            <FileText className="w-4 h-4" /> Quan ly diem
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Thong ke hoc luc
            </h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {gradeDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-black text-slate-800">{averageScore}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diem TB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Danh sach sinh vien
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tim sinh vien..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Ho va ten</th>
                  <th className="px-4 py-3 text-center">Diem</th>
                  <th className="px-4 py-3 text-center">Xep loai</th>
                  <th className="px-4 py-3 text-right">Lien he</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInClass.map((student: any) => {
                  const grade = gradeByStudentId[student._id];
                  const score = Number(grade?.score || 0);
                  const letter = score >= 8.5 ? 'A' : score >= 7 ? 'B' : score >= 5.5 ? 'C' : score >= 4 ? 'D' : 'F';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 text-xs font-mono font-bold text-slate-500">{student.email || '-'}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-slate-800">{student.fullName}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-sm font-black ${grade ? 'text-blue-600' : 'text-slate-300'}`}>
                          {grade ? score.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {grade ? (
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-700">{letter}</span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold uppercase italic">Chua nhap</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"><Mail className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"><MoreVertical className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
