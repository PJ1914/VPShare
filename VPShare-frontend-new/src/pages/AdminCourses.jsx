import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/courseService';
import TiptapEditor from '../components/editor/TiptapEditor';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Eye,
    GripVertical,
    Loader2,
    MoreVertical,
    Plus,
    Save,
    Trash2
} from 'lucide-react';

const emptyDoc = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
};

const AdminCourses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingCourse, setSavingCourse] = useState(false);
    const [creatingLesson, setCreatingLesson] = useState(false);

    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        isPremium: false,
        price: 0,
        status: 'draft',
        thumbnailUrl: ''
    });

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [syllabus, setSyllabus] = useState([]);
    const [draggingId, setDraggingId] = useState(null);

    const [savingDraft, setSavingDraft] = useState(false);
    const [autoSaveMessage, setAutoSaveMessage] = useState('');
    const [editorContent, setEditorContent] = useState(emptyDoc);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await courseService.listCourses();
                setCourses(data || []);
            } catch (err) {
                console.error('Failed to load courses', err);
                setError(err.message || 'Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // REMOVED: useEffect for selectedLesson sync to avoid overwriting editor state on title change
    // Content sync is now handled in fetchLesson and handleAddLesson

    useEffect(() => {
        if (!selectedLessonId || !editorContent) return;
        const interval = setInterval(async () => {
            try {
                setSavingDraft(true);
                await courseService.updateLessonDraft(selectedLessonId, {
                    draft_content: editorContent,
                    title: selectedLesson?.title || ''
                });
                setAutoSaveMessage('Saved');
                setTimeout(() => setAutoSaveMessage(''), 2000);
            } catch (err) {
                console.error('Autosave failed', err);
                setAutoSaveMessage('Autosave failed');
            } finally {
                setSavingDraft(false);
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [selectedLessonId, editorContent, selectedLesson]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSavingCourse(true);
        setError('');
        try {
            const data = await courseService.createCourse({
                ...courseForm,
                authorId: user.uid
            });
            setCourses(prev => [data, ...prev]);
            setCourseForm({ title: '', description: '', isPremium: false, price: 0, status: 'draft', thumbnailUrl: '' });
        } catch (err) {
            console.error('Create course failed', err);
            setError(err.message || 'Failed to create course');
        } finally {
            setSavingCourse(false);
        }
    };

    const selectCourse = async (courseId) => {
        setSelectedLessonId(null);
        setSelectedLesson(null);
        if (!courseId) return;
        const course = await courseService.getCourseById(courseId);
        setEditorContent(emptyDoc);
        setSelectedCourse(course);
        setSyllabus(course?.syllabus || []);
    };

    const handleAddLesson = async (title) => {
        if (!selectedCourse) return;
        setCreatingLesson(true);
        setError('');
        try {
            const { lessonId, syllabusEntry } = await courseService.addLesson(selectedCourse.id, title);
            const updated = [...(syllabus || []), syllabusEntry];
            setSyllabus(updated);
            setSelectedCourse(prev => prev ? { ...prev, syllabus: updated } : prev);
            setSelectedLessonId(lessonId);
            setEditorContent(emptyDoc);
            const newLesson = await courseService.getLessonById(lessonId);
            setSelectedLesson(newLesson);
        } catch (err) {
            console.error('Add lesson failed', err);
            setError(err.message || 'Failed to add lesson');
        } finally {
            setCreatingLesson(false);
        }
    };

    const fetchLesson = async (lessonId) => {
        const lesson = await courseService.getLessonById(lessonId);
        setEditorContent(lesson.draft_content || emptyDoc);
        setSelectedLesson(lesson);
        setSelectedLessonId(lessonId);
    };

    const onDragStart = (id) => setDraggingId(id);
    const onDragEnter = (id) => {
        if (!draggingId || draggingId === id) return;
        const current = [...syllabus];
        const from = current.findIndex(i => i.id === draggingId);
        const to = current.findIndex(i => i.id === id);
        if (from === -1 || to === -1) return;
        const [item] = current.splice(from, 1);
        current.splice(to, 0, item);
        setSyllabus(current);
    };
    const onDragEnd = async () => {
        if (!draggingId || !selectedCourse) return;
        try {
            await courseService.reorderSyllabus(selectedCourse.id, syllabus);
        } catch (err) {
            console.error('Reorder failed', err);
        }
        setDraggingId(null);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!courseId) return;
        const ok = window.confirm('Delete this course and all its lessons?');
        if (!ok) return;
        try {
            await courseService.deleteCourse(courseId);
            setCourses(prev => prev.filter(c => c.id !== courseId));
            if (selectedCourse?.id === courseId) {
                setSelectedCourse(null);
                setSyllabus([]);
                setSelectedLesson(null);
                setSelectedLessonId(null);
            }
        } catch (err) {
            console.error('Delete course failed', err);
            setError(err.message || 'Failed to delete course');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!selectedCourse || !lessonId) return;
        const ok = window.confirm('Delete this lesson?');
        if (!ok) return;
        try {
            await courseService.deleteLesson(selectedCourse.id, lessonId);
            const updated = (syllabus || []).filter(s => s.id !== lessonId);
            setSyllabus(updated);
            setSelectedCourse(prev => prev ? { ...prev, syllabus: updated } : prev);
            if (selectedLessonId === lessonId) {
                setSelectedLessonId(null);
                setSelectedLesson(null);
            }
        } catch (err) {
            console.error('Delete lesson failed', err);
            setError(err.message || 'Failed to delete lesson');
        }
    };

    const handleSaveLesson = async () => {
        if (!selectedLessonId) return;
        setSavingDraft(true);
        try {
            await courseService.updateLessonDraft(selectedLessonId, {
                draft_content: editorContent,
                title: selectedLesson?.title || ''
            });
            setAutoSaveMessage('Saved');
            setTimeout(() => setAutoSaveMessage(''), 2000);
        } catch (err) {
            console.error('Save lesson failed', err);
            setError(err.message || 'Failed to save lesson');
        } finally {
            setSavingDraft(false);
        }
    };

    const handlePublishLesson = async () => {
        if (!selectedLessonId) return;
        try {
            await courseService.publishLesson(selectedLessonId);
            setAutoSaveMessage('Published');
        } catch (err) {
            console.error('Publish failed', err);
            setError(err.message || 'Failed to publish');
        }
    };

    const handleToggleFree = async (lessonId) => {
        if (!selectedCourse) return;
        const updated = (syllabus || []).map(item => item.id === lessonId ? { ...item, isFree: !item.isFree } : item);
        setSyllabus(updated);
        setSelectedCourse(prev => prev ? { ...prev, syllabus: updated } : prev);
        try {
            await courseService.reorderSyllabus(selectedCourse.id, updated);
        } catch (err) {
            console.error('Toggle free failed', err);
        }
    };

    const handleLessonTitleChange = (lessonId, title) => {
        setSyllabus(prev => prev.map(item => item.id === lessonId ? { ...item, title } : item));
        if (selectedLessonId === lessonId) {
            setSelectedLesson(prev => prev ? { ...prev, title } : prev);
        }
    };

    const LessonList = useMemo(() => (
        <div className="space-y-2">
            {(syllabus || []).map(item => (
                <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-900 ${selectedLessonId === item.id ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-800'}`}
                    draggable
                    onDragStart={() => onDragStart(item.id)}
                    onDragEnter={() => onDragEnter(item.id)}
                    onDragEnd={onDragEnd}
                >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <input
                        className="flex-1 bg-transparent focus:outline-none text-sm"
                        value={item.title}
                        onChange={(e) => handleLessonTitleChange(item.id, e.target.value)}
                    />
                    <button
                        onClick={() => handleToggleFree(item.id)}
                        className={`text-xs px-2 py-1 rounded ${item.isFree ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        {item.isFree ? 'Free' : 'Locked'}
                    </button>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => fetchLesson(item.id)} className="px-3">
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteLesson(item.id)} className="px-3">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    ), [syllabus, selectedLessonId]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Manager</h1>
                    
                    {selectedCourse && (
                        <Button 
                            variant="outline" 
                            onClick={() => window.open(`/courses/${selectedCourse.id}/learn`, '_blank')} 
                            className="ml-auto flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            Student Preview
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Create Course</span>
                                {savingCourse && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Title"
                                value={courseForm.title}
                                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                placeholder="Course title"
                            />
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    className="w-full mt-2 rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-sm"
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Price"
                                    type="number"
                                    value={courseForm.price}
                                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                                />
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={courseForm.isPremium}
                                            onChange={(e) => setCourseForm({ ...courseForm, isPremium: e.target.checked })}
                                        />
                                        Premium
                                    </label>
                                </div>
                            </div>
                            <Input
                                label="Thumbnail URL"
                                value={courseForm.thumbnailUrl}
                                onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                                placeholder="https://..."
                            />
                            <div className="flex gap-3">
                                <select
                                    value={courseForm.status}
                                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 text-sm"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                                <Button onClick={handleCreateCourse} disabled={savingCourse} className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Courses</span>
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {courses.length === 0 && !loading && (
                                <p className="text-gray-500 text-sm">No courses yet.</p>
                            )}
                            <div className="grid md:grid-cols-2 gap-3">
                                {courses.map(course => (
                                    <div
                                        key={course.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition ${selectedCourse?.id === course.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800'}`}
                                        onClick={() => selectCourse(course.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    {course.status === 'published' ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                    )}
                                                    <span className="capitalize">{course.status || 'draft'}</span>
                                                    {course.isPremium && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">Premium</span>}
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {selectedCourse && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Syllabus</span>
                                    <Button size="sm" onClick={() => handleAddLesson('New Lesson')} disabled={creatingLesson} className="flex items-center gap-2">
                                        {creatingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {LessonList}
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Lesson Editor</span>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        {savingDraft && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {autoSaveMessage}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!selectedLessonId && (
                                    <p className="text-gray-500 text-sm">Select a lesson to edit</p>
                                )}

                                {selectedLessonId && (
                                    <>
                                        <Input
                                            label="Lesson Title"
                                            value={selectedLesson?.title || ''}
                                            onChange={(e) => {
                                                const title = e.target.value;
                                                setSelectedLesson(prev => prev ? { ...prev, title } : prev);
                                                handleLessonTitleChange(selectedLessonId, title);
                                            }}
                                        />
                                        <TiptapEditor
                                            key={selectedLessonId}
                                            content={editorContent}
                                            onChange={(content) => setEditorContent(content)}
                                            editable={true}
                                            placeholder="Start writing your lesson content..."
                                        />
                                        <div className="flex flex-wrap gap-3">
                                            <Button onClick={handleSaveLesson} disabled={savingDraft} className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                Save now
                                            </Button>
                                            <Button variant="outline" onClick={handlePublishLesson} className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Publish
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
