import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SkeletonProfile } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { BackgroundPaths } from '@/components/ui/BackgroundPaths';
import { GlowingEffect } from '@/components/ui/GlowingEffect';
import { useProfileStore } from '../store';

import {
  User, MapPin, Link as LinkIcon, Github, Linkedin, Twitter, Facebook, Youtube, Instagram,
  Camera, Edit2, Save, X, Award, BookOpen, Code, Zap, Plus, Database,
  Clock, TrendingUp, Loader2
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
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
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
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
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
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
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
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
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
                      className={`text-xs px-2 py-1 rounded transition-colors ${newProject.techStack.includes(tech)
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
                        onClick={() => setNewProject({ ...newProject, icon: iconName })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${newProject.icon === iconName
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
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-750 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all group relative"
                >
                  <button
                    onClick={() => removeProject(project.id)}
                    className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certificate
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertificate}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
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
                  onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
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
                  onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
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
                  onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
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
                  onChange={(e) => setNewCertificate({ ...newCertificate, credentialId: e.target.value })}
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
                  onChange={(e) => setNewCertificate({ ...newCertificate, credentialUrl: e.target.value })}
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
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-750 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all group relative"
              >
                <button
                  onClick={() => removeCertificate(cert.id)}
                  className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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

  // ✅ Read state from Zustand store instead of local useState
  const loading = useProfileStore((state) => state.loading);
  const saving = useProfileStore((state) => state.saving);
  const isEditing = useProfileStore((state) => state.isEditing);
  const previewImage = useProfileStore((state) => state.previewImage);
  const selectedYear = useProfileStore((state) => state.selectedYear);
  const badgePage = useProfileStore((state) => state.badgePage);
  const profileData = useProfileStore((state) => state.profileData);
  const stats = useProfileStore((state) => state.stats);
  const activityData = useProfileStore((state) => state.activityData);
  const skills = useProfileStore((state) => state.skills);
  const projects = useProfileStore((state) => state.projects);
  const certificates = useProfileStore((state) => state.certificates);

  // ✅ Get store actions
  const setIsEditing = useProfileStore((state) => state.setIsEditing);
  const setSelectedYear = useProfileStore((state) => state.setSelectedYear);
  const setBadgePage = useProfileStore((state) => state.setBadgePage);
  const updateProfileField = useProfileStore((state) => state.updateProfileField);
  const updateSocialField = useProfileStore((state) => state.updateSocialField);
  const setSkills = useProfileStore((state) => state.setSkills);
  const setProjects = useProfileStore((state) => state.setProjects);
  const setCertificates = useProfileStore((state) => state.setCertificates);
  const uploadProfileImage = useProfileStore((state) => state.uploadProfileImage);
  const saveProfile = useProfileStore((state) => state.saveProfile);

  const badgesPerPage = 4;





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

  // ✅ OPTIMIZED: Use store's fetchUserData and fetchActivityData
  const fetchUserDataFromStore = useProfileStore((state) => state.fetchUserData);
  const fetchActivityDataFromStore = useProfileStore((state) => state.fetchActivityData);

  useEffect(() => {
    if (user) {
      // Load profile + stats first (fast - ~500ms)
      fetchUserDataFromStore(user);

      // Load activity graph separately after a small delay (doesn't block UI)
      const activityTimer = setTimeout(() => {
        fetchActivityDataFromStore(user);
      }, 150); // Small delay to prioritize profile rendering

      return () => clearTimeout(activityTimer);
    }
  }, [user, selectedYear, fetchUserDataFromStore, fetchActivityDataFromStore]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfileImage(user, file);
    }
  };

  const handleSaveProfile = () => {
    saveProfile(user);
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
                  <div className="p-6 flex flex-col items-center text-center border-b border-gray-200 dark:border-gray-800 relative z-10">
                    <div className="relative mb-6 group">
                      <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-gray-800 shadow-2xl ring-4 ring-gray-100 dark:ring-gray-800/50">
                        <img
                          src={previewImage || user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-1 right-1 p-2.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all shadow-lg ring-4 ring-white dark:ring-gray-900">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="w-full space-y-4 mb-6">
                        <div className="space-y-3">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={profileData.displayName}
                              onChange={(e) => updateProfileField('displayName', e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-center font-bold text-lg rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                              placeholder="Display Name"
                            />
                          </div>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                            <input
                              type="text"
                              value={profileData.username}
                              onChange={(e) => updateProfileField('username', e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-center text-sm rounded-xl py-2 pl-8 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                              placeholder="username"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => updateProfileField('bio', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none resize-none min-h-[100px]"
                            placeholder="Tell the world about yourself..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profileData.displayName || 'User'}</h2>
                        {profileData.username && (
                          <p className="text-sm text-blue-500 font-medium mb-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                            @{profileData.username}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mb-0.5" />
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                          {profileData.bio || "No bio yet. Click edit to add one!"}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 w-full">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-semibold transform active:scale-95"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2.5 px-4 rounded-xl transition-all text-sm font-semibold transform active:scale-95"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 py-2.5 px-4 rounded-xl transition-all text-sm font-semibold shadow-sm hover:shadow-md group"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                          <span>Edit Profile</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="space-y-4">
                      {/* Location & Website */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Location</p>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.location}
                                onChange={(e) => updateProfileField('location', e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-900 dark:text-white font-medium p-0 border-none focus:ring-0 placeholder-gray-400"
                                placeholder="Add location"
                              />
                            ) : (
                              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                                {profileData.location || 'Not set'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                            <LinkIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Website</p>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.website}
                                onChange={(e) => updateProfileField('website', e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-900 dark:text-white font-medium p-0 border-none focus:ring-0 placeholder-gray-400"
                                placeholder="https://example.com"
                              />
                            ) : (
                              <a
                                href={profileData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm font-medium truncate block ${profileData.website ? 'text-blue-600 dark:text-blue-400 hover:underline' : 'text-gray-400'}`}
                              >
                                {profileData.website || 'Not set'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Social Profiles</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['github', 'linkedin', 'twitter', 'instagram'].map((platform) => (
                          isEditing ? (
                            <div key={platform} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800">
                              {platform === 'github' && <Github className="w-4 h-4 text-gray-700 dark:text-white" />}
                              {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600" />}
                              {platform === 'twitter' && <Twitter className="w-4 h-4 text-sky-500" />}
                              {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                              <input
                                type="text"
                                value={profileData.social[platform]}
                                onChange={(e) => updateSocialField(platform, e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-900 dark:text-white p-0 border-none focus:ring-0 placeholder-gray-400"
                                placeholder="Username"
                              />
                            </div>
                          ) : (
                            profileData.social[platform] && (
                              <a
                                key={platform}
                                href={`https://${platform}.com/${profileData.social[platform]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
                              >
                                {platform === 'github' && <Github className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />}
                                {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />}
                                {platform === 'twitter' && <Twitter className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />}
                                {platform === 'instagram' && <Instagram className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" />}
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white truncate transition-colors">
                                  {profileData.social[platform]}
                                </span>
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
                      className={`group relative p-4 rounded-xl border ${badge.unlocked ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-800/50' : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60 hover:opacity-80'} flex flex-col items-center text-center transition-all hover:scale-105 cursor-pointer`}
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
