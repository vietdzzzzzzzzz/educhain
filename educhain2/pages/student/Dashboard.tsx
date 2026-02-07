import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, BookOpen, Clock, Calendar, TrendingUp, AlertCircle, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { gradeAPI } from '../../services/api';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await gradeAPI.getByStudent(user.id);
        setGrades(data);
      } catch (error) {
        console.error('Load student dashboard failed:', error);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const gpaData = useMemo(() => {
    const bySemester: Record<string, number[]> = {};
    grades.forEach((g) => {
      const sem = g.semester || 'Khac';
      if (!bySemester[sem]) bySemester[sem] = [];
      bySemester[sem].push(Number(g.score || 0));
    });
    return Object.entries(bySemester).map(([name, arr]) => ({
      name,
      gpa: Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
    }));
  }, [grades]);

  const avgScore = useMemo(() => {
    if (!grades.length) return 0;
    return Number((grades.reduce((sum, g) => sum + Number(g.score || 0), 0) / grades.length).toFixed(2));
  }, [grades]);

  const recentGrades = grades.slice(0, 3);

  if (loading) return <div className="text-slate-500 font-medium">Dang tai dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chao mung tro lai, {user?.fullName}!</h1>
          <p className="text-slate-500 mt-1">Tong hop du lieu hoc tap tu co so du lieu.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <Calendar className="text-blue-600 w-5 h-5" />
          <span className="font-semibold text-slate-700">Du lieu thuc</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Diem trung binh', value: avgScore.toFixed(2), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'So mon da co diem', value: `${grades.length}`, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Hoc ky da hoc', value: `${new Set(grades.map((g) => g.semester)).size}`, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Diem moi cap nhat', value: `${recentGrades.length}`, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Diem trung binh theo hoc ky
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="gpa" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Bang diem gan day</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="pb-4 font-semibold text-slate-500 text-sm">Mon hoc</th>
                    <th className="pb-4 font-semibold text-slate-500 text-sm">Ma mon</th>
                    <th className="pb-4 font-semibold text-slate-500 text-sm">Diem</th>
                    <th className="pb-4 font-semibold text-slate-500 text-sm">Hoc ky</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentGrades.map((grade: any) => (
                    <tr key={grade._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4"><p className="font-semibold text-slate-800">{grade.course?.name || '-'}</p></td>
                      <td className="py-4 text-slate-600">{grade.course?.code || '-'}</td>
                      <td className="py-4 font-bold text-blue-600">{Number(grade.score || 0).toFixed(1)}</td>
                      <td className="py-4 text-slate-600">{grade.semester || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Mon hoc da co diem
            </h3>
            <div className="space-y-4">
              {grades.slice(0, 5).map((g: any) => (
                <div key={g._id} className="relative pl-6 border-l-2 border-blue-100 py-1">
                  <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="font-bold text-slate-800">{g.course?.name || '-'}</p>
                  <p className="text-sm text-slate-500">Diem: {Number(g.score || 0).toFixed(1)} • {g.semester || '-'}</p>
                </div>
              ))}
              {grades.length === 0 && <p className="text-slate-400 text-sm italic">Chua co du lieu diem.</p>}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Server Data</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Thong bao</h4>
            <p className="text-sm text-blue-100 leading-relaxed mb-4">
              Dashboard da dung du lieu that tu MongoDB cho bang diem va thong ke.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
