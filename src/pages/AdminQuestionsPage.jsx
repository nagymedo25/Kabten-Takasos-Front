import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';

const questionTypes = [
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'true_false', label: 'صح أو خطأ' },
  { value: 'fill_blank', label: 'أكمل الفراغ' },
  { value: 'matching', label: 'توصيل' },
  { value: 'essay', label: 'مقالي' },
];

const departments = [
  { value: 'programming', label: 'البرمجة' },
  { value: 'networks', label: 'الشبكات' },
  { value: 'communications', label: 'الاتصالات' },
];

const emptyQuestion = {
  questionText: '',
  questionType: 'multiple_choice',
  options: ['', '', '', ''],
  correctAnswer: '',
  matchingPairs: [{ left: '', right: '' }],
  department: 'programming',
  topic: '',
  difficulty: 'medium'
};

const AdminQuestionsPage = () => {
  const pageRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyQuestion });
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [filterDept, filterType]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterType) params.type = filterType;
      const { data } = await API.get('/questions', { params });
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.questionText.trim()) {
      toast.error('نص السؤال مطلوب');
      return;
    }
    try {
      if (editingId) {
        await API.put(`/questions/${editingId}`, form);
        toast.success('تم تحديث السؤال');
      } else {
        await API.post('/questions', form);
        toast.success('تم إضافة السؤال');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyQuestion });
      fetchQuestions();
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleEdit = (q) => {
    setForm({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options?.length ? q.options : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      matchingPairs: q.matchingPairs?.length ? q.matchingPairs : [{ left: '', right: '' }],
      department: q.department,
      topic: q.topic || '',
      difficulty: q.difficulty || 'medium'
    });
    setEditingId(q._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
      await API.delete(`/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('تم حذف السؤال');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleDeleteAll = async () => {
    const confirmMsg = filterDept 
      ? `هل أنت متأكد من حذف جميع أسئلة قسم (${deptLabel(filterDept)})؟ لا يمكن التراجع عن هذا الإجراء.`
      : 'هل أنت متأكد من حذف جميع الأسئلة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.';
      
    if (!window.confirm(confirmMsg)) return;
    
    try {
      setLoading(true);
      const params = filterDept ? { department: filterDept } : {};
      const { data } = await API.delete('/questions/bulk/all', { params });
      toast.success(data.message);
      fetchQuestions(); // Refresh list
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف الجماعي');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const opts = [...form.options];
    opts[index] = value;
    setForm({ ...form, options: opts });
  };

  const handleMatchingChange = (index, side, value) => {
    const pairs = [...form.matchingPairs];
    pairs[index] = { ...pairs[index], [side]: value };
    setForm({ ...form, matchingPairs: pairs });
  };

  const addMatchingPair = () => {
    setForm({ ...form, matchingPairs: [...form.matchingPairs, { left: '', right: '' }] });
  };

  const filteredQuestions = questions.filter(q =>
    q.questionText?.toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (type) => questionTypes.find(t => t.value === type)?.label || type;
  const deptLabel = (dept) => departments.find(d => d.value === dept)?.label || dept;

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="section-title mb-1">إدارة الأسئلة</h1>
            <p className="text-dark-400 text-sm font-bold">
              إجمالي الأسئلة المتاحة: <span className="text-emerald-400">{filteredQuestions.length} سؤال</span>
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {filteredQuestions.length > 0 && (
               <button
                 onClick={handleDeleteAll}
                 className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-l from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-md shadow-red-500/20"
               >
                 <FaTrash />
                 مسح الكل
               </button>
            )}
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyQuestion }); }}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <FaPlus />
              إضافة سؤال
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="البحث في الأسئلة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-10"
            />
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="input-field w-auto">
            <option value="">كل الأقسام</option>
            {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-auto">
            <option value="">كل الأنواع</option>
            {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Question Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingId ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h2>
                <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-white">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  placeholder="Question text (English)"
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  dir="ltr"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })} className="input-field">
                    {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field">
                    {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Topic (e.g. OOP, TCP/IP)"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>

                {/* Options for MCQ */}
                {form.questionType === 'multiple_choice' && (
                  <div className="space-y-2">
                    <p className="text-dark-400 text-sm">الخيارات:</p>
                    {form.options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="input-field"
                        dir="ltr"
                      />
                    ))}
                  </div>
                )}

                {/* Matching pairs */}
                {form.questionType === 'matching' && (
                  <div className="space-y-2">
                    <p className="text-dark-400 text-sm">أزواج التوصيل:</p>
                    {form.matchingPairs.map((pair, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder={`Left ${i + 1}`}
                          value={pair.left}
                          onChange={(e) => handleMatchingChange(i, 'left', e.target.value)}
                          className="input-field"
                          dir="ltr"
                        />
                        <input
                          type="text"
                          placeholder={`Right ${i + 1}`}
                          value={pair.right}
                          onChange={(e) => handleMatchingChange(i, 'right', e.target.value)}
                          className="input-field"
                          dir="ltr"
                        />
                      </div>
                    ))}
                    <button onClick={addMatchingPair} className="text-primary-400 text-sm hover:text-primary-300">+ إضافة زوج</button>
                  </div>
                )}

                {/* Correct Answer */}
                {form.questionType !== 'essay' && form.questionType !== 'matching' && (
                  <input
                    type="text"
                    placeholder="Correct Answer"
                    value={form.correctAnswer}
                    onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                    className="input-field"
                    dir="ltr"
                  />
                )}

                <div className="flex gap-3">
                  <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <FaSave />
                    حفظ
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-dark-400 text-lg">لا توجد أسئلة</p>
              </div>
            ) : (
              filteredQuestions.map((q) => (
                <div key={q._id} className="glass-card p-4 flex items-start justify-between gap-4 hover:border-dark-500 transition-all">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-2" dir="ltr">{q.questionText}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-primary-500/15 text-primary-400 text-xs">{typeLabel(q.questionType)}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-dark-700 text-dark-300 text-xs">{deptLabel(q.department)}</span>
                      {q.topic && <span className="px-2 py-0.5 rounded-lg bg-dark-700 text-dark-300 text-xs" dir="ltr">{q.topic}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(q)} className="text-dark-400 hover:text-primary-400 transition-colors"><FaEdit /></button>
                    <button onClick={() => handleDelete(q._id)} className="text-dark-400 hover:text-red-400 transition-colors"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionsPage;
