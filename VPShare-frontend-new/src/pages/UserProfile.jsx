
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonProfile } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { BackgroundPaths } from '@/components/ui/BackgroundPaths';
import { GlowingEffect } from '@/components/ui/GlowingEffect';

import {
    User, Mail, MapPin, Link as LinkIcon, Github, Linkedin, Twitter, Facebook, Youtube, Instagram,
    Camera, Edit2, Save, X, Award, BookOpen, Code, Zap, Plus, Database,
    Calendar, Clock, TrendingUp, Share2, Settings, Loader2, Sparkles
} from 'lucide-react';
// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const calculateStreaks = (dates) => {
    if (!dates || dates.length === 0) {
        return 0;
    }

    const uniqueDates = [...new Set(dates.map(d => new Date(d).setHours(0, 0, 0, 0)))];
    uniqueDates.sort((a, b) => b - a); // Sort descending

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0);

    // If the most recent date is not today or yesterday, streak is 0
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0;
    }




    let streak = 1;
    let currentDate = uniqueDates[0];

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i];
        const diff = (currentDate - prevDate) / 86400000; // Difference in days

        if (diff === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break; // Gap in streak
        }
    }
    return streak;
};
// Add this new component before the UserProfile component
const SkillsSection = ({ skills, setSkills }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState(50);

  // Available skills to choose from
  const availableSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'AI/ML', 
    'TypeScript', 'Java', 'C++', 'SQL', 'Docker', 'AWS', 'TensorFlow', 'Git'
  ];

  const handleAddSkill = () => {
    if (!selectedSkill || skills.some(s => s.name === selectedSkill)) return;
    
    const newSkill = {
      name: selectedSkill,
      level: proficiency
    };

    setSkills([...skills, newSkill]);
    setSelectedSkill('');
    setProficiency(50);
    setIsAdding(false);
  };

  const removeSkill = (skillName) => {
    setSkills(skills.filter(skill => skill.name !== skillName));
  };

  const updateSkillLevel = (skillName, newLevel) => {
    setSkills(skills.map(skill => 
      skill.name === skillName ? { ...skill, level: newLevel } : skill
    ));
  };

  return (
    <div className="relative rounded-2xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills & Expertise</h2>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSkill}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select a skill</option>
                {availableSkills
                  .filter(skill => !skills.some(s => s.name === skill))
                  .map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Proficiency: {proficiency}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={proficiency}
                onChange={(e) => setProficiency(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-sm">No skills added yet</p>
            <p className="text-xs mt-1">Click "Add Skill" to get started</p>
          </div>
        ) : (
          skills.map((skill) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {skill.name}
                </span>
                <button
                  onClick={() => removeSkill(skill.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${skill.level}%`,
                    transition: { duration: 1, ease: "easeOut" }
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getProficiencyText(skill.level)}
                </span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {skill.level}%
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
      </motion.div>
    </div>
  );
};

// Projects Section Component
const ProjectsSection = ({ projects, setProjects }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: [],
    githubUrl: '',
    icon: 'Code'
  });

  const availableIcons = {
    Code: Code,
    Database: Database,
    Zap: Zap,
    BookOpen: BookOpen
  };

  const availableTech = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Firebase', 'AWS', 'Docker', 'TypeScript',
    'JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS', 'Tailwind'
  ];

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return;
    
    const project = {
      id: Date.now(),
      ...newProject,
      techStack: newProject.techStack.filter(tech => tech.trim() !== '')
    };

    setProjects([...projects, project]);
    setNewProject({
      title: '',
      description: '',
      techStack: [],
      githubUrl: '',
      icon: 'Code'
    });
    setIsAdding(false);
  };

  const removeProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const toggleTech = (tech) => {
    setNewProject(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  return (
    <div className="relative rounded-2xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <motion.div variants={itemVariants} className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
          Projects
        </h3>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProject}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., E-Commerce Platform"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Brief description of your project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tech Stack
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTech.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      newProject.techStack.includes(tech)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon
              </label>
              <div className="flex gap-2">
                {Object.keys(availableIcons).map((iconName) => {
                  const Icon = availableIcons[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewProject({...newProject, icon: iconName})}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        newProject.icon === iconName
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium">No projects yet — start building!</p>
            <p className="text-xs mt-1">Add your projects to showcase your work</p>
          </div>
        ) : (
          projects.map((project) => {
            const Icon = availableIcons[project.icon] || Code;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 group relative"
              >
                <button
                  onClick={() => removeProject(project.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{project.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Github className="w-4 h-4" />
                        View Code
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      </motion.div>
    </div>
  );
};

// Certificate Section Component
const CertificateSection = ({ certificates, setCertificates }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
    credentialUrl: ''
  });

  const handleAddCertificate = () => {
    if (!newCertificate.name || !newCertificate.issuer) return;
    
    const certificate = {
      id: Date.now(),
      ...newCertificate,
      date: newCertificate.date || new Date().toISOString().split('T')[0]
    };

    setCertificates([...certificates, certificate]);
    setNewCertificate({
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
      credentialUrl: ''
    });
    setIsAdding(false);
  };

  const removeCertificate = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  return (
    <div className="relative rounded-2xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <motion.div variants={itemVariants} className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Certificates
        </h3>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Certificate
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCertificate}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Certificate Name
              </label>
              <input
                type="text"
                value={newCertificate.name}
                onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., React Developer Certificate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issuing Organization
              </label>
              <input
                type="text"
                value={newCertificate.issuer}
                onChange={(e) => setNewCertificate({...newCertificate, issuer: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., Coursera, Udemy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={newCertificate.date}
                onChange={(e) => setNewCertificate({...newCertificate, date: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credential ID (Optional)
              </label>
              <input
                type="text"
                value={newCertificate.credentialId}
                onChange={(e) => setNewCertificate({...newCertificate, credentialId: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Certificate ID"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credential URL (Optional)
              </label>
              <input
                type="url"
                value={newCertificate.credentialUrl}
                onChange={(e) => setNewCertificate({...newCertificate, credentialUrl: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://certificate verification URL"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium">No certificates yet — start learning!</p>
            <p className="text-xs mt-1">Complete courses to earn certificates</p>
          </div>
        ) : (
          certificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 group relative"
            >
              <button
                onClick={() => removeCertificate(cert.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{cert.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{cert.issuer}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(cert.date).toLocaleDateString()}
                  </p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
                    >
                      <LinkIcon className="w-3 h-3" />
                      View Certificate
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      </motion.div>
    </div>
  );
};

// Helper function to get proficiency text
const getProficiencyText = (level) => {
  if (level >= 90) return 'Expert';
  if (level >= 70) return 'Advanced';
  if (level >= 50) return 'Intermediate';
  if (level >= 30) return 'Beginner';
  return 'Novice';
};
const UserProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // New state for tabs
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // New state for year selection

    // Profile State
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        location: '',
        website: '',
        social: { 
            github: '', 
            linkedin: '', 
            twitter: '',
            facebook: '',
            youtube: '',
            instagram: ''
        }
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [stats, setStats] = useState({
        coursesCompleted: 0,
        totalCodeLines: 0,
        currentStreak: 0,
        totalLearningMinutes: 0
    });
    const [activityData, setActivityData] = useState([]);

    // Pagination Logic
    const [badgePage, setBadgePage] = useState(1);
    const badgesPerPage = 4;
    
    // Skills & Technologies
    const [skills, setSkills] = useState([]);
    
    // Projects & Achievements
    const [projects, setProjects] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [activities, setActivities] = useState([]);
       
    
    // Testimonials
    const [testimonials, setTestimonials] = useState([
        { id: 1, author: 'Jane Smith', role: 'Senior Developer', content: 'Exceptional problem-solving skills and quick learner!', avatar: '👩‍💻' },
        { id: 2, author: 'John Doe', role: 'Project Manager', content: 'Great team player with excellent communication skills.', avatar: '👨‍💼' },
    ]);

    const BADGES = [
        { 
            name: 'First Steps', 
            desc: 'Completed your first lesson', 
            icon: '🚀', 
            unlocked: true, 
            category: 'Learning',
            progress: 100,
            total: 1,
            xp: 50
        },
        { 
            name: 'Code Warrior', 
            desc: 'Wrote 1000 lines of code', 
            icon: '⚔️', 
            unlocked: true,
            category: 'Coding',
            progress: 100,
            total: 1000,
            xp: 100
        },
        { 
            name: 'Bug Hunter', 
            desc: 'Fixed 50 bugs', 
            icon: '🐛', 
            unlocked: false,
            category: 'Coding',
            progress: 30,
            total: 50,
            xp: 200
        },
        { 
            name: 'Night Owl', 
            desc: 'Coded after midnight', 
            icon: '🦉', 
            unlocked: true,
            category: 'Activity',
            progress: 100,
            total: 1,
            xp: 75
        },
        { 
            name: 'Socialite', 
            desc: 'Shared your profile', 
            icon: '🌟', 
            unlocked: false,
            category: 'Social',
            progress: 0,
            total: 1,
            xp: 25
        },
    ];

    const totalBadgePages = Math.ceil(BADGES.length / badgesPerPage);
    const currentBadges = BADGES.slice(
        (badgePage - 1) * badgesPerPage,
        badgePage * badgesPerPage
    );

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user, selectedYear]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            // 1. Fetch User Profile
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setProfileData({
                    displayName: user.displayName || '',
                    bio: data.bio || '',
                    location: data.location || '',
                    website: data.website || '',
                    social: data.social || { github: '', linkedin: '', twitter: '' }
                });
            } else {
                setProfileData(prev => ({ ...prev, displayName: user.displayName || '' }));
            }

            // 2. Fetch Engagement (Time & Activity)
            const engagementDocRef = doc(db, 'userEngagement', user.uid);
            const engagementDoc = await getDoc(engagementDocRef);
            const engagementData = engagementDoc.exists() ? engagementDoc.data() : {};
            const dailyMinutes = engagementData.dailyMinutes || {};
            const totalMinutes = engagementData.totalMinutes || 0;

            // 3. Fetch Progress (Courses & Code Lines)
            const progressQuery = query(
                collection(db, 'userProgress'),
                where('__name__', '>=', `${user.uid}_`),
                where('__name__', '<', `${user.uid}_\uf8ff`)
            );
            const progressSnap = await getDocs(progressQuery);

            let coursesCompleted = 0;
            let totalCodeLines = 0;
            const activityDates = new Set();

            // Add dates from dailyMinutes
            Object.keys(dailyMinutes).forEach(date => activityDates.add(date));

            progressSnap.forEach(doc => {
                const data = doc.data();
                if (data.completedSections && data.totalSections && data.completedSections.length >= data.totalSections) {
                    coursesCompleted++;
                }
                if (data.completedSections) {
                    totalCodeLines += data.completedSections.length * 50;
                }
                if (data.lastAccessed) {
                    const date = data.lastAccessed.toDate().toISOString().split('T')[0];
                    activityDates.add(date);
                }
            });

            // Calculate Streak
            const currentStreak = calculateStreaks(Array.from(activityDates));

            setStats({
                coursesCompleted,
                totalCodeLines,
                currentStreak,
                totalLearningMinutes: totalMinutes
            });

            // Prepare Activity Graph Data (Last 365 days from selected year)
            const today = new Date();
            const graphData = [];
            // We need 52 weeks * 7 days = 364 days to fill the grid perfectly
            for (let i = 363; i >= 0; i--) {
                const d = new Date(selectedYear, 11, 31); // Start from end of selected year
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                let count = 0;
                const minutes = dailyMinutes[dateStr] || 0;

                if (minutes > 60) count = 4;
                else if (minutes > 30) count = 3;
                else if (minutes > 15) count = 2;
                else if (minutes > 0 || activityDates.has(dateStr)) count = 1;

                graphData.push({ date: dateStr, count, minutes });
            }
            setActivityData(graphData);

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);

            // Upload to Firebase Storage
            const storageRef = ref(storage, `profile/${user.uid}/avatar`);
            setSaving(true);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Update Profile
            await updateProfile(user, { photoURL: url });
            setSaving(false);
        } catch (error) {
            console.error("Error uploading image:", error);
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile(user, { displayName: profileData.displayName });

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                bio: profileData.bio,
                location: profileData.location,
                website: profileData.website,
                social: profileData.social
            }); // Note: setDoc with merge: true might be safer if doc doesn't exist

            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
                <div className="relative h-64 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                <SkeletonProfile />
            </div>
        );
    }

    // Tabs component
    const renderTabs = () => (
        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-3xl mx-auto mb-8">
            {['overview'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab
                            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>
    );
    
    // Skills Tab
    const renderSkillsTab = () => (
        <div className="space-y-6">
            <SkillsSection skills={skills} setSkills={setSkills} />
        </div>
    );
    
    // Overview Tab
    const renderOverviewTab = () => (
        <div className="space-y-8">
            {/* This will contain the stats grid, activity graph, and badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Courses', value: stats.coursesCompleted, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Lines of Code', value: stats.totalCodeLines, icon: Code, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Day Streak', value: stats.currentStreak, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Learning Hours', value: Math.round(stats.totalLearningMinutes / 60), icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, index) => (
                    <div key={index} className="relative rounded-xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                        <GlowingEffect
                            spread={40}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                            borderWidth={3}
                        />
                        <div className="relative bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    // Achievements Tab
    const renderAchievementsTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BADGES.map((badge, index) => (
                    <div key={index} className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${
                        badge.unlocked ? 'border-yellow-400' : 'border-gray-100 dark:border-gray-700 opacity-70'
                    }`}>
                        <div className="flex items-start">
                            <div className="text-4xl mr-4">{badge.icon}</div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{badge.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{badge.desc}</p>
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>{badge.category}</span>
                                        <span>{badge.unlocked ? 'Unlocked' : `${badge.progress}/${badge.total}`}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full" 
                                            style={{ width: `${badge.unlocked ? 100 : (badge.progress / badge.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {badge.unlocked && (
                            <div className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                +{badge.xp} XP
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center mt-6">
                <Pagination
                    currentPage={badgePage}
                    totalPages={totalBadgePages}
                    onPageChange={setBadgePage}
                />
            </div>
        </div>
    );
    
    // Format time in 12-hour format with AM/PM
    const formatTime = (date) => {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    };

    // Format relative time (e.g., "2 hours ago")
    const formatRelativeTime = (date) => {
        const now = new Date();
        const dateObj = date instanceof Date ? date : new Date(date);
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        // Less than a minute
        if (diffInSeconds < 60) return 'Just now';
        
        // Less than an hour
        const minutes = Math.floor(diffInSeconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        
        // Less than a day
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        
        // Less than a week
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
        
        // More than a week, show date
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Format activity duration
    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    };

    // Activity Tab
    const renderActivityTab = () => {
        if (!activities || activities.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No activities yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Your activities will appear here when you start completing courses, projects, or earn achievements.
                    </p>
                </div>
            );
        }

        // Group activities by year and month
        const groupedByYear = activities.reduce((acc, activity) => {
            const date = new Date(activity.date);
            const year = date.getFullYear();
            const month = date.toLocaleDateString('en-US', { month: 'long' });
            const dateKey = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!acc[year]) {
                acc[year] = {};
            }
            
            if (!acc[year][month]) {
                acc[year][month] = {};
            }
            
            if (!acc[year][month][dateKey]) {
                acc[year][month][dateKey] = [];
            }
            
            acc[year][month][dateKey].push(activity);
            return acc;
        }, {});
        
        // Sort activities within each date group (newest first)
        Object.values(groupedByYear).forEach(year => {
            Object.values(year).forEach(month => {
                Object.values(month).forEach(activities => {
                    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
                });
            });
        });
        
        // Get activity icon and color based on type
        const getActivityIcon = (type) => {
            const icons = {
                course: { 
                    icon: <BookOpen className="w-4 h-4" />,
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    text: 'text-blue-600 dark:text-blue-400',
                    border: 'border-blue-200 dark:border-blue-800/50'
                },
                project: { 
                    icon: <Code className="w-4 h-4" />,
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    text: 'text-purple-600 dark:text-purple-400',
                    border: 'border-purple-200 dark:border-purple-800/50'
                },
                achievement: { 
                    icon: <Award className="w-4 h-4" />,
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    text: 'text-yellow-600 dark:text-yellow-400',
                    border: 'border-yellow-200 dark:border-yellow-800/50'
                },
                learning: { 
                    icon: <Zap className="w-4 h-4" />,
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    text: 'text-green-600 dark:text-green-400',
                    border: 'border-green-200 dark:border-green-800/50'
                },
                default: { 
                    icon: <Clock className="w-4 h-4" />,
                    bg: 'bg-gray-100 dark:bg-gray-700/30',
                    text: 'text-gray-600 dark:text-gray-400',
                    border: 'border-gray-200 dark:border-gray-700/50'
                }
            };
            return icons[type] || icons.default;
        };
        
        // Get activity type label
        const getActivityTypeLabel = (type) => {
            const labels = {
                course: 'Course',
                project: 'Project',
                achievement: 'Achievement',
                learning: 'Learning',
                default: 'Activity'
            };
            return labels[type] || labels.default;
        };

        // Format date for display
        const formatDisplayDate = (dateString) => {
            const date = new Date(dateString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);

            if (date.toDateString() === today.toDateString()) {
                return { display: 'Today', tooltip: 'Today' };
            } else if (date.toDateString() === yesterday.toDateString()) {
                return { display: 'Yesterday', tooltip: 'Yesterday' };
            } else if (date > weekAgo) {
                return {
                    display: date.toLocaleDateString('en-US', { weekday: 'long' }),
                    tooltip: date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                    })
                };
            } else {
                return {
                    display: date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                    }),
                    tooltip: date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                    })
                };
            }
        };
        
        // Sort years in descending order
        const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

        return (
            <div className="space-y-10">
                {sortedYears.map((year) => (
                    <div key={year} className="relative">
                        {/* Year header */}
                        <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 py-2 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{year}</h2>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800 mt-2"></div>
                        </div>
                        
                        {/* Months in this year */}
                        <div className="space-y-8 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                            {Object.entries(groupedByYear[year])
                                .sort(([monthA], [monthB]) => {
                                    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                    return months.indexOf(monthB) - months.indexOf(monthA);
                                })
                                .map(([month, dates]) => {
                                    const monthDate = new Date(`${month} 1, ${year}`);
                                    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
                                    
                                    return (
                                        <div key={`${year}-${month}`} className="space-y-6">
                                            {/* Month header */}
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                    {monthName} {year}
                                                </h3>
                                                <div className="ml-2 h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                                            </div>
                                            
                                            {/* Days in this month */}
                                            <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                                {Object.entries(dates).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)).map(([dateKey, activitiesOnDate]) => {
                                                    const { display: displayDate, tooltip: dateTooltip } = formatDisplayDate(dateKey);
                    
                                                    return (
                                                        <div key={dateKey} className="space-y-4">
                                                            {/* Date header */}
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                                                                <span 
                                                                    className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-50 dark:bg-gray-900 rounded-md"
                                                                    title={dateTooltip}
                                                                >
                                                                    {displayDate}
                                                                </span>
                                                                <div className="ml-2 h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                                                            </div>
                                                            
                                                            {/* Activities on this date */}
                                                            <div className="space-y-3 pl-4">
                                                                {activitiesOnDate.map((activity, index) => {
                                                                    const activityDateTime = new Date(activity.date);
                                                                    const formattedTime = formatTime(activityDateTime);
                                                                    const relativeTime = formatRelativeTime(activityDateTime);
                                                                    const isRecent = (new Date() - activityDateTime) < 24 * 60 * 60 * 1000; // Within 24 hours
                                                                    const activityIcon = getActivityIcon(activity.type || 'default');
                                                                    
                                                                    return (
                                                                        <motion.div 
                                                                            key={index}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            whileHover={{ x: 2 }}
                                                                            transition={{ 
                                                                                duration: 0.2, 
                                                                                delay: index * 0.02,
                                                                                hover: { duration: 0.1 }
                                                                            }}
                                                                            className={`relative flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${activityIcon.border} ${
                                                                                isRecent 
                                                                                    ? 'ring-1 ring-blue-200 dark:ring-blue-900/50' 
                                                                                    : 'hover:ring-1 hover:ring-gray-200 dark:hover:ring-gray-700'
                                                                            } transition-all duration-200`}
                                                                        >
                                                                            <div className={`flex-shrink-0 w-9 h-9 rounded-full ${activityIcon.bg} flex items-center justify-center ${activityIcon.text} mr-3 mt-0.5`}>
                                                                                {activityIcon.icon}
                                                                            </div>
                                                                            
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center">
                                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                            {activity.title}
                                                                                        </p>
                                                                                        <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                                                            {getActivityTypeLabel(activity.type || 'default')}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center space-x-1.5">
                                                                                        <span className="text-sm text-gray-900 dark:text-white whitespace-nowrap" title={activityDateTime.toLocaleString()}>
                                                                                            {formattedTime}
                                                                                        </span>
                                                                                        <span className="text-sm text-gray-900 dark:text-white">•</span>
                                                                                        <span className="text-xs text-blue-500 dark:text-blue-400">
                                                                                            {relativeTime}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {activity.details && (
                                                                                    <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                                                        {activity.details}
                                                                                    </p>
                                                                                )}
                                                                                
                                                                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                                                    {activity.duration && (
                                                                                        <span className="text-[11px] px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-full border border-gray-100 dark:border-gray-700 flex items-center">
                                                                                            <Clock className="w-3 h-3 mr-1 opacity-70" />
                                                                                            {formatDuration(activity.duration)}
                                                                                        </span>
                                                                                    )}
                                                                                    
                                                                                    {activity.xp && (
                                                                                        <span className="text-[11px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/30 flex items-center">
                                                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                                                            +{activity.xp} XP
                                                                                        </span>
                                                                                    )}
                                                                                    
                                                                                    {activity.tags?.map((tag, i) => (
                                                                                        <span key={i} className="text-[11px] px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-full border border-gray-100 dark:border-gray-700">
                                                                                            {tag}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="flex flex-col items-center space-y-1.5 ml-2">
                                                                                <button 
                                                                                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                                                                    title="Share activity"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        // Handle share functionality
                                                                                    }}
                                                                                >
                                                                                    <Share2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    // Testimonials Section
    const renderTestimonials = () => (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Testimonials</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Request Endorsement
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start">
                            <div className="text-3xl mr-4">{testimonial.avatar}</div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{testimonial.author}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">"{testimonial.content}"</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gray-950 pb-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[288px] left-0 right-0 bottom-0">
                <BackgroundPaths className="h-full">
                    <div className="absolute inset-0">
                        {/* Subtle floating orbs */}
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full mix-blend-multiply filter blur-2xl opacity-60 dark:opacity-20 animate-pulse"></div>
                        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-purple-500/5 rounded-full mix-blend-multiply filter blur-2xl opacity-60 dark:opacity-20 animate-pulse animation-delay-2000"></div>
                        <div className="absolute bottom-1/3 left-1/2 w-36 h-36 bg-indigo-500/5 rounded-full mix-blend-multiply filter blur-2xl opacity-60 dark:opacity-20 animate-pulse animation-delay-4000"></div>
                    </div>
                </BackgroundPaths>
            </div>

            {/* Header / Hero Section */}
            <div className="relative h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-blue-400/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
                    <motion.div 
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear"
                        }}
                    />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white dark:from-gray-950 to-transparent"></div>
                
                {/* Animated floating elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white/10"
                            style={{
                                width: Math.random() * 10 + 5,
                                height: Math.random() * 10 + 5,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.3, 0.7, 0.3],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </div>

           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
               
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col lg:flex-row items-start gap-8"
                >
                    {/* Left Column - Profile Card and Skills */}
                    <div className="w-full lg:w-[500px] space-y-8">
                        {/* Profile Card */}
                        <motion.div variants={itemVariants} className="flex-shrink-0">
                            <div className="relative rounded-2xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                                <GlowingEffect
                                    spread={40}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={3}
                                />
                                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 flex flex-col items-center text-center border-b border-gray-200 dark:border-gray-800">
                                <div className="relative mb-4 group">
                                    <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-gray-800 shadow-lg">
                                        <img
                                            src={previewImage || user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                            <Camera className="w-4 h-4" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>

                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.displayName}
                                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                        className="text-xl font-bold text-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 w-full mb-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Display Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profileData.displayName || 'User'}</h2>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

                                {isEditing ? (
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                        {profileData.bio || "No bio yet. Click edit to add one!"}
                                    </p>
                                )}

                                <div className="flex gap-2 w-full">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <motion.button
                                            onClick={() => setIsEditing(true)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-800 dark:hover:from-blue-600 dark:hover:to-indigo-700 py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none px-1"
                                            placeholder="Location"
                                        />
                                    ) : (
                                        <span>{profileData.location || 'Earth, Milky Way'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <LinkIcon className="w-4 h-4" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.website}
                                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none px-1"
                                            placeholder="Website URL"
                                        />
                                    ) : (
                                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-900 hover:text-blue-500 dark:text-white dark:hover:text-blue-400">
                                            {profileData.website || 'Porfolio'}
                                        </a>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Social</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {['github', 'linkedin', 'twitter', 'facebook', 'youtube', 'instagram'].map((platform) => (
                                            isEditing ? (
                                                <div key={platform} className="flex items-center gap-2 mb-2">
                                                    {platform === 'github' && <Github className="w-4 h-4 text-gray-900 dark:text-white" />}
                                                    {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-gray-900 dark:text-white" />}
                                                    {platform === 'twitter' && <Twitter className="w-4 h-4 text-gray-900 dark:text-white" />}
                                                    {platform === 'facebook' && <Facebook className="w-4 h-4 text-gray-900 dark:text-white" />}
                                                    {platform === 'youtube' && <Youtube className="w-4 h-4 text-gray-900 dark:text-white" />}
                                                    {platform === 'instagram' && <Instagram className="w-4 h-4 text-gray-900 dark:text-white" />}
                                                    <input
                                                        type="text"
                                                        value={profileData.social[platform]}
                                                        onChange={(e) => setProfileData({
                                                            ...profileData,
                                                            social: { ...profileData.social, [platform]: e.target.value }
                                                        })}
                                                        className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 focus:border-blue-500 outline-none"
                                                        placeholder={`${platform} username`}
                                                    />
                                                </div>
                                            ) : (
                                                profileData.social[platform] && (
                                                    <a
                                                        key={platform}
                                                        href={`https://${platform}.com/${profileData.social[platform]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                                                    >
                                                        {platform === 'github' && <Github className="w-5 h-5" />}
                                                        {platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                                                        {platform === 'twitter' && <Twitter className="w-5 h-5" />}
                                                        {platform === 'facebook' && <Facebook className="w-5 h-5" />}
                                                        {platform === 'youtube' && <Youtube className="w-5 h-5" />}
                                                        {platform === 'instagram' && <Instagram className="w-5 h-5" />}
                                                    </a>
                                                )
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </motion.div>

                    {/* Skills Section - Below Profile Card */}
                    <motion.div variants={itemVariants}>
                        <SkillsSection skills={skills} setSkills={setSkills} />
                    </motion.div>
                    </div>

                {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Overview Content */}
                        {renderOverviewTab()}
                             
                        {/* Activity Graph */}
                        <motion.div variants={itemVariants} className="relative rounded-2xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    Activity
                                </h3>
                                <select 
                                    className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 outline-none text-gray-900 dark:text-white"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                                    <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                                </select>
                            </div>

                            {/* Year Headers */}
                            <div className="flex justify-between mb-1 text-xs text-gray-500">
                                <span>{selectedYear - 1}</span>
                                <span>{selectedYear}</span>
                            </div>

                            <div className="flex gap-1 overflow-x-auto pb-2">
                                {Array.from({ length: 52 }).map((_, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1">
                                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                                            const dataIndex = weekIndex * 7 + dayIndex;
                                            const dayData = activityData[dataIndex] || { count: 0, date: '', minutes: 0 };
                                            const colors = [
                                                'bg-gray-100 dark:bg-gray-800',
                                                'bg-green-200 dark:bg-green-900/40',
                                                'bg-green-300 dark:bg-green-800/60',
                                                'bg-green-400 dark:bg-green-600',
                                                'bg-green-500 dark:bg-green-500'
                                            ];
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`w-3 h-3 rounded-sm ${colors[dayData.count]}`}
                                                    title={`${dayData.date}: ${dayData.minutes} minutes`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" title="0 min"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" title="1-15 min"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/60" title="16-30 min"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" title="31-60 min"></div>
                                    <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" title="60+ min"></div>
                                </div>
                                <span>More</span>
                            </div>
                            </div>
                        </motion.div>

                        {/* Badges Section */}
                        <motion.div variants={itemVariants} className="relative rounded-2xl border-[0.75px] border-gray-200 dark:border-gray-800 p-1">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                <Award className="w-5 h-5 text-yellow-500" />
                                Badges & Achievements
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {currentBadges.map((badge, index) => (
                                    <div
                                        key={index}
                                        className={`group relative p-4 rounded-xl border ${badge.unlocked ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30' : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60'} flex flex-col items-center text-center transition-all hover:scale-105`}
                                    >
                                        <div className="text-3xl mb-2 filter drop-shadow-sm">{badge.icon}</div>
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{badge.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{badge.desc}</div>
                                        {!badge.unlocked && (
                                            <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                                                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">Locked</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                currentPage={badgePage}
                                totalPages={totalBadgePages}
                                onPageChange={setBadgePage}
                                className="mt-6"
                            />
                            </div>
                        </motion.div>

                        {/* Projects Section */}
                        <ProjectsSection projects={projects} setProjects={setProjects} />

                        {/* Certificates Section */}
                        <CertificateSection certificates={certificates} setCertificates={setCertificates} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;
