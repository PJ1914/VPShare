import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography, Container, Box, Paper } from '@mui/material';
import SEO from '../components/SEO';
import '../styles/PolicyPages.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms & Conditions - CodeTapasya';
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms and Conditions",
    "description": "CodeTapasya's comprehensive Terms and Conditions governing the use of our online programming education platform.",
    "url": "https://codetapasya.com/terms-conditions",
    "isPartOf": {
      "@type": "WebSite",
      "name": "CodeTapasya",
      "url": "https://codetapasya.com"
    },
    "mainEntity": {
      "@type": "Article",
      "headline": "Terms and Conditions - CodeTapasya",
      "description": "Legal terms governing the use of CodeTapasya's programming education platform",
      "author": {
        "@type": "Organization",
        "name": "CodeTapasya"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CodeTapasya"
      },
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString().split('T')[0]
    }
  };

  return (
    <div className="policy-page">
      <SEO
        title="Terms & Conditions - CodeTapasya | User Agreement & Platform Rules"
        description="Read CodeTapasya's comprehensive Terms and Conditions outlining user responsibilities, platform usage guidelines, subscription terms, and legal agreements for our programming education platform."
        keywords="terms and conditions, user agreement, platform rules, CodeTapasya legal, subscription terms, programming courses legal, online education terms"
        url="https://codetapasya.com/terms-conditions"
        image="https://codetapasya.com/og-terms.jpg"
        type="article"
        structuredData={structuredData}
      />
      
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <Box className="policy-header">
            <Typography variant="h3" component="h1" gutterBottom>
              Terms & Conditions
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Paper elevation={2} className="policy-content">
            <Box p={4}>
              <Typography variant="h5" gutterBottom className="section-title">
                1. Introduction and Acceptance of Terms
              </Typography>
              <Typography paragraph>
                Welcome to CodeTapasya, India's premier coding education platform owned and operated by CodeTapasya Developers. By creating an account, accessing our services, or using any part of our platform, you ("User," "you," or "your") agree to be legally bound by these Terms and Conditions ("Terms," "Agreement").
              </Typography>
              <Typography paragraph>
                These Terms constitute a legally binding agreement between you and CodeTapasya regarding your use of our comprehensive learning platform, including but not limited to:
              </Typography>
              <ul className="policy-list">
                <li><strong>Interactive Courses:</strong> Project-based programming courses in Python, JavaScript, Web Development, Data Science, and Machine Learning</li>
                <li><strong>Code Playground:</strong> Browser-based coding environment with multi-language support and instant feedback</li>
                <li><strong>GitHub Integration:</strong> Portfolio building and assignment submission through GitHub connectivity</li>
                <li><strong>Assessment System:</strong> Interactive quizzes, coding challenges, and progress tracking</li>
                <li><strong>Community Features:</strong> Discussion forums, peer collaboration, and mentorship programs</li>
                <li><strong>CodeTapasya AI:</strong> AI Assistant for instant coding help and learning guidance</li>
                <li><strong>Premium Services:</strong> Advanced features, priority support, and exclusive content</li>
              </ul>
              <Typography paragraph>
                <strong>Agreement Updates:</strong> CodeTapasya reserves the right to modify these Terms at any time. Material changes will be communicated via email notification and platform announcements. Continued use of our services after such modifications constitutes acceptance of the updated Terms.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                2. User Registration and Account Management
              </Typography>
              <Typography paragraph>
                <strong>Eligibility Requirements:</strong>
              </Typography>
              <ul className="policy-list">
                <li>You must be at least 13 years old to create an account</li>
                <li>Users between 13-17 years old must have verifiable parental or guardian consent</li>
                <li>Corporate accounts require authorization from an authorized representative</li>
                <li>International users must comply with their local laws regarding online education services</li>
              </ul>
              
              <Typography paragraph>
                <strong>Account Security and Responsibilities:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Credential Protection:</strong> Maintain strict confidentiality of login credentials; never share passwords</li>
                <li><strong>Account Monitoring:</strong> Regularly monitor your account for unauthorized access or suspicious activity</li>
                <li><strong>Immediate Reporting:</strong> Report security breaches, unauthorized access, or suspicious activity within 24 hours</li>
                <li><strong>Accurate Information:</strong> Provide truthful, current, and complete registration information</li>
                <li><strong>Profile Updates:</strong> Keep account information updated, especially contact details for important notifications</li>
                <li><strong>Single Account Policy:</strong> One account per person; multiple accounts may result in termination</li>
              </ul>

              <Typography paragraph>
                <strong>Account Verification:</strong> CodeTapasya may require email verification, phone number confirmation, or additional identity verification for premium services or suspicious activity prevention.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                3. Comprehensive Acceptable Use Policy
              </Typography>
              <Typography paragraph>
                CodeTapasya maintains a zero-tolerance policy for misuse. Users agree to engage ethically and professionally in all platform activities.
              </Typography>
              
              <Typography paragraph>
                <strong>Strictly Prohibited Activities:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Academic Dishonesty:</strong> Plagiarizing code, submitting others' work as your own, or using unauthorized assistance in assessments</li>
                <li><strong>Harassment and Discrimination:</strong> Offensive behavior based on race, gender, religion, nationality, sexual orientation, disability, or any protected characteristic</li>
                <li><strong>Platform Abuse:</strong> Attempting to hack, overload, or disrupt our servers, databases, or security systems</li>
                <li><strong>Content Violations:</strong> Uploading malicious code, viruses, spam, or inappropriate content including adult material</li>
                <li><strong>Commercial Misuse:</strong> Using the platform for unauthorized commercial activities, solicitation, or advertising</li>
                <li><strong>Intellectual Property Infringement:</strong> Violating copyrights, trademarks, or other intellectual property rights</li>
                <li><strong>Account Fraud:</strong> Creating fake accounts, impersonating others, or providing false information</li>
                <li><strong>System Manipulation:</strong> Exploiting bugs, using automation tools, or manipulating progress tracking systems</li>
                <li><strong>Data Mining:</strong> Scraping, extracting, or harvesting platform data without explicit written permission</li>
              </ul>

              <Typography paragraph>
                <strong>Community Standards:</strong> Users must maintain respectful discourse, provide constructive feedback, use appropriate language, and contribute positively to the learning environment.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                4. Intellectual Property Rights and Content Ownership
              </Typography>
              <Typography paragraph>
                <strong>CodeTapasya's Proprietary Content:</strong>
              </Typography>
              <Typography paragraph>
                All educational materials, including courses, tutorials, videos, quizzes, coding challenges, platform features, user interface design, algorithms, and branding elements are the exclusive intellectual property of CodeTapasya and protected by Indian and international copyright laws.
              </Typography>
              
              <Typography paragraph>
                <strong>Licensed Use Permissions:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Personal Learning:</strong> Access and study content for personal skill development</li>
                <li><strong>Offline Study:</strong> Download permitted materials for offline learning during subscription period</li>
                <li><strong>Knowledge Application:</strong> Apply learned concepts in personal and professional projects</li>
                <li><strong>Portfolio Building:</strong> Showcase projects created using knowledge gained from our courses</li>
                <li><strong>Educational Sharing:</strong> Discuss concepts learned with peers in educational contexts</li>
              </ul>

              <Typography paragraph>
                <strong>Strict Usage Restrictions:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>No Redistribution:</strong> Sharing, selling, or redistributing our content through any medium</li>
                <li><strong>No Commercial Use:</strong> Using our content for commercial training, workshops, or competing platforms</li>
                <li><strong>No Reverse Engineering:</strong> Attempting to copy, recreate, or reverse engineer our platform features</li>
                <li><strong>Attribution Requirements:</strong> Removing copyright notices, watermarks, or attribution information</li>
                <li><strong>No Derivative Works:</strong> Creating unauthorized derivative works or adaptations for commercial purposes</li>
              </ul>

              <Typography paragraph>
                <strong>User-Generated Content Policy:</strong> When you submit code, projects, comments, or participate in discussions, you retain ownership of your original work but grant CodeTapasya a perpetual, royalty-free license to display, modify, and use your submissions for educational purposes, platform improvement, and promotional activities.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                5. Subscription Plans and Payment Terms
              </Typography>
              <Typography paragraph>
                <strong>Service Tiers:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Free Tier (Permanent):</strong> Access to blogs, sample projects, community forums, and basic playground features</li>
                <li><strong>Monthly Premium:</strong> ₹99/month - Full access to all courses, advanced playground features, priority support, and progress analytics</li>
                <li><strong>Annual Premium:</strong> ₹799/year - All monthly benefits plus early access to new courses, exclusive workshops, and enhanced community features</li>
                <li><strong>Enterprise Solutions:</strong> Custom pricing for institutions, schools, and corporate training programs</li>
              </ul>

              <Typography paragraph>
                <strong>Payment Processing and Billing:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Secure Processing:</strong> All payments processed through Razorpay with bank-grade security</li>
                <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the next billing cycle</li>
                <li><strong>Currency:</strong> All prices displayed in Indian Rupees (INR) including applicable GST and taxes</li>
                <li><strong>Payment Methods:</strong> Credit cards, debit cards, UPI, net banking, and digital wallets accepted</li>
                <li><strong>Failed Payments:</strong> Service may be suspended for failed payments; 7-day grace period provided</li>
                <li><strong>Price Changes:</strong> 30-day advance notice for any subscription price modifications</li>
              </ul>

              <Typography paragraph>
                <strong>Subscription Management:</strong> Users can upgrade, downgrade, or cancel subscriptions through account settings. Changes take effect at the next billing cycle unless otherwise specified.
              </Typography>
              <ul className="policy-list">
                <li><strong>Refunds:</strong> Refunds are not provided for partial use or mid-term cancellations, except as required by law</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                6. Community Guidelines and Learning Environment
              </Typography>
              <Typography paragraph>
                CodeTapasya fosters an inclusive, supportive learning community. All users must contribute to maintaining this environment through respectful engagement and constructive participation.
              </Typography>
              
              <Typography paragraph>
                <strong>Community Participation Standards:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Respectful Interaction:</strong> Treat all community members with dignity, regardless of skill level or background</li>
                <li><strong>Constructive Feedback:</strong> Provide helpful, specific feedback that encourages learning and improvement</li>
                <li><strong>Knowledge Sharing:</strong> Share insights, resources, and experiences that benefit the entire community</li>
                <li><strong>Mentorship Culture:</strong> Support beginners and contribute to peer learning initiatives</li>
                <li><strong>Professional Communication:</strong> Use appropriate language in all discussions, forums, and comments</li>
                <li><strong>Cultural Sensitivity:</strong> Respect diverse backgrounds, cultures, and learning styles</li>
              </ul>

              <Typography paragraph>
                <strong>Discussion Forum Guidelines:</strong> Stay on-topic, search before posting duplicate questions, provide context for coding problems, acknowledge helpful responses, and maintain confidentiality of other users' personal information.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                7. Code Submission and Project Guidelines
              </Typography>
              <Typography paragraph>
                <strong>Original Work Requirements:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Authenticity:</strong> All submitted code and projects must be your original work or properly attributed</li>
                <li><strong>Proper Attribution:</strong> Clearly cite external libraries, frameworks, tutorials, or code snippets used</li>
                <li><strong>License Compliance:</strong> Respect open-source licenses and attribution requirements</li>
                <li><strong>Academic Integrity:</strong> Collaboration is encouraged, but final submissions must represent your understanding</li>
              </ul>

              <Typography paragraph>
                <strong>Code Quality and Safety Standards:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>No Malicious Code:</strong> Submissions must not contain viruses, malware, or harmful scripts</li>
                <li><strong>Clean Code Practices:</strong> Follow industry standards for readability, documentation, and organization</li>
                <li><strong>Security Awareness:</strong> Avoid exposing sensitive information like API keys or personal data</li>
                <li><strong>Performance Considerations:</strong> Ensure code submissions don't consume excessive system resources</li>
              </ul>

              <Typography paragraph>
                <strong>GitHub Integration Terms:</strong> When connecting your GitHub account, you authorize CodeTapasya to access public repositories for portfolio display and assignment submission. Private repository access requires explicit permission and is used solely for educational purposes.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                8. Platform Availability and Technical Support
              </Typography>
              <Typography paragraph>
                <strong>Service Level Commitments:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Uptime Target:</strong> 99.5% platform availability with minimal planned downtime</li>
                <li><strong>Maintenance Windows:</strong> Scheduled maintenance announced 48 hours in advance</li>
                <li><strong>Emergency Maintenance:</strong> Immediate action for security vulnerabilities or critical issues</li>
                <li><strong>Performance Monitoring:</strong> Continuous monitoring of platform performance and user experience</li>
              </ul>

              <Typography paragraph>
                <strong>Support Services:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Free Users:</strong> Community forums, documentation, and email support (48-72 hour response)</li>
                <li><strong>Premium Users:</strong> Priority email support (24-48 hour response) and live chat during business hours</li>
                <li><strong>Enterprise Users:</strong> Dedicated account management and phone support</li>
                <li><strong>Technical Issues:</strong> Platform bugs, payment problems, and account access issues receive priority attention</li>
              </ul>

              <Typography paragraph>
                <strong>Planned Updates and Features:</strong> CodeTapasya continuously evolves with new courses, features, and improvements. The upcoming <em>Scode</em> collaborative coding platform will provide real-time collaboration with AI assistance.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                9. Account Termination and Data Retention
              </Typography>
              <Typography paragraph>
                <strong>User-Initiated Account Closure:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Self-Service Deletion:</strong> Users can delete accounts through settings with immediate effect</li>
                <li><strong>Data Export:</strong> Download personal data, certificates, and project history before deletion</li>
                <li><strong>Subscription Cancellation:</strong> Active subscriptions must be cancelled separately before account deletion</li>
                <li><strong>Irreversible Process:</strong> Account deletion is permanent and cannot be undone</li>
              </ul>

              <Typography paragraph>
                <strong>Platform-Initiated Termination:</strong>
              </Typography>
              <Typography paragraph>
                CodeTapasya reserves the right to suspend or terminate accounts for violations of these Terms, including but not limited to:
              </Typography>
              <ul className="policy-list">
                <li><strong>Severe Policy Violations:</strong> Harassment, plagiarism, or malicious activities</li>
                <li><strong>Fraudulent Activity:</strong> Payment fraud, fake accounts, or unauthorized access attempts</li>
                <li><strong>Repeated Minor Violations:</strong> Multiple warnings for community guideline breaches</li>
                <li><strong>Legal Requirements:</strong> Court orders or regulatory compliance requirements</li>
                <li><strong>Extended Inactivity:</strong> Accounts inactive for more than 2 years (with 60-day notice)</li>
              </ul>

              <Typography paragraph>
                <strong>Data Retention Policy:</strong> Upon account termination, learning certificates remain valid indefinitely. Personal data is deleted within 30 days, except for anonymized usage statistics retained for platform improvement.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                10. Disclaimers and Limitation of Liability
              </Typography>
              <Typography paragraph>
                <strong>Educational Purpose Disclaimer:</strong>
              </Typography>
              <Typography paragraph>
                CodeTapasya provides educational content for skill development purposes. While our courses are designed to be industry-relevant and comprehensive, we make no guarantees regarding:
              </Typography>
              <ul className="policy-list">
                <li><strong>Employment Outcomes:</strong> Job placement, salary increases, or career advancement</li>
                <li><strong>Certification Value:</strong> Recognition by specific employers or educational institutions</li>
                <li><strong>Technology Currency:</strong> Rapid changes in programming languages and frameworks may affect content relevance</li>
                <li><strong>Individual Results:</strong> Learning outcomes vary based on effort, prior knowledge, and application</li>
              </ul>

              <Typography paragraph>
                <strong>Technical Disclaimers:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Content Accuracy:</strong> While we strive for accuracy, programming concepts and best practices evolve rapidly</li>
                <li><strong>Third-Party Integration:</strong> GitHub, payment processors, and other integrated services are governed by their respective terms</li>
                <li><strong>Browser Compatibility:</strong> Platform optimized for modern browsers; legacy browser support not guaranteed</li>
                <li><strong>Mobile Experience:</strong> Full functionality may vary on mobile devices</li>
              </ul>

              <Typography paragraph>
                <strong>Liability Limitations:</strong>
              </Typography>
              <Typography paragraph>
                CodeTapasya's total liability for any claims related to these Terms or platform usage is limited to the amount paid for services in the 12 months preceding the claim. We are not liable for:
              </Typography>
              <ul className="policy-list">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Lost profits, data, or business opportunities</li>
                <li>Third-party actions or content</li>
                <li>Force majeure events beyond our reasonable control</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                11. Privacy and Data Protection
              </Typography>
              <Typography paragraph>
                Your privacy is paramount to us. CodeTapasya adheres to strict data protection standards and Indian privacy laws. Our comprehensive Privacy Policy details how we collect, use, store, and protect your personal information. For complete information, refer to our Privacy Policy.
              </Typography>
              
              <Typography paragraph>
                <strong>Data Processing Consent:</strong> By using our platform, you consent to our data practices as outlined in our Privacy Policy, including:
              </Typography>
              <ul className="policy-list">
                <li><strong>Learning Analytics:</strong> Progress tracking, course completion analytics, and personalized recommendations</li>
                <li><strong>Platform Improvement:</strong> Anonymized usage data to enhance user experience and course effectiveness</li>
                <li><strong>Communication:</strong> Educational content, platform updates, and subscription-related notifications</li>
                <li><strong>Security Monitoring:</strong> Account protection and fraud prevention measures</li>
              </ul>

              <Typography paragraph>
                <strong>International Users:</strong> Users outside India acknowledge that their data may be processed in India in accordance with Indian data protection laws and our Privacy Policy.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                12. Governing Law and Dispute Resolution
              </Typography>
              <Typography paragraph>
                <strong>Jurisdiction and Applicable Law:</strong>
              </Typography>
              <Typography paragraph>
                These Terms are governed by the laws of India. Any disputes arising from or relating to these Terms or your use of CodeTapasya shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.
              </Typography>

              <Typography paragraph>
                <strong>Dispute Resolution Process:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Good Faith Negotiation:</strong> Initial attempt to resolve disputes through direct communication</li>
                <li><strong>Mediation:</strong> If negotiation fails, disputes may be referred to mediation</li>
                <li><strong>Arbitration:</strong> Final disputes resolved through arbitration under the Indian Arbitration and Conciliation Act, 2015</li>
                <li><strong>Language:</strong> All proceedings conducted in English</li>
              </ul>

              <Typography paragraph>
                <strong>Consumer Rights:</strong> Nothing in these Terms limits your rights as a consumer under applicable Indian consumer protection laws.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                13. Contact Information and Legal Notices
              </Typography>
              <Typography paragraph>
                For all matters related to these Terms, please contact us through the following channels:
              </Typography>
              <ul className="policy-list">
                <li><strong>Grievance Officer:</strong> Pranay Jumbarthi</li>
                <li><strong>Email:</strong> support@codetapasya.com</li>
                <li><strong>Address:</strong> CodeTapasya, Hyderabad, Telangana, India</li>
                <li><strong>Response Timeline:</strong> We aim to respond within 7 working days as per Indian law.</li>
              </ul>

              <Typography paragraph>
                <strong>Response Times:</strong> We aim to respond to all inquiries within 48 hours during business days. Legal matters may require additional processing time.
              </Typography>

              <Typography paragraph>
                For concerns related to data protection under the Digital Personal Data Protection Act (DPDPB), you may also contact our Grievance Officer at support@codetapasya.com.
              </Typography>

              <Box mt={4} p={3} className="policy-highlight">
                <Typography variant="h6" gutterBottom>
                  <strong>Our Commitment to Excellence</strong>
                </Typography>
                <Typography variant="body2">
                  These Terms and Conditions reflect CodeTapasya's commitment to providing a world-class educational experience while maintaining the highest standards of ethics, security, and user protection. We believe in empowering developers through quality education, fostering innovation, and building a thriving community of learners and creators.
                </Typography>
                <Typography variant="body2" style={{ marginTop: '1rem' }}>
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Typography variant="body2" style={{ marginTop: '0.5rem' }}>
                  <strong>Version:</strong> 2.0 - Comprehensive Policy Framework
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}

export default TermsConditions;