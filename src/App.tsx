import React, { useState, useMemo } from 'react';
import {
  Star,
  Shield,
  Send,
  UserCheck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Building,
  GraduationCap,
  MessageSquare,
  Download,
  Filter
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type Role = 'student' | 'admin';
type Department = 'Computer Science' | 'Information Technology' | 'Electronics' | 'Mechanical' | 'Civil';

interface FeedbackItem {
  id: string;
  studentId?: string;
  studentName?: string;
  department: Department;
  facultyName: string;
  isAnonymous: boolean;
  ratings: {
    teaching: number;
    curriculum: number;
    infrastructure: number;
    facilities: number;
  };
  comments: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
  timestamp: string;
}

// --- MOCK INITIAL DATA ---
const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'FB-101',
    studentId: 'ST-2024-08',
    studentName: 'Alex Rivera',
    department: 'Computer Science',
    facultyName: 'Dr. Sarah Jenkins',
    isAnonymous: false,
    ratings: { teaching: 5, curriculum: 4, infrastructure: 5, facilities: 4 },
    comments: 'Dr. Jenkins makes Data Structures extremely engaging. Practical lab sessions could use updated RAM.',
    status: 'Reviewed',
    timestamp: '2026-11-08'
  },
  {
    id: 'FB-102',
    department: 'Electronics',
    facultyName: 'Prof. Alan Vance',
    isAnonymous: true,
    ratings: { teaching: 2, curriculum: 3, infrastructure: 2, facilities: 3 },
    comments: 'Lectures are often canceled without prior notice. Lab equipment in VLSI section is outdated.',
    status: 'Pending',
    timestamp: '2026-11-07'
  },
  {
    id: 'FB-103',
    studentId: 'ST-2024-42',
    studentName: 'Maya Lin',
    department: 'Mechanical',
    facultyName: 'Dr. Robert Chen',
    isAnonymous: false,
    ratings: { teaching: 4, curriculum: 5, infrastructure: 4, facilities: 4 },
    comments: 'Great workshop guidance during the thermodynamics project.',
    status: 'Resolved',
    timestamp: '2026-11-05'
  }
];

