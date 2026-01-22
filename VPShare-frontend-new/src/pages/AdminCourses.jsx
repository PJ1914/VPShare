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
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
    Settings
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
    const [tagInput, setTagInput] = useState('');

    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        isPremium: false,
        price: 0,
        status: 'draft',
        thumbnailUrl: '',
        tags: []
    });

    // Editing Course Settings
    const [editCourseForm, setEditCourseForm] = useState(null);
    const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [syllabus, setSyllabus] = useState([]);
    const [draggingId, setDraggingId] = useState(null);

    const [savingDraft, setSavingDraft] = useState(false);
    const [autoSaveMessage, setAutoSaveMessage] = useState('');
    const [editorContent, setEditorContent] = useState(emptyDoc);

    // Lesson menu state
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuId]);

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
        
        if (!courseForm.title.trim() || !courseForm.description.trim()) {
            setError('Title and Description are required.');
            return;
        }

        setSavingCourse(true);
        setError('');
        try {
            const data = await courseService.createCourse({
                ...courseForm,
                authorId: user.uid
            });
            setCourses(prev => [data, ...prev]);
            setCourseForm({ title: '', description: '', isPremium: false, price: 0, status: 'draft', thumbnailUrl: '', tags: [] });
            setTagInput('');
        } catch (err) {
            console.error('Create course failed', err);
            setError(err.message || 'Failed to create course');
        } finally {
            setSavingCourse(false);
        }
    };

    const handleUpdateCourseMetadata = async () => {
        if (!editCourseForm || !selectedCourse) return;
        setIsUpdatingCourse(true);
        try {
            await courseService.updateCourse(selectedCourse.id, editCourseForm);
            
            // Update local state
            const updated = { ...selectedCourse, ...editCourseForm };
            setSelectedCourse(updated);
            setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
            
            setAutoSaveMessage('Course settings saved');
            setTimeout(() => setAutoSaveMessage(''), 2000);
        } catch (err) {
            console.error('Failed to update course', err);
            setError('Failed to update course settings');
        } finally {
            setIsUpdatingCourse(false);
        }
    };

    const selectCourse = async (courseId) => {
        setSelectedLessonId(null);
        setSelectedLesson(null);
        if (!courseId) return;
        const course = await courseService.getCourseById(courseId);
        setEditorContent(emptyDoc);
        setSelectedCourse(course);
        // Initialize edit form with current course data
        setEditCourseForm({
            title: course.title,
            description: course.description,
            isPremium: course.isPremium,
            status: course.status,
            thumbnailUrl: course.thumbnailUrl,
            tags: course.tags || []
        });
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

    const handleAddTag = (tag) => {
        if (!tag) return;
        const currentTags = courseForm.tags || [];
        if (!currentTags.includes(tag)) {
            setCourseForm(prev => ({ ...prev, tags: [...currentTags, tag] }));
        }
        setTagInput('');
    };

    const handleRemoveTag = (tag) => {
        setCourseForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
    };
    
    // Tag handlers for edit form
    const handleEditAddTag = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            e.preventDefault();
            const tag = e.target.value;
            const current = editCourseForm.tags || [];
            if (!current.includes(tag)) {
                setEditCourseForm(prev => ({ ...prev, tags: [...current, tag] }));
            }
            e.target.value = '';
        }
    };
    
    const handleEditRemoveTag = (tag) => {
        setEditCourseForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
    };

    const startEditingLesson = (lessonId, currentTitle) => {
        setEditingLessonId(lessonId);
        setEditingTitle(currentTitle);
        setOpenMenuId(null);
    };

    const saveEditingLesson = async () => {
        if (!editingLessonId || !editingTitle.trim()) return;
        handleLessonTitleChange(editingLessonId, editingTitle);
        if (selectedCourse) {
            try {
                await courseService.reorderSyllabus(selectedCourse.id, syllabus.map(item => 
                    item.id === editingLessonId ? { ...item, title: editingTitle } : item
                ));
            } catch (err) {
                console.error('Save title failed', err);
            }
        }
        setEditingLessonId(null);
        setEditingTitle('');
    };

    const cancelEditingLesson = () => {
        setEditingLessonId(null);
        setEditingTitle('');
    };

    const LessonList = useMemo(() => (
        <div className="space-y-2">
            {(syllabus || []).map(item => (
                <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedLessonId === item.id ? 'border-blue-500 shadow-sm ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-800'}`}
                    draggable
                    onDragStart={() => onDragStart(item.id)}
                    onDragEnter={() => onDragEnter(item.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={onDragEnd}
                    onClick={() => fetchLesson(item.id)}
                >
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()} />
                    
                    {editingLessonId === item.id ? (
                        <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') saveEditingLesson();
                                    if (e.key === 'Escape') cancelEditingLesson();
                                }}
                                autoFocus
                            />
                            <Button size="sm" onClick={saveEditingLesson} className="h-7 px-2">
                                <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditingLesson} className="h-7 px-2">
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <span className="flex-1 min-w-0 text-sm font-medium truncate text-gray-900 dark:text-white">
                            {item.title}
                        </span>
                    )}
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFree(item.id); }}
                        className={`text-xs px-2 py-1 rounded flex-shrink-0 ${item.isFree ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        {item.isFree ? 'Free' : 'Locked'}
                    </button>
                    
                    {/* 3-dot menu */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                            }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {openMenuId === item.id && (
                            <div 
                                className="absolute right-0 top-8 z-50 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => startEditingLesson(item.id, item.title)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Rename
                                </button>
                                <button
                                    onClick={() => { setOpenMenuId(null); handleToggleFree(item.id); }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    {item.isFree ? <Clock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {item.isFree ? 'Make Locked' : 'Make Free'}
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                <button
                                    onClick={() => { setOpenMenuId(null); handleDeleteLesson(item.id); }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    ), [syllabus, selectedLessonId, openMenuId, editingLessonId, editingTitle]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => selectedCourse ? setSelectedCourse(null) : navigate(-1)} 
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {selectedCourse ? 'Back to Courses' : 'Back'}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedCourse ? 'Edit Course' : 'Course Manager'}
                    </h1>
                    
                    {selectedCourse && (
                        <div className="ml-auto flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => window.open(`/courses/${selectedCourse.id}/learn`, '_blank')} 
                                className="flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                Student Preview
                            </Button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {!selectedCourse && (
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
                                    label="Title *"
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    placeholder="Course title"
                                />
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                                    <textarea
                                        value={courseForm.description}
                                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                        className="w-full mt-2 rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                    />
                                </div>
                                <div className="flex items-center py-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={courseForm.isPremium}
                                            onChange={(e) => setCourseForm({ ...courseForm, isPremium: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        Premium Course
                                    </label>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {courseForm.tags?.map(tag => (
                                            <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                {tag}
                                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="Add tag and press Enter"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag(tagInput);
                                            }
                                        }}
                                    />
                                </div>

                                <Input
                                    label="Thumbnail URL"
                                    value={courseForm.thumbnailUrl}
                                    onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                                <div className="flex gap-3">
                                    <Button onClick={handleCreateCourse} disabled={savingCourse} className="flex-1 flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Create Course
                                    </Button>
                                    {/* Removed Price Section as requested */}
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
                            <CardContent>
                                {courses.length === 0 && !loading && (
                                    <p className="text-gray-500 text-sm">No courses yet.</p>
                                )}
                                <div className="grid md:grid-cols-2 gap-3">
                                    {courses.map(course => (
                                        <div
                                            key={course.id}
                                            className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-md ${selectedCourse?.id === course.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
                                            onClick={() => selectCourse(course.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{course.description}</p>
                                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 flex-wrap">
                                                        {course.status === 'published' ? (
                                                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                                <CheckCircle className="w-3 h-3" /> Published
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                                <Clock className="w-3 h-3" /> Draft
                                                            </span>
                                                        )}
                                                        {course.isPremium && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 border border-purple-200">Premium</span>}
                                                        {course.tags?.map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="text-gray-400 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {selectedCourse && (
                    <div className="space-y-6">
                        {/* Course Settings Panel */}
                        <Card className="bg-white dark:bg-gray-900">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="w-5 h-5" />
                                    Course Settings: {selectedCourse.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {editCourseForm && (
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Input
                                                label="Title"
                                                value={editCourseForm.title}
                                                onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                                            />
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                                <textarea
                                                    value={editCourseForm.description}
                                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                                                    className="w-full mt-2 rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Status</label>
                                                    <select
                                                        value={editCourseForm.status}
                                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, status: e.target.value })}
                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 text-sm"
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center pt-6">
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={editCourseForm.isPremium}
                                                            onChange={(e) => setEditCourseForm({ ...editCourseForm, isPremium: e.target.checked })}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        Premium Course
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Tags</label>
                                                <div className="flex gap-2 mb-2 flex-wrap">
                                                    {editCourseForm.tags?.map(tag => (
                                                        <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                            {tag}
                                                            <button onClick={() => handleEditRemoveTag(tag)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add tag (Type & Enter)"
                                                    onKeyDown={handleEditAddTag}
                                                />
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <Button onClick={handleUpdateCourseMetadata} disabled={isUpdatingCourse} className="flex items-center gap-2">
                                                    {isUpdatingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Update Metadata
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                            {/* Syllabus Sidebar - 25% (3/12 cols) */}
                            <Card className="lg:col-span-3 flex flex-col overflow-hidden h-full">
                                <CardHeader className="flex-shrink-0">
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Syllabus</span>
                                        <Button size="sm" onClick={() => handleAddLesson('New Lesson')} disabled={creatingLesson} className="flex items-center gap-2">
                                            {creatingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            Add
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto">
                                    {LessonList}
                                </CardContent>
                            </Card>

                            {/* Editor Area - 75% (9/12 cols) */}
                            <Card className="lg:col-span-9 flex flex-col overflow-hidden h-full">
                                <CardHeader className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Lesson Editor</span>
                                        <div className="flex items-center gap-3">
                                            {savingDraft && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
                                            {autoSaveMessage && <span className="text-xs text-green-500">{autoSaveMessage}</span>}
                                            {selectedLessonId && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={handleSaveLesson} disabled={savingDraft} className="flex items-center gap-2">
                                                        <Save className="w-4 h-4" />
                                                        Save
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handlePublishLesson} className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Publish
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col">
                                    {!selectedLessonId && (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <p>Select a lesson from the syllabus to start editing</p>
                                        </div>
                                    )}

                                    {selectedLessonId && (
                                        <div className="flex-1 flex flex-col h-full">
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                                <Input
                                                    label="Lesson Title"
                                                    value={selectedLesson?.title || ''}
                                                    onChange={(e) => {
                                                        const title = e.target.value;
                                                        setSelectedLesson(prev => prev ? { ...prev, title } : prev);
                                                        handleLessonTitleChange(selectedLessonId, title);
                                                    }}
                                                    className="bg-white dark:bg-gray-900"
                                                />
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                <TiptapEditor
                                                    key={selectedLessonId}
                                                    content={editorContent}
                                                    onChange={(content) => setEditorContent(content)}
                                                    editable={true}
                                                    placeholder="Start writing your lesson content..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
