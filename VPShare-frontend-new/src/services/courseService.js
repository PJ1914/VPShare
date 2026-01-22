import { db } from '../config/firebase';
import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';

const emptyTiptapDoc = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }]
        }
    ]
};

export const courseService = {
    async listCourses() {
        const snap = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc')));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async getCourseById(courseId) {
        const courseRef = doc(db, 'courses', courseId);
        const snap = await getDoc(courseRef);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    },

    async createCourse(data) {
        const courseRef = doc(collection(db, 'courses'));
        const payload = {
            title: data.title || 'Untitled Course',
            description: data.description || '',
            isPremium: data.isPremium ?? false,
            authorId: data.authorId || null,
            thumbnailUrl: data.thumbnailUrl || '',
            status: data.status || 'draft',
            syllabus: [],
            tags: data.tags || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        await setDoc(courseRef, payload);
        return { id: courseRef.id, ...payload };
    },

    async updateCourse(courseId, updates) {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, { ...updates, updatedAt: serverTimestamp() });
    },

    async deleteCourse(courseId) {
        const lessonsSnap = await getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId)));
        const batch = writeBatch(db);
        lessonsSnap.forEach((d) => batch.delete(d.ref));
        batch.delete(doc(db, 'courses', courseId));
        await batch.commit();
    },

    async addLesson(courseId, title) {
        const courseRef = doc(db, 'courses', courseId);
        const lessonRef = doc(collection(db, 'lessons'));

        const syllabusEntry = {
            id: lessonRef.id,
            title: title || 'New Lesson',
            type: 'text',
            isFree: false
        };

        const lessonPayload = {
            id: lessonRef.id,
            courseId,
            title: title || 'New Lesson',
            status: 'draft',
            content: emptyTiptapDoc,
            draft_content: emptyTiptapDoc,
            videoUrl: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const batch = writeBatch(db);
        batch.set(lessonRef, lessonPayload);
        batch.update(courseRef, {
            syllabus: arrayUnion(syllabusEntry),
            updatedAt: serverTimestamp()
        });

        await batch.commit();
        return { lessonId: lessonRef.id, syllabusEntry };
    },

    async reorderSyllabus(courseId, syllabusArray) {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, { syllabus: syllabusArray, updatedAt: serverTimestamp() });
    },

    async getLessonById(lessonId) {
        const lessonRef = doc(db, 'lessons', lessonId);
        const snap = await getDoc(lessonRef);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    },

    async updateLessonDraft(lessonId, updates) {
        const lessonRef = doc(db, 'lessons', lessonId);
        await updateDoc(lessonRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    },

    async publishLesson(lessonId) {
        const lessonRef = doc(db, 'lessons', lessonId);
        const snap = await getDoc(lessonRef);
        if (!snap.exists()) throw new Error('Lesson not found');
        const data = snap.data();
        await updateDoc(lessonRef, {
            content: data.draft_content || emptyTiptapDoc,
            status: 'published',
            updatedAt: serverTimestamp()
        });
    },

    async deleteLesson(courseId, lessonId) {
        const courseRef = doc(db, 'courses', courseId);
        const lessonRef = doc(db, 'lessons', lessonId);

        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            const updatedSyllabus = (courseData.syllabus || []).filter(item => item.id !== lessonId);
            await updateDoc(courseRef, { syllabus: updatedSyllabus, updatedAt: serverTimestamp() });
        }

        await deleteDoc(lessonRef);
    }
};

export default courseService;
