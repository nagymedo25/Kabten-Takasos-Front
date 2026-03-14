import { useState, useRef, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { FaRobot, FaPaperPlane, FaCheck, FaSave, FaSpinner, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

const departments = [
  { value: 'programming', label: 'البرمجة' },
  { value: 'networks', label: 'الشبكات' },
  { value: 'communications', label: 'الاتصالات' },
];

const typeLabels = {
  multiple_choice: 'اختيار من متعدد',
  true_false: 'صح أو خطأ',
  fill_blank: 'أكمل الفراغ',
  matching: 'توصيل',
  essay: 'مقالي',
};

const AdminAIImportPage = () => {
  const pageRef = useRef(null);
  const [text, setText] = useState('');
  const [department, setDepartment] = useState('programming');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('input'); // input | preview

  // Edit Modal State
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ai-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (step === 'preview' && parsedQuestions.length > 0) {
      gsap.fromTo('.preview-item', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, [step, parsedQuestions]);

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }
    if (text.trim().length < 50) {
      toast.error('النص قصير جداً. أدخل نصاً يحتوي على أسئلة');
      return;
    }

    setParsing(true);
    try {
      const { data } = await API.post('/ai-import/parse', { text, department });
      if (data.questions && data.questions.length > 0) {
        setParsedQuestions(data.questions);
        setStep('preview');
        toast.success(`تم تحليل ${data.count} سؤال بنجاح! 🎉`);
      } else {
        toast.error('لم يتم العثور على أسئلة في النص');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في التحليل');
    } finally {
      setParsing(false);
    }
  };

  const removeQuestion = (index) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setEditFormData({ ...parsedQuestions[index] });
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...(editFormData.options || [])];
    newOptions[idx] = value;
    setEditFormData(prev => ({ ...prev, options: newOptions }));
  };

  const saveEdit = () => {
    const updated = [...parsedQuestions];
    updated[editingIndex] = editFormData;
    setParsedQuestions(updated);
    setEditingIndex(null);
    setEditFormData(null);
    toast.success('تم تحديث السؤال في المسودة');
  };

  const handleSave = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('لا توجد أسئلة لحفظها');
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.post('/questions/bulk', { questions: parsedQuestions });
      toast.success(`تم حفظ ${data.count} سؤال في قاعدة البيانات! ✅`);
      setParsedQuestions([]);
      setText('');
      setStep('input');
    } catch (error) {
      toast.error('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={pageRef} className="page-container bg-mesh relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-l from-purple-500 to-pink-600 text-white text-sm font-bold mb-4 shadow-lg shadow-purple-500/25">
            <FaRobot />
            مدعوم بالذكاء الاصطناعي
          </div>
          <h1 className="section-title">استيراد الأسئلة بالذكاء الاصطناعي</h1>
          <p className="text-dark-400">الصق نص بنك الأسئلة وسيقوم الذكاء الاصطناعي بتحليله واستخراج الأسئلة تلقائياً</p>
        </div>

        {step === 'input' ? (
          <div className="ai-card glass-card p-6 space-y-6">
            {/* Department */}
            <div>
              <label className="block text-dark-300 text-sm font-bold mb-2">القسم:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field">
                {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-dark-300 text-sm font-bold mb-2">نص بنك الأسئلة (باللغة الإنجليزية):</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your question bank text here...&#10;&#10;Example:&#10;1. What is an operating system?&#10;a) A hardware device&#10;b) A software that manages computer hardware&#10;c) A type of virus&#10;d) A programming language&#10;Answer: b&#10;&#10;2. True or False: HTTP is a stateless protocol.&#10;Answer: True"
                rows={15}
                className="input-field resize-none font-mono text-sm"
                dir="ltr"
              />
              <p className="text-dark-500 text-xs mt-2">عدد الأحرف: {text.length}</p>
            </div>

            {/* Parse Button */}
            <button
              onClick={handleParse}
              disabled={parsing}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4"
            >
              {parsing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  جاري التحليل بالذكاء الاصطناعي...
                </>
              ) : (
                <>
                  <FaRobot />
                  تحليل واستخراج الأسئلة
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Header */}
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">معاينة الأسئلة المستخرجة</h2>
                <p className="text-dark-400 text-sm">تم استخراج {parsedQuestions.length} سؤال - راجعها قبل الحفظ</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('input')} className="btn-secondary">
                  رجوع
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  حفظ الكل
                </button>
              </div>
            </div>

            {/* Questions Preview */}
            <div className="space-y-3">
              {parsedQuestions.map((q, i) => (
                <div key={i} className="preview-item glass-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-lg bg-primary-500/15 text-primary-400 text-xs font-bold">
                          #{i + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-dark-700 text-dark-300 text-xs">
                          {typeLabels[q.questionType] || q.questionType}
                        </span>
                        {q.topic && (
                          <span className="px-2 py-0.5 rounded-lg bg-dark-700 text-dark-300 text-xs" dir="ltr">
                            {q.topic}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-xs ${
                          q.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                          q.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'hard' ? 'صعب' : 'متوسط'}
                        </span>
                      </div>
                      <p className="text-white text-sm whitespace-pre-line" dir="ltr">{q.questionText}</p>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {q.options.map((opt, oi) => (
                            <span key={oi} className={`px-3 py-1 rounded-lg text-xs ${
                              opt === q.correctAnswer ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-dark-700 text-dark-300'
                            }`} dir="ltr">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Correct answer for non-MCQ, non-Matching */}
                      {q.correctAnswer && q.questionType !== 'multiple_choice' && q.questionType !== 'matching' && (
                        <p className="mt-2 text-emerald-400 text-xs" dir="ltr">
                          ✓ Answer: {q.correctAnswer}
                        </p>
                      )}

                      {/* Matching Pairs Preview */}
                      {q.questionType === 'matching' && q.matchingPairs && q.matchingPairs.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.matchingPairs.map((pair, pIdx) => (
                            <div key={pIdx} className="bg-dark-800 p-2 rounded-lg border border-dark-600 flex justify-between gap-2" dir="ltr">
                              <span className="font-bold text-dark-200 truncate flex-1">{pair.left}</span>
                              <span className="text-primary-400">→</span>
                              <span className="text-dark-300 truncate flex-1">{pair.right}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Explanation preview if any */}
                      {q.explanation && (
                        <div className="mt-2 p-2 bg-dark-800 rounded-lg border border-dark-600">
                          <p className="text-xs text-dark-400 mb-1">الشرح:</p>
                          <p className="text-xs text-dark-300" dir="ltr">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-1">
                      <button onClick={() => openEditModal(i)} className="text-dark-400 hover:text-primary-400 transition-colors bg-dark-800 p-2 rounded-lg" title="تعديل">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => removeQuestion(i)} className="text-dark-400 hover:text-red-400 transition-colors bg-dark-800 p-2 rounded-lg" title="حذف">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaEdit className="text-primary-400" />
                تعديل السؤال #{editingIndex + 1}
              </h3>
              <button 
                onClick={() => { setEditingIndex(null); setEditFormData(null); }}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">نص السؤال</label>
                <textarea
                  value={editFormData.questionText}
                  onChange={(e) => handleEditChange('questionText', e.target.value)}
                  className="input-field min-h-[100px]"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-bold mb-2">نوع السؤال</label>
                  <select 
                    value={editFormData.questionType} 
                    onChange={(e) => handleEditChange('questionType', e.target.value)}
                    className="input-field"
                  >
                    {Object.entries(typeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-bold mb-2">الصعوبة</label>
                  <select 
                    value={editFormData.difficulty || 'medium'} 
                    onChange={(e) => handleEditChange('difficulty', e.target.value)}
                    className="input-field"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
              </div>

              {editFormData.questionType === 'multiple_choice' && (
                <div className="space-y-3">
                  <label className="block text-dark-300 text-sm font-bold border-b border-dark-700 pb-2">الخيارات (اختيار من متعدد)</label>
                  {(editFormData.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                       <input
                        type="radio"
                        name="correctAnswer"
                        checked={editFormData.correctAnswer === opt && opt !== ''}
                        onChange={() => handleEditChange('correctAnswer', opt)}
                        className="w-4 h-4 text-primary-500"
                        title="تعيين كإجابة صحيحة"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className={`input-field flex-1 ${editFormData.correctAnswer === opt ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                        dir="ltr"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-dark-400 mt-1">💡 حدد الزر الدائري بجوار الخيار لتعيينه كالإجابة الصحيحة.</p>
                </div>
              )}

              {editFormData.questionType === 'matching' && (
                <div className="space-y-3">
                  <label className="block text-dark-300 text-sm font-bold border-b border-dark-700 pb-2">عناصر التوصيل (Matching Pairs)</label>
                  {(editFormData.matchingPairs || []).map((pair, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={pair.left || ''}
                        onChange={(e) => {
                           const newPairs = [...(editFormData.matchingPairs || [])];
                           newPairs[idx] = { ...newPairs[idx], left: e.target.value };
                           handleEditChange('matchingPairs', newPairs);
                        }}
                        className="input-field flex-1"
                        placeholder="Term (الكلمة)"
                        dir="ltr"
                      />
                      <input
                        type="text"
                        value={pair.right || ''}
                        onChange={(e) => {
                           const newPairs = [...(editFormData.matchingPairs || [])];
                           newPairs[idx] = { ...newPairs[idx], right: e.target.value };
                           handleEditChange('matchingPairs', newPairs);
                        }}
                        className="input-field flex-1"
                        placeholder="Definition (التعريف)"
                        dir="ltr"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-dark-400 mt-1">💡 تأكد من كتابة الكلمة في الخانة اليسرى وتعريفها المطابق في اليمنى.</p>
                </div>
              )}

              {editFormData.questionType !== 'multiple_choice' && editFormData.questionType !== 'matching' && (
                <div>
                  <label className="block text-dark-300 text-sm font-bold mb-2">الإجابة الصحيحة</label>
                  <input
                    type="text"
                    value={editFormData.correctAnswer || ''}
                    onChange={(e) => handleEditChange('correctAnswer', e.target.value)}
                    className="input-field"
                    dir="ltr"
                  />
                </div>
              )}

              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">الشرح والتوضيح (اختياري)</label>
                <textarea
                  value={editFormData.explanation || ''}
                  onChange={(e) => handleEditChange('explanation', e.target.value)}
                  className="input-field min-h-[80px]"
                  placeholder="شرح إضافي يظهر للطالب عند مراجعة الإجابة..."
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">الموضوع (Topic)</label>
                <input
                  type="text"
                  value={editFormData.topic || ''}
                  onChange={(e) => handleEditChange('topic', e.target.value)}
                  className="input-field"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-dark-700 bg-dark-800/50 flex justify-end gap-3">
              <button onClick={() => { setEditingIndex(null); setEditFormData(null); }} className="btn-secondary">إلغاء</button>
              <button onClick={saveEdit} className="btn-primary flex items-center gap-2">
                <FaCheck />
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAIImportPage;
