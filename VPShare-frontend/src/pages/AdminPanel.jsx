import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import '../styles/AdminPanel.css';
import HackathonAdmin from '../components/admin/HackathonAdmin';

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [contents, setContents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    SK: '',
    title: '',
    description: '',
    thumbnail: '',
    order: 1
  });
  const [moduleForm, setModuleForm] = useState({
    SK: '',
    PK: '',
    title: '',
    description: '',
    order: 1
  });
  const [contentForm, setContentForm] = useState({
    SK: '',
    PK: '',
    title: '',
    content_blocks: [], // Dynamic array of mixed content blocks
    doc_id: '',
    explanation_blocks: [], // Legacy support
    order: 1
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  
  // Loading states for operations
  const [operationLoading, setOperationLoading] = useState({
    courses: false,
    modules: false,
    contents: false,
    creating: false,
    updating: false,
    deleting: false
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // 'success', 'error', 'warning', 'info'
  });

  // Helper functions for dynamic content blocks
  const addContentBlock = (type = 'text') => {
    const blockId = Date.now() + Math.random(); // Unique ID for each block
    let newBlock = {
      id: blockId,
      type: type,
      order: contentForm.content_blocks.length + 1
    };

    switch (type) {
      case 'text':
        newBlock = { ...newBlock, content: '', style: 'paragraph' };
        break;
      case 'code':
        newBlock = { ...newBlock, language: 'html', content: '', title: '', description: '' };
        break;
      case 'html':
        newBlock = { ...newBlock, content: '', preview: true };
        break;
      case 'image':
        newBlock = { ...newBlock, url: '', alt: '', caption: '', width: '100%' };
        break;
      case 'video':
        newBlock = { ...newBlock, url: '', title: '', description: '', thumbnail: '' };
        break;
      case 'quiz':
        newBlock = { ...newBlock, question: '', options: [''], correctAnswer: '', explanation: '' };
        break;
      case 'note':
        newBlock = { ...newBlock, content: '', noteType: 'info' }; // info, warning, success, error
        break;
      case 'divider':
        newBlock = { ...newBlock, style: 'line' }; // line, space, dots
        break;
      default:
        newBlock = { ...newBlock, content: '' };
    }

    setContentForm({
      ...contentForm,
      content_blocks: [...contentForm.content_blocks, newBlock]
    });
  };

  const updateContentBlock = (blockId, field, value) => {
    const updatedBlocks = contentForm.content_blocks.map(block => 
      block.id === blockId ? { ...block, [field]: value } : block
    );
    setContentForm({ ...contentForm, content_blocks: updatedBlocks });
  };

  const removeContentBlock = (blockId) => {
    const updatedBlocks = contentForm.content_blocks.filter(block => block.id !== blockId);
    // Reorder remaining blocks
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      order: index + 1
    }));
    setContentForm({ ...contentForm, content_blocks: reorderedBlocks });
  };

  const moveContentBlock = (blockId, direction) => {
    const blocks = [...contentForm.content_blocks];
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    
    if (direction === 'up' && currentIndex > 0) {
      [blocks[currentIndex], blocks[currentIndex - 1]] = [blocks[currentIndex - 1], blocks[currentIndex]];
    } else if (direction === 'down' && currentIndex < blocks.length - 1) {
      [blocks[currentIndex], blocks[currentIndex + 1]] = [blocks[currentIndex + 1], blocks[currentIndex]];
    }
    
    // Update order numbers
    const reorderedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index + 1
    }));
    
    setContentForm({ ...contentForm, content_blocks: reorderedBlocks });
  };

  const duplicateContentBlock = (blockId) => {
    const blockToDuplicate = contentForm.content_blocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: Date.now() + Math.random(),
        order: contentForm.content_blocks.length + 1
      };
      setContentForm({
        ...contentForm,
        content_blocks: [...contentForm.content_blocks, newBlock]
      });
    }
  };

  // Legacy explanation blocks functions (for backward compatibility)
  const addExplanationBlock = () => {
    const newBlock = {
      type: 'code',
      language: 'html',
      content: ''
    };
    setContentForm({
      ...contentForm,
      explanation_blocks: [...contentForm.explanation_blocks, newBlock]
    });
  };

  const updateExplanationBlock = (index, field, value) => {
    const updatedBlocks = contentForm.explanation_blocks.map((block, i) => 
      i === index ? { ...block, [field]: value } : block
    );
    setContentForm({ ...contentForm, explanation_blocks: updatedBlocks });
  };

  const removeExplanationBlock = (index) => {
    const updatedBlocks = contentForm.explanation_blocks.filter((_, i) => i !== index);
    setContentForm({ ...contentForm, explanation_blocks: updatedBlocks });
  };

  // Helper to strip DynamoDB prefixes (e.g., "COURSE#html" -> "html")
  const stripPrefix = (id) => id && id.includes('#') ? id.split('#')[1] : id;

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000); // Hide after 5 seconds
  };

  // Helper to prepare content blocks for DynamoDB (convert numbers to strings)
  const prepareContentBlocksForDB = (blocks) => {
    return blocks.map(block => {
      const cleanBlock = { ...block };
      
      // Convert numeric fields to strings
      if (typeof cleanBlock.order === 'number') {
        cleanBlock.order = String(cleanBlock.order);
      }
      if (typeof cleanBlock.height === 'number') {
        cleanBlock.height = String(cleanBlock.height);
      }
      
      // Clean up any undefined or null values
      Object.keys(cleanBlock).forEach(key => {
        if (cleanBlock[key] === undefined || cleanBlock[key] === null) {
          delete cleanBlock[key];
        }
      });
      
      return cleanBlock;
    });
  };

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      setUser(currentUser);
      // Check if user is admin (you can modify this logic)
      const adminEmails = ['admin@codetapasya.com', 'pranay.jumbarthi1905@gmail.com', 'yelsanimahalaxmi@gmail.com', 'vishnutej49@gmail.com', 'swathi.badrinaryanan@gmail.com','charanpagadala2004@gmail.com', 'macherlarohith2004@gmail.com', 'pravalika@tkrcet.com', 'neeruduvaishnavi8@gmail.com'];
      setIsAdmin(adminEmails.includes(currentUser.email));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  // Auto-fetch modules when switching to contents tab
  useEffect(() => {
    if (activeTab === 'contents' && courses.length > 0 && modules.length === 0) {
      fetchAllModules();
    }
  }, [activeTab, courses]);

  const getAuthHeaders = async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const token = await auth.currentUser.getIdToken(true);
      console.log('Token length:', token?.length);
      console.log('Token preview:', token?.substring(0, 50) + '...');
      
      // Ensure token is valid and properly formatted
      if (!token || token.trim() === '') {
        throw new Error('Empty or invalid token received');
      }
      
      // Ensure the token doesn't already have Bearer prefix (just in case)
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      };
      
      console.log('Authorization header:', headers.Authorization?.substring(0, 50) + '...');
      return headers;
    } catch (error) {
      console.error('Error getting auth headers:', error);
      alert('Authentication error. Please refresh the page and try again.');
      throw error;
    }
  };

  const fetchCourses = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_COURSES_API_URL}/courses`, { headers });
      const items = Array.isArray(response.data) ? response.data : response.data.Items || [];
      // Strip COURSE# prefix for display
      const mappedCourses = items.map(course => ({
        ...course,
        SK: stripPrefix(course.SK) // Remove COURSE# prefix for display
      }));
      setCourses(mappedCourses);
      console.log(`Successfully fetched ${mappedCourses.length} courses`);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      alert(`Failed to fetch courses: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchModules = async (courseId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_COURSES_API_URL}/courses/${courseId}/modules`, { headers });
      const items = Array.isArray(response.data) ? response.data : response.data.Items || [];
      // Strip MODULE# and COURSE# prefixes for display
      const mappedModules = items.map(module => ({
        ...module,
        SK: stripPrefix(module.SK), // Remove MODULE# prefix for display
        PK: stripPrefix(module.PK)  // Remove COURSE# prefix for display
      }));
      setModules(mappedModules);
      console.log(`Successfully fetched ${mappedModules.length} modules for course ${courseId}`);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      alert(`Failed to fetch modules: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchContents = async (moduleId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${import.meta.env.VITE_COURSES_API_URL}/modules/${moduleId}/content`, { headers });
      const items = Array.isArray(response.data) ? response.data : response.data.Items || [];
      // Strip CONTENT# and MODULE# prefixes for display
      const mappedContents = items.map(content => ({
        ...content,
        SK: stripPrefix(content.SK), // Remove CONTENT# prefix for display
        PK: stripPrefix(content.PK)  // Remove MODULE# prefix for display
      }));
      setContents(mappedContents);
      console.log(`Successfully fetched ${mappedContents.length} contents for module ${moduleId}`);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      alert(`Failed to fetch contents: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fetch all modules from all courses for content management
  const fetchAllModules = async () => {
    try {
      const allModules = [];
      for (const course of courses) {
        try {
          const headers = await getAuthHeaders();
          const response = await axios.get(`${import.meta.env.VITE_COURSES_API_URL}/courses/${course.SK}/modules`, { headers });
          const items = Array.isArray(response.data) ? response.data : response.data.Items || [];
          const mappedModules = items.map(module => ({
            ...module,
            SK: stripPrefix(module.SK), // Remove MODULE# prefix for display
            PK: stripPrefix(module.PK)  // Remove COURSE# prefix for display
          }));
          allModules.push(...mappedModules);
        } catch (courseError) {
          console.warn(`Failed to fetch modules for course ${course.SK}:`, courseError);
        }
      }
      setModules(allModules);
      console.log(`Successfully fetched ${allModules.length} total modules from ${courses.length} courses`);
    } catch (error) {
      console.error('Failed to fetch all modules:', error);
      alert(`Failed to fetch all modules: ${error.response?.data?.message || error.message}`);
    }
  };

  // Course CRUD operations
  const createCourse = async (e) => {
    e.preventDefault();
    setOperationLoading(prev => ({ ...prev, creating: true }));
    
    try {
      // Validate required fields
      if (!courseForm.SK.trim() || !courseForm.title.trim() || !courseForm.description.trim()) {
        showNotification('Please fill in all required fields (Course ID, Title, Description)', 'error');
        return;
      }
      
      const headers = await getAuthHeaders();
      // Send clean SK - backend will add COURSE# prefix
      const postData = {
        PK: "COURSES",
        SK: courseForm.SK.trim(), // Send "html" not "COURSE#html"
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        thumbnail: courseForm.thumbnail.trim() || '',
        order: String(courseForm.order) // Convert to string for DynamoDB
      };
      
      console.log('Creating course with data:', postData);
      await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/courses`, postData, { headers });
      
      // Reset form and refresh data
      setCourseForm({ SK: '', title: '', description: '', thumbnail: '', order: 1 });
      await fetchCourses();
      showNotification('Course created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      showNotification(`Failed to create course: ${errorMessage}`, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    setOperationLoading(prev => ({ ...prev, updating: true }));
    
    try {
      // Validate required fields
      if (!courseForm.SK.trim() || !courseForm.title.trim() || !courseForm.description.trim()) {
        alert('Please fill in all required fields (Course ID, Title, Description)');
        return;
      }
      
      const headers = await getAuthHeaders();
      const updateData = {
        PK: "COURSES",
        SK: `COURSE#${courseForm.SK.trim()}`, // Full SK with prefix for identification
        updates: {
          title: courseForm.title.trim(),
          description: courseForm.description.trim(),
          thumbnail: courseForm.thumbnail.trim() || '',
          order: String(courseForm.order) // Convert to string for DynamoDB
        }
      };
      
      console.log('Updating course with data:', updateData);
      
      // Use POST method with action parameter as workaround for CORS
      const response = await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/courses?action=update`, updateData, { headers });
      console.log('Update response:', response.data);
      
      // Reset form and refresh data
      setEditingCourse(null);
      setCourseForm({ SK: '', title: '', description: '', thumbnail: '', order: 1 });
      await fetchCourses();
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Failed to update course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to update course: ${errorMessage}`);
    } finally {
      setOperationLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    setOperationLoading(prev => ({ ...prev, deleting: true }));
    
    try {
      const headers = await getAuthHeaders();
      const deleteData = {
        PK: "COURSES",
        SK: `COURSE#${courseId}` // Full SK with prefix for identification
      };
      
      console.log('Deleting course with data:', deleteData);
      
      // Use POST method with action parameter as workaround for CORS
      const response = await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/courses?action=delete`, deleteData, { headers });
      console.log('Delete response:', response.data);
      
      await fetchCourses();
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Failed to delete course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to delete course: ${errorMessage}`);
    } finally {
      setOperationLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  // Module CRUD operations
  const createModule = async (e) => {
    e.preventDefault();
    setOperationLoading(prev => ({ ...prev, creating: true }));
    
    try {
      // Validate required fields
      if (!moduleForm.SK.trim() || !moduleForm.PK.trim() || !moduleForm.title.trim() || !moduleForm.description.trim()) {
        alert('Please fill in all required fields (Module ID, Course, Title, Description)');
        return;
      }
      
      const headers = await getAuthHeaders();
      // Send clean values - backend will add prefixes for POST operations
      const postData = {
        PK: moduleForm.PK.trim(), // Send "html" not "COURSE#html"
        SK: moduleForm.SK.trim(), // Send "001" not "MODULE#001"
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim(),
        order: String(moduleForm.order) // Convert to string for DynamoDB
      };
      
      console.log('Creating module with data:', postData);
      await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/modules`, postData, { headers });
      
      // Reset form and refresh data
      setModuleForm({ SK: '', PK: '', title: '', description: '', order: 1 });
      if (selectedCourse) await fetchModules(selectedCourse);
      alert('Module created successfully!');
    } catch (error) {
      console.error('Failed to create module:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to create module: ${errorMessage}`);
    } finally {
      setOperationLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const updateModule = async (e) => {
    e.preventDefault();
    try {
      const headers = await getAuthHeaders();
      const updateData = {
        PK: `COURSE#${moduleForm.PK}`, // Full PK with prefix for identification
        SK: `MODULE#${moduleForm.SK}`, // Full SK with prefix for identification
        updates: {
          title: moduleForm.title,
          description: moduleForm.description,
          order: String(moduleForm.order) // Convert to string for DynamoDB
        }
      };
      console.log('Updating module with data:', updateData);
      console.log('Using headers:', headers);
      
      // Use POST method with action parameter as workaround for CORS
      const response = await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/modules?action=update`, updateData, { headers });
      console.log('Update response:', response.data);
      
      setEditingModule(null);
      setModuleForm({ SK: '', PK: '', title: '', description: '', order: 1 });
      if (selectedCourse) fetchModules(selectedCourse);
      alert('Module updated successfully!');
    } catch (error) {
      console.error('Failed to update module:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to update module: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteModule = async (moduleId, courseId) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        const headers = await getAuthHeaders();
        const deleteData = {
          PK: `COURSE#${courseId}`, // Full PK with prefix for identification
          SK: `MODULE#${moduleId}` // Full SK with prefix for identification
        };
        console.log('Deleting module with data:', deleteData);
        console.log('Using headers:', headers);
        
        // Use POST method with action parameter as workaround for CORS
        const response = await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/modules?action=delete`, deleteData, { headers });
        console.log('Delete response:', response.data);
        
        if (selectedCourse) fetchModules(selectedCourse);
        alert('Module deleted successfully!');
      } catch (error) {
        console.error('Failed to delete module:', error);
        console.error('Error details:', error.response?.data);
        alert(`Failed to delete module: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Content CRUD operations
  const createContent = async (e) => {
    e.preventDefault();
    setOperationLoading(prev => ({ ...prev, creating: true }));
    
    try {
      // Validate required fields
      if (!contentForm.SK.trim() || !contentForm.PK.trim() || !contentForm.title.trim()) {
        alert('Please fill in all required fields (Content ID, Module, Title)');
        return;
      }
      
      // Validate that at least one content block or HTML content exists
      if (!contentForm.html.trim() && (!contentForm.content_blocks || contentForm.content_blocks.length === 0)) {
        alert('Please add either HTML content or at least one content block');
        return;
      }
      
      const headers = await getAuthHeaders();
      
      const postData = {
        PK: contentForm.PK.trim(), // Send "001" not "MODULE#001"
        SK: contentForm.SK.trim(), // Send "intro" not "CONTENT#intro"
        title: contentForm.title.trim(),
        html: contentForm.html.trim() || '', // Ensure we always send a string
        content_blocks: prepareContentBlocksForDB(contentForm.content_blocks), // Clean content blocks
        doc_id: contentForm.doc_id.trim(),
        explanation_blocks: contentForm.explanation_blocks,
        order: String(contentForm.order) // Convert to string for DynamoDB
      };
      
      console.log('Creating content with data:', postData);
      console.log('Cleaned content blocks:', postData.content_blocks);
      
      await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/content`, postData, { headers });
      
      // Reset form and refresh data
      setContentForm({ SK: '', PK: '', title: '', html: '', content_blocks: [], doc_id: '', explanation_blocks: [], order: 1 });
      if (selectedModule) await fetchContents(selectedModule);
      alert('Content created successfully!');
    } catch (error) {
      console.error('Failed to create content:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create content';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setOperationLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const updateContent = async (e) => {
    e.preventDefault();
    try {
      const headers = await getAuthHeaders();
      
      // Validate required fields
      if (!contentForm.SK || !contentForm.PK || !contentForm.title) {
        alert('Please fill in all required fields (Content ID, Module, Title)');
        return;
      }
      
      const updateData = {
        PK: `MODULE#${contentForm.PK}`, // Full PK with prefix for identification
        SK: `CONTENT#${contentForm.SK}`, // Full SK with prefix for identification
        updates: {
          title: contentForm.title,
          html: contentForm.html || '', // Ensure we always send a string
          content_blocks: prepareContentBlocksForDB(contentForm.content_blocks), // Clean content blocks
          doc_id: contentForm.doc_id,
          explanation_blocks: contentForm.explanation_blocks,
          order: String(contentForm.order) // Convert to string for DynamoDB
        }
      };
      
      console.log('Updating content with data:', updateData);
      console.log('Cleaned content blocks:', updateData.updates.content_blocks);
      console.log('Using headers:', headers);
      
      // Use POST method with action parameter as workaround for CORS
      const response = await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/content?action=update`, updateData, { headers });
      console.log('Update response:', response.data);
      
      setEditingContent(null);
      setContentForm({ SK: '', PK: '', title: '', html: '', content_blocks: [], doc_id: '', explanation_blocks: [], order: 1 });
      if (selectedModule) fetchContents(selectedModule);
      alert('Content updated successfully!');
    } catch (error) {
      console.error('Failed to update content:', error);
      console.error('Error details:', error.response?.data);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to update content';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const deleteContent = async (contentId, moduleId) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        const headers = await getAuthHeaders();
        const deleteData = {
          PK: `MODULE#${moduleId}`, // Full PK with prefix for identification
          SK: `CONTENT#${contentId}` // Full SK with prefix for identification
        };
        console.log('Deleting content with data:', deleteData);
        console.log('Using headers:', headers);
        
        // Use POST method with action parameter as workaround for CORS
        const response = await axios.post(`${import.meta.env.VITE_COURSES_API_URL}/content?action=delete`, deleteData, { headers });
        console.log('Delete response:', response.data);
        
        if (selectedModule) fetchContents(selectedModule);
        alert('Content deleted successfully!');
      } catch (error) {
        console.error('Failed to delete content:', error);
        console.error('Error details:', error.response?.data);
        alert(`Failed to delete content: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const startEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      SK: course.SK || '',
      title: course.title || '',
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      order: course.order || 1
    });
  };

  const startEditModule = (module) => {
    setEditingModule(module);
    setModuleForm({
      SK: module.SK || '',
      PK: module.PK || '',
      title: module.title || '',
      description: module.description || '',
      order: module.order || 1
    });
  };

  const startEditContent = (content) => {
    setEditingContent(content);
    setContentForm({
      SK: content.SK || '',
      PK: content.PK || '',
      title: content.title || '',
      html: content.html || '',
      content_blocks: content.content_blocks || [],
      doc_id: content.doc_id || '',
      explanation_blocks: content.explanation_blocks || [],
      order: content.order || 1
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!user) {
    return <div className="admin-error">Please log in to access the admin panel.</div>;
  }

  if (!isAdmin) {
    return <div className="admin-error">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel - Code Tapasya</h1>
        <p>Welcome, {user.email}</p>
      </div>

      {/* Notification Component */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
          >
            ×
          </button>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={activeTab === 'courses' ? 'active' : ''} 
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={activeTab === 'modules' ? 'active' : ''} 
          onClick={() => setActiveTab('modules')}
        >
          Modules
        </button>
        <button 
          className={activeTab === 'contents' ? 'active' : ''} 
          onClick={() => setActiveTab('contents')}
        >
          Contents
        </button>
        <button 
          className={activeTab === 'hackathon' ? 'active' : ''} 
          onClick={() => setActiveTab('hackathon')}
        >
          🚀 Hackathon
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="admin-section">
          <h2>Course Management</h2>
          
          <form onSubmit={editingCourse ? updateCourse : createCourse} className="admin-form">
            <h3>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
            <input
              type="text"
              placeholder="Course ID (SK) *"
              value={courseForm.SK}
              onChange={(e) => setCourseForm({...courseForm, SK: e.target.value})}
              required
              className={!courseForm.SK.trim() ? 'invalid' : ''}
            />
            <input
              type="text"
              placeholder="Course Title *"
              value={courseForm.title}
              onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
              required
              className={!courseForm.title.trim() ? 'invalid' : ''}
            />
            <textarea
              placeholder="Course Description *"
              value={courseForm.description}
              onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
              required
              className={!courseForm.description.trim() ? 'invalid' : ''}
            />
            <input
              type="url"
              placeholder="Thumbnail URL"
              value={courseForm.thumbnail}
              onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
            />
            <input
              type="number"
              placeholder="Order"
              value={courseForm.order}
              onChange={(e) => setCourseForm({...courseForm, order: parseInt(e.target.value)})}
              min="1"
            />
            <div className="form-buttons">
              <button 
                type="submit" 
                disabled={operationLoading.creating || operationLoading.updating}
                className={operationLoading.creating || operationLoading.updating ? 'loading' : ''}
              >
                {operationLoading.creating ? 'Creating...' : operationLoading.updating ? 'Updating...' : (editingCourse ? 'Update Course' : 'Create Course')}
              </button>
              {editingCourse && (
                <button type="button" onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({ SK: '', title: '', description: '', thumbnail: '', order: 1 });
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            <h3>Existing Courses</h3>
            {courses.map((course, index) => (
              <div key={`course-${course.SK || index}`} className="admin-item">
                <div className="item-info">
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <span>ID: {course.SK} | Order: {course.order}</span>
                  {course.thumbnail && <img src={course.thumbnail} alt="Course thumbnail" style={{width: '50px', height: '50px', objectFit: 'cover'}} />}
                </div>
                <div className="item-actions">
                  <button 
                    onClick={() => startEditCourse(course)}
                    disabled={operationLoading.deleting}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteCourse(course.SK)}
                    disabled={operationLoading.deleting}
                    className={operationLoading.deleting ? 'loading' : ''}
                  >
                    {operationLoading.deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="admin-section">
          <h2>Module Management</h2>
          
          <div className="course-selector">
            <label>Select Course:</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                if (e.target.value) fetchModules(e.target.value);
              }}
            >
              <option value="">Choose a course</option>
              {courses.map((course, index) => (
                <option key={`course-selector-${course.SK || index}`} value={course.SK}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={editingModule ? updateModule : createModule} className="admin-form">
            <h3>{editingModule ? 'Edit Module' : 'Create New Module'}</h3>
            <input
              type="text"
              placeholder="Module ID (SK)"
              value={moduleForm.SK}
              onChange={(e) => setModuleForm({...moduleForm, SK: e.target.value})}
              required
            />
            <select
              value={moduleForm.PK}
              onChange={(e) => setModuleForm({...moduleForm, PK: e.target.value})}
              required
            >
              <option value="">Select Course (PK)</option>
              {courses.map((course, index) => (
                <option key={`module-form-course-${course.SK || index}`} value={course.SK}>
                  {course.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Module Title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Module Description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Order"
              value={moduleForm.order}
              onChange={(e) => setModuleForm({...moduleForm, order: parseInt(e.target.value)})}
              min="1"
            />
            <div className="form-buttons">
              <button 
                type="submit"
                disabled={operationLoading.creating || operationLoading.updating}
                className={operationLoading.creating || operationLoading.updating ? 'loading' : ''}
              >
                {operationLoading.creating ? 'Creating...' : operationLoading.updating ? 'Updating...' : (editingModule ? 'Update Module' : 'Create Module')}
              </button>
              {editingModule && (
                <button type="button" onClick={() => {
                  setEditingModule(null);
                  setModuleForm({ SK: '', PK: '', title: '', description: '', order: 1 });
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {selectedCourse && (
            <div className="admin-list">
              <h3>Modules for Selected Course</h3>
              {modules.map((module, index) => (
                <div key={`module-${module.SK || index}`} className="admin-item">
                  <div className="item-info">
                    <h4>{module.title}</h4>
                    <p>{module.description}</p>
                    <span>ID: {module.SK} | Course: {module.PK} | Order: {module.order}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditModule(module)}>Edit</button>
                    <button onClick={() => deleteModule(module.SK, module.PK)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'contents' && (
        <div className="admin-section">
          <h2>Content Management</h2>
          
          {modules.length === 0 && courses.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={fetchAllModules}
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Load All Modules
              </button>
            </div>
          )}
          
          <div className="module-selector">
            <label>Select Module:</label>
            <select 
              value={selectedModule} 
              onChange={(e) => {
                setSelectedModule(e.target.value);
                if (e.target.value) fetchContents(e.target.value);
              }}
            >
              <option value="">Choose a module</option>
              {modules.map((module, index) => (
                <option key={`module-selector-${module.SK || index}`} value={module.SK}>
                  {module.title} (Course: {module.PK})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={editingContent ? updateContent : createContent} className="admin-form">
            <h3>{editingContent ? 'Edit Content' : 'Create New Content'}</h3>
            <input
              type="text"
              placeholder="Content ID (SK)"
              value={contentForm.SK}
              onChange={(e) => setContentForm({...contentForm, SK: e.target.value})}
              required
            />
            <select
              value={contentForm.PK}
              onChange={(e) => setContentForm({...contentForm, PK: e.target.value})}
              required
            >
              <option value="">Select Module (PK)</option>
              {modules.map((module, index) => (
                <option key={`content-form-module-${module.SK || index}`} value={module.SK}>
                  {module.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Content Title"
              value={contentForm.title}
              onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
              required
            />
            <textarea
              placeholder="HTML Content"
              value={contentForm.html}
              onChange={(e) => setContentForm({...contentForm, html: e.target.value})}
              required
              rows="5"
            />
            <input
              type="text"
              placeholder="Document ID"
              value={contentForm.doc_id}
              onChange={(e) => setContentForm({...contentForm, doc_id: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Order"
              value={contentForm.order}
              onChange={(e) => setContentForm({...contentForm, order: parseInt(e.target.value)})}
              min="1"
            />
            
            {/* Dynamic Content Blocks Section */}
            <div className="content-blocks">
              <div className="content-blocks-header">
                <div>
                  <h4>Content Blocks</h4>
                  <p className="content-blocks-description">
                    Create rich, interactive content using different block types. Mix and match text, code, images, videos, and more.
                  </p>
                </div>
                <div className="block-type-buttons">
                  <button type="button" onClick={() => addContentBlock('text')} className="add-block-btn">+ Text</button>
                  <button type="button" onClick={() => addContentBlock('code')} className="add-block-btn">+ Code</button>
                  <button type="button" onClick={() => addContentBlock('html')} className="add-block-btn">+ HTML</button>
                  <button type="button" onClick={() => addContentBlock('image')} className="add-block-btn">+ Image</button>
                  <button type="button" onClick={() => addContentBlock('video')} className="add-block-btn">+ Video</button>
                  <button type="button" onClick={() => addContentBlock('quiz')} className="add-block-btn">+ Quiz</button>
                  <button type="button" onClick={() => addContentBlock('note')} className="add-block-btn">+ Note</button>
                  <button type="button" onClick={() => addContentBlock('divider')} className="add-block-btn">+ Divider</button>
                </div>
              </div>
              
              {contentForm.content_blocks.map((block, index) => (
                <div key={block.id} className="content-block" data-type={block.type}>
                  <div className="block-header">
                    <div className="block-info">
                      <span className="block-type">{block.type.toUpperCase()}</span>
                      <span className="block-order">#{block.order}</span>
                    </div>
                    <div className="block-controls">
                      <button type="button" onClick={() => moveContentBlock(block.id, 'up')} disabled={index === 0} className="control-btn">↑</button>
                      <button type="button" onClick={() => moveContentBlock(block.id, 'down')} disabled={index === contentForm.content_blocks.length - 1} className="control-btn">↓</button>
                      <button type="button" onClick={() => duplicateContentBlock(block.id)} className="control-btn">⧉</button>
                      <button type="button" onClick={() => removeContentBlock(block.id)} className="control-btn remove-btn">✕</button>
                    </div>
                  </div>
                  
                  {/* Text Block */}
                  {block.type === 'text' && (
                    <div className="block-content">
                      <select
                        value={block.style || 'paragraph'}
                        onChange={(e) => updateContentBlock(block.id, 'style', e.target.value)}
                      >
                        <option value="paragraph">Paragraph</option>
                        <option value="heading">Heading</option>
                        <option value="subheading">Subheading</option>
                        <option value="caption">Caption</option>
                      </select>
                      <textarea
                        placeholder="Enter text content..."
                        value={block.content || ''}
                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                        rows="4"
                      />
                    </div>
                  )}
                  
                  {/* Code Block */}
                  {block.type === 'code' && (
                    <div className="block-content">
                      <div className="code-block-inputs">
                        <input
                          type="text"
                          placeholder="Code title (optional)"
                          value={block.title || ''}
                          onChange={(e) => updateContentBlock(block.id, 'title', e.target.value)}
                        />
                        <select
                          value={block.language || 'html'}
                          onChange={(e) => updateContentBlock(block.id, 'language', e.target.value)}
                        >
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="sql">SQL</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Enter code..."
                        value={block.content || ''}
                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                        rows="6"
                        style={{ fontFamily: 'monospace' }}
                      />
                      <textarea
                        placeholder="Code description/explanation (optional)"
                        value={block.description || ''}
                        onChange={(e) => updateContentBlock(block.id, 'description', e.target.value)}
                        rows="2"
                      />
                    </div>
                  )}
                  
                  {/* HTML Block */}
                  {block.type === 'html' && (
                    <div className="block-content">
                      <div className="html-block-controls">
                        <label>
                          <input
                            type="checkbox"
                            checked={block.preview || false}
                            onChange={(e) => updateContentBlock(block.id, 'preview', e.target.checked)}
                          />
                          Show preview
                        </label>
                      </div>
                      <textarea
                        placeholder="Enter HTML content..."
                        value={block.content || ''}
                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                        rows="6"
                        style={{ fontFamily: 'monospace' }}
                      />
                      {block.preview && block.content && (
                        <div className="html-preview" dangerouslySetInnerHTML={{ __html: block.content }} />
                      )}
                    </div>
                  )}
                  
                  {/* Image Block */}
                  {block.type === 'image' && (
                    <div className="block-content">
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={block.url || ''}
                        onChange={(e) => updateContentBlock(block.id, 'url', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={block.alt || ''}
                        onChange={(e) => updateContentBlock(block.id, 'alt', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Caption (optional)"
                        value={block.caption || ''}
                        onChange={(e) => updateContentBlock(block.id, 'caption', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Width (e.g., 100%, 300px)"
                        value={block.width || '100%'}
                        onChange={(e) => updateContentBlock(block.id, 'width', e.target.value)}
                      />
                      {block.url && (
                        <div className="image-preview">
                          <img src={block.url} alt={block.alt} style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Video Block */}
                  {block.type === 'video' && (
                    <div className="block-content">
                      <input
                        type="url"
                        placeholder="Video URL (YouTube, Vimeo, etc.)"
                        value={block.url || ''}
                        onChange={(e) => updateContentBlock(block.id, 'url', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Video title"
                        value={block.title || ''}
                        onChange={(e) => updateContentBlock(block.id, 'title', e.target.value)}
                      />
                      <textarea
                        placeholder="Video description (optional)"
                        value={block.description || ''}
                        onChange={(e) => updateContentBlock(block.id, 'description', e.target.value)}
                        rows="3"
                      />
                      <input
                        type="url"
                        placeholder="Thumbnail URL (optional)"
                        value={block.thumbnail || ''}
                        onChange={(e) => updateContentBlock(block.id, 'thumbnail', e.target.value)}
                      />
                    </div>
                  )}
                  
                  {/* Quiz Block */}
                  {block.type === 'quiz' && (
                    <div className="block-content">
                      <input
                        type="text"
                        placeholder="Quiz question"
                        value={block.question || ''}
                        onChange={(e) => updateContentBlock(block.id, 'question', e.target.value)}
                      />
                      <div className="quiz-options">
                        <label>Options:</label>
                        {(block.options || ['']).map((option, optionIndex) => (
                          <div key={optionIndex} className="quiz-option">
                            <input
                              type="text"
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(block.options || [''])];
                                newOptions[optionIndex] = e.target.value;
                                updateContentBlock(block.id, 'options', newOptions);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = (block.options || ['']).filter((_, i) => i !== optionIndex);
                                updateContentBlock(block.id, 'options', newOptions);
                              }}
                              disabled={(block.options || ['']).length <= 1}
                              className="remove-option-btn"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = [...(block.options || ['']), ''];
                            updateContentBlock(block.id, 'options', newOptions);
                          }}
                          className="add-option-btn"
                        >
                          + Add Option
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Correct answer"
                        value={block.correctAnswer || ''}
                        onChange={(e) => updateContentBlock(block.id, 'correctAnswer', e.target.value)}
                      />
                      <textarea
                        placeholder="Explanation (optional)"
                        value={block.explanation || ''}
                        onChange={(e) => updateContentBlock(block.id, 'explanation', e.target.value)}
                        rows="3"
                      />
                    </div>
                  )}
                  
                  {/* Note Block */}
                  {block.type === 'note' && (
                    <div className="block-content">
                      <select
                        value={block.noteType || 'info'}
                        onChange={(e) => updateContentBlock(block.id, 'noteType', e.target.value)}
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                        <option value="error">Error</option>
                        <option value="tip">Tip</option>
                      </select>
                      <textarea
                        placeholder="Note content..."
                        value={block.content || ''}
                        onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                        rows="4"
                      />
                    </div>
                  )}
                  
                  {/* Divider Block */}
                  {block.type === 'divider' && (
                    <div className="block-content">
                      <select
                        value={block.style || 'line'}
                        onChange={(e) => updateContentBlock(block.id, 'style', e.target.value)}
                      >
                        <option value="line">Horizontal Line</option>
                        <option value="space">Empty Space</option>
                        <option value="dots">Dotted Line</option>
                        <option value="thick">Thick Line</option>
                      </select>
                      {block.style === 'space' && (
                        <input
                          type="number"
                          placeholder="Height in pixels"
                          value={block.height || 50}
                          onChange={(e) => updateContentBlock(block.id, 'height', parseInt(e.target.value))}
                          min="10"
                          max="200"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {contentForm.content_blocks.length === 0 && (
                <div className="no-blocks-message">
                  No content blocks added yet. Click the buttons above to add different types of content.
                </div>
              )}
            </div>
            
            {/* Legacy Explanation Blocks Section */}
            <div className="explanation-blocks">
              <h4>Legacy Explanation Blocks</h4>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
                These are the old-style explanation blocks. Use the Content Blocks above for new content.
              </p>
              {contentForm.explanation_blocks.map((block, index) => (
                <div key={index} className="explanation-block">
                  <div className="block-header">
                    <select
                      value={block.type}
                      onChange={(e) => updateExplanationBlock(index, 'type', e.target.value)}
                    >
                      <option value="code">Code</option>
                      <option value="note">Note</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <button type="button" onClick={() => removeExplanationBlock(index)} className="remove-block">
                      Remove
                    </button>
                  </div>
                  
                  {block.type === 'code' && (
                    <>
                      <input
                        type="text"
                        placeholder="Language (e.g., html, css, javascript)"
                        value={block.language || ''}
                        onChange={(e) => updateExplanationBlock(index, 'language', e.target.value)}
                      />
                      <textarea
                        placeholder="Code content"
                        value={block.content || ''}
                        onChange={(e) => updateExplanationBlock(index, 'content', e.target.value)}
                        rows="3"
                      />
                    </>
                  )}
                  
                  {block.type === 'note' && (
                    <textarea
                      placeholder="Note content"
                      value={block.content || ''}
                      onChange={(e) => updateExplanationBlock(index, 'content', e.target.value)}
                      rows="3"
                    />
                  )}
                  
                  {block.type === 'quiz' && (
                    <>
                      <input
                        type="text"
                        placeholder="Quiz question"
                        value={block.question || ''}
                        onChange={(e) => updateExplanationBlock(index, 'question', e.target.value)}
                      />
                      <textarea
                        placeholder="Options (one per line)"
                        value={Array.isArray(block.options) ? block.options.join('\n') : ''}
                        onChange={(e) => updateExplanationBlock(index, 'options', e.target.value.split('\n'))}
                        rows="4"
                      />
                      <input
                        type="text"
                        placeholder="Correct answer"
                        value={block.correctAnswer || ''}
                        onChange={(e) => updateExplanationBlock(index, 'correctAnswer', e.target.value)}
                      />
                    </>
                  )}
                </div>
              ))}
              <button type="button" onClick={addExplanationBlock} className="add-block">
                Add Explanation Block
              </button>
            </div>
            
            <div className="form-buttons">
              <button 
                type="submit"
                disabled={operationLoading.creating || operationLoading.updating}
                className={operationLoading.creating || operationLoading.updating ? 'loading' : ''}
              >
                {operationLoading.creating ? 'Creating...' : operationLoading.updating ? 'Updating...' : (editingContent ? 'Update Content' : 'Create Content')}
              </button>
              {editingContent && (
                <button type="button" onClick={() => {
                  setEditingContent(null);
                  setContentForm({ SK: '', PK: '', title: '', html: '', content_blocks: [], doc_id: '', explanation_blocks: [], order: 1 });
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {selectedModule && (
            <div className="admin-list">
              <h3>Contents for Selected Module</h3>
              {contents.map((content, index) => (
                <div key={`content-${content.SK || index}`} className="admin-item">
                  <div className="item-info">
                    <h4>{content.title}</h4>
                    <p>ID: {content.SK} | Module: {content.PK} | Order: {content.order}</p>
                    <p>Doc ID: {content.doc_id}</p>
                    <div className="content-preview">
                      <strong>Content Blocks:</strong> {content.content_blocks ? content.content_blocks.length : 0} blocks
                    </div>
                    <div className="content-preview">
                      <strong>HTML:</strong> {content.html ? content.html.substring(0, 100) + '...' : 'No HTML content'}
                    </div>
                    <div className="content-preview">
                      <strong>Legacy Explanation Blocks:</strong> {content.explanation_blocks ? content.explanation_blocks.length : 0} blocks
                    </div>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditContent(content)}>Edit</button>
                    <button onClick={() => deleteContent(content.SK, content.PK)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'hackathon' && (
        <div className="admin-section hackathon-section">
          <HackathonAdmin />
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
