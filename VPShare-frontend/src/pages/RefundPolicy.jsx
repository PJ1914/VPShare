import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography, Container, Box, Paper } from '@mui/material';
import SEO from '../components/SEO';
import '../styles/PolicyPages.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Refund & Cancellation Policy - CodeTapasya';
  }, []);

  return (
    <div className="policy-page">
      <SEO 
        title="Refund & Cancellation Policy - CodeTapasya"
        description="Learn about CodeTapasya's refund and cancellation policy for subscription plans and premium content. Fair and transparent terms for all users."
        canonical="https://codetapasya.com/refund-policy"
        ogImage="https://codetapasya.com/og-refund.jpg"
        keywords="refund policy, cancellation policy, CodeTapasya terms, subscription refund, money back guarantee"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Refund & Cancellation Policy",
          "description": "CodeTapasya's comprehensive refund and cancellation policy for all subscription plans and services.",
          "url": "https://codetapasya.com/refund-policy",
          "isPartOf": {
            "@type": "WebSite",
            "name": "CodeTapasya",
            "url": "https://codetapasya.com"
          },
          "dateModified": new Date().toISOString(),
          "inLanguage": "en"
        }}
      />
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <Box className="policy-header">
            <Typography variant="h3" component="h1" gutterBottom>
              Refund & Cancellation Policy
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Effective Date: June 27, 2025
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Policy Version: v1.0
            </Typography>
          </Box>

          <Paper elevation={2} className="policy-content">
            <Box p={4}>
              <Typography variant="h5" gutterBottom className="section-title">
                1. Our Commitment to Quality
              </Typography>
              <Typography paragraph>
                At CodeTapasya, we strive to provide high-quality educational content and tools for developers. We understand that sometimes our services may not meet your expectations, and we are committed to resolving any issues fairly and promptly.
              </Typography>
              <Typography paragraph>
                This policy outlines the terms and conditions for refunds and cancellations for all CodeTapasya services, including subscription plans and premium content access.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                2. Subscription Plans Overview
              </Typography>
              <Typography paragraph>
                <strong>Free Plan:</strong> Always free with access to blogs, sample projects, and community features.
              </Typography>
              <Typography paragraph>
                <strong>Premium Plans:</strong>
              </Typography>
              <ul className="policy-list">
                <li><strong>Monthly Plan:</strong> ₹99/month - 30-day access to all courses and premium features</li>
                <li><strong>Yearly Plan:</strong> ₹799/year - 12-month access with additional benefits</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                3. Cancellation Policy
              </Typography>
              <Typography paragraph>
                <strong>How to Cancel:</strong>
              </Typography>
              <ul className="policy-list">
                <li>Log into your CodeTapasya account</li>
                <li>Go to Account Settings → Subscription Management</li>
                <li>Click "Cancel Subscription" and follow the prompts</li>
                <li>You will receive a confirmation email</li>
              </ul>
              
              <Typography paragraph>
                <strong>Cancellation Effects:</strong>
              </Typography>
              <ul className="policy-list">
                <li>Your subscription will remain active until the end of the current billing period</li>
                <li>You will continue to have access to premium content until expiration</li>
                <li>Auto-renewal will be disabled</li>
                <li>You can reactivate your subscription at any time</li>
                <li>Your learning progress and certificates will be preserved</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                4. Refund Eligibility
              </Typography>
              <Typography paragraph>
                We offer refunds under the following circumstances:
              </Typography>
              
              <Typography variant="h6" gutterBottom className="subsection-title">
                4.1 Technical Issues
              </Typography>
              <ul className="policy-list">
                <li>Inability to access purchased content due to verified platform-side technical issues not caused by the user's internet or device</li>
                <li>Significant functionality problems preventing course completion</li>
                <li>Payment processing errors resulting in duplicate charges</li>
              </ul>

              <Typography variant="h6" gutterBottom className="subsection-title">
                4.2 Content Quality Issues
              </Typography>
              <ul className="policy-list">
                <li>Course content significantly different from description</li>
                <li>Incomplete or corrupted course materials</li>
                <li>Outdated content that doesn't match current technology standards</li>
              </ul>

              <Typography variant="h6" gutterBottom className="subsection-title">
                4.3 Service Interruption
              </Typography>
              <ul className="policy-list">
                <li>Extended platform downtime (more than 48 hours)</li>
                <li>Permanent discontinuation of a purchased course</li>
                <li>Inability to provide promised features or support</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                5. Refund Limitations
              </Typography>
              <Typography paragraph>
                Refunds will NOT be granted in the following cases:
              </Typography>
              <ul className="policy-list">
                <li><strong>Content Consumption:</strong> If you have completed more than 20% of purchased course content</li>
                <li><strong>Time Limit:</strong> Refund requests made more than 7 days after purchase</li>
                <li><strong>Change of Mind:</strong> Simple change of mind without valid technical or quality issues</li>
                <li><strong>Violation of Terms:</strong> Account suspension or termination due to Terms violation</li>
                <li><strong>Free Content:</strong> Issues with free features or content</li>
                <li><strong>Third-party Issues:</strong> Problems caused by user's internet, device, or browser</li>
                <li><strong>Completed Courses:</strong> Courses that have been fully completed with certificates issued</li>
                <li>We reserve the right to deny refund requests that do not meet the eligibility criteria or where abuse of the refund system is suspected.</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                6. Refund Process
              </Typography>
              <Typography paragraph>
                <strong>Step 1: Contact Support</strong>
              </Typography>
              <Typography paragraph>
                Before requesting a refund, please contact our support team at <strong>support@codetapasya.com</strong> with:
              </Typography>
              <ul className="policy-list">
                <li>Your account email and username</li>
                <li>Transaction ID or payment reference</li>
                <li>Detailed description of the issue</li>
                <li>Screenshots or error messages (if applicable)</li>
              </ul>

              <Typography paragraph>
                <strong>Step 2: Issue Resolution</strong>
              </Typography>
              <Typography paragraph>
                Our team will attempt to resolve the issue within 24-48 hours. Many problems can be fixed without requiring a refund.
              </Typography>

              <Typography paragraph>
                <strong>Step 3: Refund Approval</strong>
              </Typography>
              <Typography paragraph>
                If the issue cannot be resolved, we will review your case and approve eligible refunds within 3-5 business days.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                7. Refund Processing Time
              </Typography>
              <ul className="policy-list">
                <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                <li><strong>UPI/Net Banking:</strong> 3-5 business days</li>
                <li><strong>Digital Wallets:</strong> 2-4 business days</li>
                <li><strong>Bank Transfers:</strong> 7-10 business days</li>
              </ul>
              <Typography paragraph>
                Refund processing times may vary depending on your bank or payment provider. CodeTapasya is not responsible for delays caused by financial institutions.
              </Typography>

              <Typography variant="h5" gutterBottom className="section-title">
                8. Partial Refunds
              </Typography>
              <Typography paragraph>
                In certain cases, we may offer partial refunds:
              </Typography>
              <ul className="policy-list">
                <li>Temporary service disruptions affecting part of subscription period</li>
                <li>Partial completion of courses due to technical issues</li>
                <li>Prorated refunds for annual subscriptions cancelled within the first month</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                9. Alternative Solutions
              </Typography>
              <Typography paragraph>
                Before processing refunds, we may offer alternative solutions:
              </Typography>
              <ul className="policy-list">
                <li><strong>Account Credit:</strong> Store credit for future purchases</li>
                <li><strong>Course Transfer:</strong> Access to equivalent or upgraded courses</li>
                <li><strong>Extended Access:</strong> Additional time to complete courses</li>
                <li><strong>Technical Support:</strong> One-on-one assistance to resolve issues</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                10. Dispute Resolution
              </Typography>
              <Typography paragraph>
                If you are not satisfied with our refund decision:
              </Typography>
              <ul className="policy-list">
                <li>Contact our escalation team at <strong>support@codetapasya.com</strong></li>
                <li>Provide additional evidence or documentation</li>
                <li>Request a second review of your case</li>
                <li>We will respond within 5-7 business days</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                11. Payment Gateway Policies
              </Typography>
              <Typography paragraph>
                All payments are processed through Razorpay, which is PCI DSS compliant. For payment-related disputes:
              </Typography>
              <ul className="policy-list">
                <li>Failed transactions are automatically refunded within 5-7 business days</li>
                <li>Duplicate charges will be refunded immediately upon verification</li>
                <li>Bank charges for refunds are borne by the payment gateway, not the user</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                12. Contact Information
              </Typography>
              <Typography paragraph>
                For refund requests or questions about this policy:
              </Typography>
              <ul className="policy-list">
                <li><strong>Support:</strong> support@codetapasya.com</li>
                <li><strong>Phone Support:</strong> Currently not available. Please raise a ticket through our support system or email us.</li>
                <li><strong>Response Time:</strong> 24-48 hours for initial response</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                13. Legal Jurisdiction
              </Typography>
              <Typography paragraph>
                This Refund & Cancellation Policy shall be governed by the laws of India. Any disputes relating to refunds shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India. By using our services, you agree to comply with this jurisdiction clause.
              </Typography>

              <Box mt={4} p={3} className="policy-highlight">
                <Typography variant="body2">
                  <strong>Our Guarantee:</strong> We stand behind the quality of our educational content. If you experience genuine issues with our service, we are committed to finding a fair solution. Your learning success is our priority, and we will work with you to ensure you have the best possible experience on CodeTapasya.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}

export default RefundPolicy;