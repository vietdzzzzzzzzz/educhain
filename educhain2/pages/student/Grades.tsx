import React, { useEffect, useMemo, useState } from 'react';
import { Download, Info } from 'lucide-react';
import { gradeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const toLetter = (score: number) => (score >= 8.5 ? 'A' : score >= 7 ? 'B' : score >= 5.5 ? 'C' : score >= 4 ? 'D' : 'F');

const GradesPage: React.FC = () => {
  const { user } = useAuth();
  const [semester, setSemester] = useState('ALL');
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
        console.error('Load student grades failed:', error);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const semesters = useMemo(() => ['ALL', ...Array.from(new Set(grades.map((g) => g.semester).filter(Boolean)))], [grades]);
  const filteredGrades = useMemo(() => (semester === 'ALL' ? grades : grades.filter((g) => g.semester === semester)), [grades, semester]);
  const avg = useMemo(() => {
    if (!filteredGrades.length) return 0;
    const total = filteredGrades.reduce((sum, g) => sum + Number(g.score || 0), 0);
    return Number((total / filteredGrades.length).toFixed(2));
  }, [filteredGrades]);

  if (loading) return <div className="text-slate-500 font-medium">Dang tai bang diem...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ket qua hoc tap</h1>
          <p className="text-slate-500">Tra cuu diem chi tiet theo du lieu that tu server.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-medium">
            <Download className="w-4 h-4" />
            Xuat bang diem (PDF)
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <select
            className="bg-slate-100 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'Tat ca hoc ky' : s}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-blue-50 rounded-xl">
              <span className="text-xs text-blue-500 font-semibold block">Diem trung binh</span>
              <span className="text-xl font-bold text-blue-700">{avg.toFixed(2)}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-xl">
              <span className="text-xs text-emerald-500 font-semibold block">So mon</span>
              <span className="text-xl font-bold text-emerald-700">{filteredGrades.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 rounded-l-xl">Ma MH</th>
                <th className="px-6 py-4">Ten mon hoc</th>
                <th className="px-6 py-4 text-center">Tin chi</th>
                <th className="px-6 py-4 text-center">Diem</th>
                <th className="px-6 py-4 text-center">Diem chu</th>
                <th className="px-6 py-4 text-center">Hoc ky</th>
                <th className="px-6 py-4 rounded-r-xl text-center">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map((grade) => {
                const score = Number(grade.score || 0);
                const letter = toLetter(score);
                return (
                  <tr key={grade._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">{grade.course?.code || '-'}</td>
                    <td className="px-6 py-5"><p className="text-sm font-bold text-slate-800">{grade.course?.name || '-'}</p></td>
                    <td className="px-6 py-5 text-center text-sm">{grade.course?.credits || '-'}</td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-blue-600">{score.toFixed(1)}</td>
                    <td className="px-6 py-5 text-center"><span className="font-bold text-slate-800">{letter}</span></td>
                    <td className="px-6 py-5 text-center text-sm">{grade.semester || '-'}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${score >= 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {score >= 4 ? 'Dat' : 'Truot'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-blue-600">
          <Info className="w-5 h-5 shrink-0" />
          <p>Diem duoc lay truc tiep tu collection grades trong MongoDB.</p>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;
