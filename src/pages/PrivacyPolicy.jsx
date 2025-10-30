import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography, Container, Box, Paper } from '@mui/material';
import SEO from '../components/SEO';
import '../styles/PolicyPages.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "CodeTapasya's Privacy Policy explaining how we collect, use, and protect your personal information on our online programming learning platform.",
    "url": "https://codetapasya.com/privacy-policy",
    "isPartOf": {
      "@type": "WebSite",
      "name": "CodeTapasya",
      "url": "https://codetapasya.com",
      "description": "Learn programming online with interactive courses and hands-on projects",
      "publisher": {
        "@type": "Organization",
        "name": "CodeTapasya",
        "url": "https://codetapasya.com"
      }
    },
    "mainEntity": {
      "@type": "Article",
      "headline": "Privacy Policy - CodeTapasya",
      "description": "Comprehensive privacy policy outlining data collection, usage, and protection practices",
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
        title="Privacy Policy - CodeTapasya | Data Protection & Security"
        description="Read CodeTapasya's comprehensive Privacy Policy to understand how we collect, use, and protect your personal information on our online programming learning platform."
        keywords="privacy policy, data protection, personal information, CodeTapasya, online learning, programming courses, data security, user privacy"
        url="https://codetapasya.com/privacy-policy"
        image="https://codetapasya.com/og-privacy.jpg"
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
              Privacy Policy
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Effective Date: June 27, 2025
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Policy Version: v1.0
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Paper elevation={2} className="policy-content">
            <Box p={4}>
              <Typography paragraph>
                CodeTapasya is the data controller for personal data collected through our platform. In certain cases, such as institutional partnerships, we may act as a data processor.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                1. Information We Collect
              </Typography>
              <Typography paragraph>
                CodeTapasya ("we", "our", or "us") collects information to provide you with a personalized learning experience. We collect:
              </Typography>
              <ul className="policy-list">
                <li><strong>Personal Information:</strong> Name, email address, username, and profile picture when you create an account</li>
                <li><strong>Learning Data:</strong> Course progress, quiz results, code submissions, and project uploads</li>
                <li><strong>GitHub Integration Data:</strong> Repository information, commit history, and code contributions when you connect your GitHub account</li>
                <li><strong>Usage Information:</strong> How you interact with our platform, pages visited, and features used</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies</li>
                <li><strong>Payment Information:</strong> Billing details are processed securely through Razorpay. We do not store or collect card information directly. Razorpay is PCI-DSS compliant and acts as our trusted payment processor.</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                2. How We Use Your Information
              </Typography>
              <Typography paragraph>
                We use your information to:
              </Typography>
              <ul className="policy-list">
                <li>Provide and maintain our educational services</li>
                <li>Personalize your learning experience and track progress</li>
                <li>Facilitate code repository management and project submissions</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important updates about courses and platform changes</li>
                <li>Improve our platform through analytics and user feedback</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                3. Information Sharing and Disclosure
              </Typography>
              <Typography paragraph>
                We respect your privacy and will never sell your personal information. We may share your information only in these circumstances:
              </Typography>
              <ul className="policy-list">
                <li><strong>Service Providers:</strong> With trusted third-party services like Firebase (authentication), Razorpay (payments), AWS (hosting), and GitHub (code repositories and project management)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users' safety</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets (users will be notified)</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                4. Data Security
              </Typography>
              <Typography paragraph>
                We implement industry-standard security measures to protect your information:
              </Typography>
              <ul className="policy-list">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Firebase</li>
                <li>OAuth-based secure integration with GitHub</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by employees</li>
                <li>Secure payment processing through PCI-compliant providers</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                5. Cookies and Tracking
              </Typography>
              <Typography paragraph>
                We use cookies and similar technologies to enhance your experience:
              </Typography>
              <ul className="policy-list">
                <li><strong>Essential Cookies:</strong> Required for platform functionality and user authentication</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <Typography paragraph>
                We use both session and persistent cookies, and third-party tools like Google Analytics, Firebase, and GitHub OAuth. These help track user behavior, preferences, and session activity.
              </Typography>
              <Typography paragraph>
                You can control cookies through your browser settings, but disabling them may affect platform functionality.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                6. Your Rights and Choices
              </Typography>
              <Typography paragraph>
                You have the following rights regarding your personal information:
              </Typography>
              <ul className="policy-list">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Export your learning data</li>
                <li><strong>GitHub Disconnect:</strong> Remove GitHub integration and associated data at any time</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <Typography paragraph>
                To exercise these rights, please contact us at <strong>privacy@codetapasya.com</strong>
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                7. Rights Under GDPR (For EU Users)
              </Typography>
              <Typography paragraph>
                If you are located in the European Union, you have the following additional rights:
              </Typography>
              <ul className="policy-list">
                <li><strong>Right to Object:</strong> You may object to how we process your data</li>
                <li><strong>Right to Restrict Processing:</strong> You may ask us to limit how we use your data</li>
                <li><strong>Right to Lodge Complaint:</strong> You may lodge a complaint with your local data protection authority</li>
                <li><strong>Legal Basis:</strong> We process your data based on consent, contracts, legal obligations, or our legitimate interest</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                8. Children's Privacy
              </Typography>
              <Typography paragraph>
                CodeTapasya is designed for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                9. International Data Transfers
              </Typography>
              <Typography paragraph>
                Your information may be transferred to and stored on servers located outside your country of residence, such as in India, AWS regions, or GitHub's global infrastructure. We implement contractual safeguards like Standard Contractual Clauses (SCCs) and technical protections to ensure your data remains secure during such transfers.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                10. Data Retention
              </Typography>
              <Typography paragraph>
                We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Learning progress and course data are retained until you delete your account or request removal. GitHub integration data is retained only while the connection is active.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                11. Changes to This Policy
              </Typography>
              <Typography paragraph>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify users of significant changes via email or platform notifications. Continued use of CodeTapasya after changes constitutes acceptance of the updated policy.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                12. Contact Us
              </Typography>
              <Typography paragraph>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </Typography>
              <ul className="policy-list">
                <li><strong>Email:</strong> privacy@codetapasya.com</li>
                <li><strong>Support:</strong> support@codetapasya.com</li>
                <li><strong>Address:</strong> CodeTapasya, Hyderabad, Telangana, India</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                13. Grievance Officer (India – DPDPB Compliance)
              </Typography>
              <Typography paragraph>
                In accordance with the Digital Personal Data Protection Act (DPDPB), you may contact our designated Grievance Officer for data protection concerns:
              </Typography>
              <ul className="policy-list">
                <li><strong>Grievance Officer:</strong> Pranay Jumbarthi</li>
                <li><strong>Email:</strong> support@codetapasya.com</li>
                <li><strong>Address:</strong> CodeTapasya, Hyderabad, Telangana, India</li>
                <li><strong>Response Timeline:</strong> We aim to respond within 7 working days as per Indian law.</li>
              </ul>

              <Box mt={4} p={3} className="policy-highlight">
                <Typography variant="body2">
                  <strong>Your Privacy Matters:</strong> At CodeTapasya, we are committed to protecting your privacy and providing transparency about our data practices. This policy explains how we collect, use, and safeguard your information to deliver the best possible learning experience.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}

export default PrivacyPolicy;