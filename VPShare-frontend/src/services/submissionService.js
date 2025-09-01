import axios from 'axios';
import { auth } from '../config/firebase';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

class SubmissionService {
  constructor() {
    this.db = getFirestore();
  }

  // Submit a project
  async submitProject(submissionData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!submissionData.projectTitle || !submissionData.githubRepo) {
        throw new Error('Project title and GitHub repository are required');
      }

      // Validate GitHub URL
      if (!this.isValidGitHubUrl(submissionData.githubRepo)) {
        throw new Error('Please provide a valid GitHub repository URL');
      }

      // Validate demo URLs if provided
      if (submissionData.liveDemo && !this.isValidUrl(submissionData.liveDemo)) {
        throw new Error('Please provide a valid live demo URL');
      }

      if (submissionData.videoDemo && !this.isValidUrl(submissionData.videoDemo)) {
        throw new Error('Please provide a valid video demo URL');
      }

      // Create submission document
      const submission = {
        userId: user.uid,
        userEmail: user.email,
        ...submissionData,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'submitted',
        version: 1,
        evaluationScore: null,
        judgeComments: [],
        isPublic: true
      };

      // Save to Firestore
      const submissionRef = await addDoc(collection(this.db, 'hackathon_submissions'), submission);

      return {
        success: true,
        data: {
          submissionId: submissionRef.id,
          ...submission
        },
        message: 'Project submitted successfully!'
      };

    } catch (error) {
      console.error('Submission error:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit project'
      };
    }
  }

  // Update an existing submission
  async updateSubmission(submissionId, updateData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get existing submission
      const submissionRef = doc(this.db, 'hackathon_submissions', submissionId);
      const submissionDoc = await getDoc(submissionRef);

      if (!submissionDoc.exists()) {
        throw new Error('Submission not found');
      }

      const existingSubmission = submissionDoc.data();

      // Check ownership
      if (existingSubmission.userId !== user.uid) {
        throw new Error('You can only update your own submissions');
      }

      // Update submission
      const updatedSubmission = {
        ...updateData,
        updatedAt: serverTimestamp(),
        version: existingSubmission.version + 1
      };

      await updateDoc(submissionRef, updatedSubmission);

      return {
        success: true,
        data: { submissionId, ...updatedSubmission },
        message: 'Submission updated successfully!'
      };

    } catch (error) {
      console.error('Update error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update submission'
      };
    }
  }

  // Get user's submissions
  async getUserSubmissions() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const submissionsQuery = query(
        collection(this.db, 'hackathon_submissions'),
        where('userId', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(submissionsQuery);
      const submissions = [];

      snapshot.forEach(doc => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        });
      });

      return {
        success: true,
        data: submissions
      };

    } catch (error) {
      console.error('Error fetching submissions:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch submissions',
        data: []
      };
    }
  }

  // Get all public submissions (for showcase)
  async getPublicSubmissions(limit = 50) {
    try {
      const submissionsQuery = query(
        collection(this.db, 'hackathon_submissions'),
        where('isPublic', '==', true),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(submissionsQuery);
      const submissions = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          // Don't expose user's personal info in public view
          userId: undefined,
          userEmail: undefined
        });
      });

      return {
        success: true,
        data: submissions.slice(0, limit)
      };

    } catch (error) {
      console.error('Error fetching public submissions:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch submissions',
        data: []
      };
    }
  }

  // Delete a submission
  async deleteSubmission(submissionId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const submissionRef = doc(this.db, 'hackathon_submissions', submissionId);
      const submissionDoc = await getDoc(submissionRef);

      if (!submissionDoc.exists()) {
        throw new Error('Submission not found');
      }

      const submission = submissionDoc.data();

      // Check ownership
      if (submission.userId !== user.uid) {
        throw new Error('You can only delete your own submissions');
      }

      await deleteDoc(submissionRef);

      return {
        success: true,
        message: 'Submission deleted successfully'
      };

    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete submission'
      };
    }
  }

  // Validate GitHub repository URL
  isValidGitHubUrl(url) {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  }

  // Validate general URL
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Get GitHub repository information
  async getGitHubRepoInfo(repoUrl) {
    try {
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL');
      }

      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, '');

      // Fetch repository info from GitHub API
      const response = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`);
      
      return {
        success: true,
        data: {
          name: response.data.name,
          description: response.data.description,
          language: response.data.language,
          stars: response.data.stargazers_count,
          forks: response.data.forks_count,
          lastUpdated: response.data.updated_at,
          topics: response.data.topics || []
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch repository information'
      };
    }
  }

  // Check if URL is accessible
  async checkUrlAccessibility(url) {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return {
        success: true,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        message: 'URL is not accessible'
      };
    }
  }

  // Get deployment platform from URL
  getDeploymentPlatform(url) {
    if (url.includes('vercel.app')) return 'Vercel';
    if (url.includes('netlify.app') || url.includes('netlify.com')) return 'Netlify';
    if (url.includes('github.io')) return 'GitHub Pages';
    if (url.includes('heroku.com')) return 'Heroku';
    if (url.includes('firebase.app')) return 'Firebase';
    if (url.includes('surge.sh')) return 'Surge';
    return 'Other';
  }

  // Validate tech stack
  validateTechStack(techStack) {
    const validTech = [
      'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js',
      'Node.js', 'Express', 'Fastify', 'Koa',
      'Python', 'Django', 'Flask', 'FastAPI',
      'JavaScript', 'TypeScript', 'HTML', 'CSS',
      'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
      'Firebase', 'AWS', 'Azure', 'GCP',
      'Docker', 'Kubernetes', 'Git', 'GitHub Actions'
    ];

    return techStack.filter(tech => 
      validTech.some(valid => 
        tech.toLowerCase().includes(valid.toLowerCase())
      )
    );
  }

  // Generate submission summary
  generateSubmissionSummary(submission) {
    return {
      id: submission.id,
      title: submission.projectTitle,
      description: submission.description.substring(0, 150) + '...',
      techStack: submission.techStack.slice(0, 5),
      deploymentPlatform: this.getDeploymentPlatform(submission.liveDemo || ''),
      hasDemo: !!submission.liveDemo,
      hasVideo: !!submission.videoDemo,
      submittedAt: submission.submittedAt,
      status: submission.status
    };
  }
}

export default new SubmissionService();
