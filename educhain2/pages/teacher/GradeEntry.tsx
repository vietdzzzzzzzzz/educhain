import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, gradeAPI } from '../../services/api';
import { Users, ChevronLeft, Search, Save, FileSpreadsheet, CheckCircle2, ArrowRight, Info } from 'lucide-react';

type ScoreRow = {
  gradeId?: string;
  studentId: string;
  score: number | '';
};

const GradeEntry: React.FC = () => {
  const { user } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, ScoreRow>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('2025-2026.1');

  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const courses = await courseAPI.getAll();
        setTeacherCourses(courses.filter((c: any) => (c.teacher?._id || c.teacher) === user.id));
      } catch (error) {
        console.error('Load courses failed:', error);
        setTeacherCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [user?.id]);

  useEffect(() => {
    const loadSelectedCourse = async () => {
      if (!selectedCourse) return;
      try {
        const courseId = selectedCourse._id || selectedCourse.id;
        const [courseData, gradeData] = await Promise.all([
          courseAPI.getById(courseId),
          gradeAPI.getByCourse(courseId)
        ]);
        const listStudents = courseData.students || [];
        setStudents(listStudents);

        const nextMap: Record<string, ScoreRow> = {};
        listStudents.forEach((s: any) => {
          const g = gradeData.find((x: any) => (x.student?._id || x.student) === s._id);
          nextMap[s._id] = {
            gradeId: g?._id,
            studentId: s._id,
            score: g?.score ?? ''
          };
        });
        setGradesMap(nextMap);
      } catch (error) {
        console.error('Load selected course failed:', error);
        setStudents([]);
        setGradesMap({});
      }
    };
    loadSelectedCourse();
  }, [selectedCourse]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s: any) => (s.fullName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q));
  }, [students, searchTerm]);

  const handleScoreChange = (studentId: string, value: string) => {
    const parsed = value === '' ? '' : Math.min(10, Math.max(0, Number(value)));
    setGradesMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], score: parsed } }));
  };

  const toLetter = (score: number) => (score >= 8.5 ? 'A' : score >= 7 ? 'B' : score >= 5.5 ? 'C' : score >= 4 ? 'D' : 'F');

  const handleSave = async () => {
    if (!selectedCourse) return;
    const courseId = selectedCourse._id || selectedCourse.id;
    try {
      const tasks = Object.values(gradesMap)
        .filter((row) => row.score !== '')
        .map((row) => {
          const payload = {
            student: row.studentId,
            course: courseId,
            score: Number(row.score),
            semester
          };
          return row.gradeId ? gradeAPI.update(row.gradeId, payload) : gradeAPI.create(payload);
        });
      await Promise.all(tasks);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Save grades failed:', error);
      alert('Khong luu duoc bang diem. Vui long kiem tra server.');
    }
  };

  if (loading) return <div className="text-slate-500 font-medium">Dang tai du lieu...</div>;

  if (!selectedCourse) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Nhap diem sinh vien</h1>
          <p className="text-slate-500 mt-1">Chon mot lop hoc de bat dau nhap diem tu du lieu that.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherCourses.map((course) => {
            const courseId = course._id || course.id;
            return (
              <button
                key={courseId}
                onClick={() => setSelectedCourse(course)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{course.semester || 'N/A'}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.name}</h3>
                <p className="text-slate-500 text-sm font-medium mb-auto">{course.code} • {course.credits} Tin chi</p>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{(course.students || []).length} SV</span>
                  <div className="text-blue-600 font-bold text-sm flex items-center gap-1">
                    Bat dau nhap
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <nav className="flex items-center gap-2 text-sm">
        <button onClick={() => setSelectedCourse(null)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Quay lai danh sach
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-800">Nhap diem: {selectedCourse.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{selectedCourse.name}</h1>
            <p className="text-slate-500 font-medium">Lop: {selectedCourse.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm w-40"
            placeholder="Hoc ky"
          />
          <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm flex items-center gap-2 shadow-lg shadow-blue-100">
            <Save className="w-4 h-4" />
            Luu bang diem
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-bold">Da luu bang diem thanh cong!</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tim ten hoac email sinh vien..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Sinh vien</th>
                <th className="px-6 py-4 text-center">Diem (0-10)</th>
                <th className="px-6 py-4 text-center">Diem chu</th>
                <th className="px-8 py-4 text-center">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student: any) => {
                const row = gradesMap[student._id];
                const score = row?.score === '' ? null : Number(row?.score ?? 0);
                return (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-bold text-slate-800">{student.fullName}</p>
                          <p className="text-xs font-semibold text-slate-400">{student.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="w-20 h-10 text-center bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        value={row?.score ?? ''}
                        onChange={(e) => handleScoreChange(student._id, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded font-black text-slate-700">{score === null ? '-' : toLetter(score)}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {score === null ? (
                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Chua co diem</span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${score >= 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {score >= 4 ? 'Dat' : 'Truot'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-start gap-4">
          <Info className="w-5 h-5 text-blue-500 mt-1" />
          <div className="text-sm text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-700 mb-1">Quy dinh:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Nhap mot diem tong ket duy nhat theo thang 10.</li>
              <li>He thong luu vao collection grades theo tung sinh vien - hoc phan.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeEntry;