export default function App() {
  const [role, setRole] = useState<Role>('student');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  
  // Student Form State
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science');
  const [facultyName, setFacultyName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ratings, setRatings] = useState({
    teaching: 0,
    curriculum: 0,
    infrastructure: 0,
    facilities: 0
  });
  const [comments, setComments] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Admin Filter State
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Handle Star Rating Click
  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  // Submit Feedback
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratings.teaching === 0 || ratings.curriculum === 0) {
      alert('Please provide at least Teaching and Curriculum ratings.');
      return;
    }

    const newEntry: FeedbackItem = {
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      studentId: isAnonymous ? undefined : studentId || 'ST-2024-NEW',
      studentName: isAnonymous ? undefined : studentName || 'Anonymous Student',
      department,
      facultyName: facultyName || 'General Department',
      isAnonymous,
      ratings,
      comments,
      status: 'Pending',
      timestamp: new Date().toISOString().split('T')[0]
    };

    setFeedbackList([newEntry, ...feedbackList]);
    setSubmitSuccess(true);
    
    // Reset Form
    setRatings({ teaching: 0, curriculum: 0, infrastructure: 0, facilities: 0 });
    setComments('');
    setFacultyName('');
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  // Update Status (Admin)
  const handleStatusChange = (id: string, newStatus: FeedbackItem['status']) => {
    setFeedbackList(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // Calculate Overall Averages
  const metrics = useMemo(() => {
    const total = feedbackList.length;
    if (total === 0) return { avg: '0.0', teaching: '0.0', infra: '0.0', pending: 0 };

    let sumOverall = 0;
    let sumTeaching = 0;
    let sumInfra = 0;
    let pendingCount = 0;

    feedbackList.forEach(item => {
      const itemAvg = (item.ratings.teaching + item.ratings.curriculum + item.ratings.infrastructure + item.ratings.facilities) / 4;
      sumOverall += itemAvg;
      sumTeaching += item.ratings.teaching;
      sumInfra += item.ratings.infrastructure;
      if (item.status === 'Pending') pendingCount++;
    });

    return {
      avg: (sumOverall / total).toFixed(1),
      teaching: (sumTeaching / total).toFixed(1),
      infra: (sumInfra / total).toFixed(1),
      pending: pendingCount
    };
  }, [feedbackList]);

  // Filtered List for Admin
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(item => {
      const matchDept = selectedDept === 'All' || item.department === selectedDept;
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
      return matchDept && matchStatus;
    });
  }, [feedbackList, selectedDept, selectedStatus]);

  // Download Report CSV Simulation
  const exportCSV = () => {
    const headers = ['ID,Department,Faculty,Teaching,Curriculum,Infra,Facilities,Status,Date\n'];
    const rows = feedbackList.map(
      f => `${f.id},"${f.department}","${f.facultyName}",${f.ratings.teaching},${f.ratings.curriculum},${f.ratings.infrastructure},${f.ratings.facilities},${f.status},${f.timestamp}`
    );
    const blob = new Blob([...headers, ...rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `college-feedback-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* --- HEADER NAVBAR --- */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">EduPulse</h1>
              <p className="text-xs text-slate-400">College Feedback Management System</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setRole('student')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                role === 'student' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                role === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'student' ? (
          /* =========================================================
                             STUDENT FEEDBACK PORTAL
             ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Submit Academic Feedback
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your feedback drives quality enhancements across faculties and campus infrastructure.
                </p>
              </div>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Feedback Submitted Successfully!</p>
                    <p className="text-xs text-emerald-700">Thank you for helping us improve our institutional standards.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Anonymous Toggle */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className={`w-5 h-5 ${isAnonymous ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Submit Anonymously</p>
                      <p className="text-xs text-slate-500">Hide your student identity from reviewers & faculty.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Identity Fields (Hidden if Anonymous) */}
                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ST-2024-89"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Department & Faculty Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Department *
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value as Department)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Faculty / Course Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Sarah Jenkins (DBMS)"
                      value={facultyName}
                      onChange={e => setFacultyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Star Ratings Grid */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Evaluation Metrics</h3>

                  {[
                    { key: 'teaching', label: 'Faculty Teaching & Clarity' },
                    { key: 'curriculum', label: 'Course Content & Relevance' },
                    { key: 'infrastructure', label: 'Classroom & Lab Infrastructure' },
                    { key: 'facilities', label: 'General Facilities (Library, Wi-Fi)' }
                  ].map(cat => (
                    <div key={cat.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition">
                      <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                      <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(cat.key as keyof typeof ratings, star)}
                            className="p-1 focus:outline-none transition hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= ratings[cat.key as keyof typeof ratings]
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="w-8 text-right text-xs font-bold text-slate-500 ml-2">
                          {ratings[cat.key as keyof typeof ratings] || 0}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Comments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Detailed Remarks / Suggestions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed feedback or actionable recommendations..."
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </button>
              </form>
            </div>

            {/* Sidebar Guidelines & Recent Activity */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center space-x-2 text-blue-400 mb-3">
                  <Shield className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">Privacy Guarantee</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Honest Feedback Matters</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When you check "Submit Anonymously", your student ID and name are entirely stripped from the record.
                  Faculties only see constructive ratings and aggregated insights.
                </p>
              </div>

              {/* History Tracker */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Recent Submissions</span>
                  <span className="text-xs bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full font-semibold">
                    {feedbackList.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {feedbackList.slice(0, 3).map(item => (
                    <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">{item.department}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'Reviewed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.comments || 'No remarks provided.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
                             ADMIN DASHBOARD & ANALYTICS
             ========================================================= */
          <div className="space-y-8">
            {/* Executive KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Overall Rating</p>
                  <h4 className="text-2xl font-bold text-slate-900">{metrics.avg} / 5.0</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Teaching Score</p>
                  <h4 className="text-2xl font-bold text-slate-900">{metrics.teaching} / 5.0</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Infrastructure Score</p>
                  <h4 className="text-2xl font-bold text-slate-900">{metrics.infra} / 5.0</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Pending Actions</p>
                  <h4 className="text-2xl font-bold text-slate-900">{metrics.pending}</h4>
                </div>
              </div>
            </div>

            {/* Filter Toolbar & CSV Export */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-slate-500 text-sm font-semibold mr-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters:</span>
                </div>

                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <button
                onClick={exportCSV}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Report (.CSV)</span>
              </button>
            </div>

            {/* Detailed Submissions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Student Feedback Submissions</h3>
                <span className="text-xs font-medium text-slate-500">Showing {filteredFeedback.length} entries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-6">ID & Date</th>
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-6">Department & Faculty</th>
                      <th className="py-3.5 px-6">Ratings</th>
                      <th className="py-3.5 px-6">Comments</th>
                      <th className="py-3.5 px-6">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredFeedback.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No feedback entries match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredFeedback.map(item => {
                        const avgRating = (
                          (item.ratings.teaching +
                            item.ratings.curriculum +
                            item.ratings.infrastructure +
                            item.ratings.facilities) /
                          4
                        ).toFixed(1);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-4 px-6">
                              <span className="font-mono text-xs font-semibold text-slate-700">{item.id}</span>
                              <div className="text-[11px] text-slate-400">{item.timestamp}</div>
                            </td>

                            <td className="py-4 px-6">
                              {item.isAnonymous ? (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                  <Shield className="w-3 h-3" />
                                  <span>Anonymous</span>
                                </span>
                              ) : (
                                <div>
                                  <p className="font-semibold text-slate-900 text-xs">{item.studentName}</p>
                                  <p className="text-[11px] text-slate-400">{item.studentId}</p>
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <p className="font-medium text-slate-800 text-xs">{item.department}</p>
                              <p className="text-[11px] text-slate-500">{item.facultyName}</p>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-slate-800 text-xs">{avgRating}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Teach: {item.ratings.teaching} | Infra: {item.ratings.infrastructure}
                              </div>
                            </td>

                            <td className="py-4 px-6 max-w-xs">
                              <p className="text-xs text-slate-600 line-clamp-2">{item.comments || '—'}</p>
                            </td>

                            <td className="py-4 px-6">
                              <select
                                value={item.status}
                                onChange={e => handleStatusChange(item.id, e.target.value as FeedbackItem['status'])}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  item.status === 'Resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : item.status === 'Reviewed'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}