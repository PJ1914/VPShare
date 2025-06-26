import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography, Container, Box, Paper } from '@mui/material';
import '../styles/PolicyPages.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy - CodeTapasya';
  }, []);

  return (
    <div className="policy-page">
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
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Paper elevation={2} className="policy-content">
            <Box p={4}>
              <Typography variant="h5" gutterBottom className="section-title">
                1. Information We Collect
              </Typography>
              <Typography paragraph>
                CodeTapasya ("we", "our", or "us") collects information to provide you with a personalized learning experience. We collect:
              </Typography>
              <ul className="policy-list">
                <li><strong>Personal Information:</strong> Name, email address, username, and profile picture when you create an account</li>
                <li><strong>Learning Data:</strong> Course progress, quiz results, code submissions, and project uploads</li>
                <li><strong>Usage Information:</strong> How you interact with our platform, pages visited, and features used</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Razorpay (we don't store card details)</li>
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
                <li><strong>Service Providers:</strong> With trusted third-party services like Firebase (authentication), Razorpay (payments), and AWS (hosting)</li>
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
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <Typography paragraph>
                To exercise these rights, please contact us at <strong>privacy@codetapasya.com</strong>
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                7. Children's Privacy
              </Typography>
              <Typography paragraph>
                CodeTapasya is designed for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                8. International Data Transfers
              </Typography>
              <Typography paragraph>
                Your information may be transferred to and stored on servers located outside your country of residence. We ensure appropriate safeguards are in place to protect your data during international transfers.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                9. Data Retention
              </Typography>
              <Typography paragraph>
                We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Learning progress and course data are retained until you delete your account or request removal.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                10. Changes to This Policy
              </Typography>
              <Typography paragraph>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify users of significant changes via email or platform notifications. Continued use of CodeTapasya after changes constitutes acceptance of the updated policy.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                11. Contact Us
              </Typography>
              <Typography paragraph>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </Typography>
              <ul className="policy-list">
                <li><strong>Email:</strong> privacy@codetapasya.com</li>
                <li><strong>Support:</strong> support@codetapasya.com</li>
                <li><strong>Address:</strong> CodeTapasya, India</li>
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
