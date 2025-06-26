import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography, Container, Box, Paper } from '@mui/material';
import SEO from '../components/SEO';
import '../styles/PolicyPages.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Shipping Policy - CodeTapasya';
  }, []);

  return (
    <div className="policy-page">
      <SEO 
        title="Shipping Policy - CodeTapasya"
        description="CodeTapasya's shipping policy for physical products and merchandise. Learn about delivery terms and conditions for our educational materials."
        canonical="https://codetapasya.com/shipping-policy"
        ogImage="https://codetapasya.com/og-shipping.jpg"
        keywords="shipping policy, delivery policy, CodeTapasya shipping, merchandise delivery, educational materials shipping"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Shipping Policy",
          "description": "CodeTapasya's shipping and delivery policy for physical products and educational merchandise.",
          "url": "https://codetapasya.com/shipping-policy",
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
              Shipping Policy
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Effective Date: June 27, 2025
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Version: 1.0
            </Typography>
          </Box>

          <Paper elevation={2} className="policy-content">
            <Box p={4}>
              <Typography variant="h5" gutterBottom className="section-title">
                1. Digital Services Only
              </Typography>
              <Typography paragraph>
                CodeTapasya is primarily a digital learning platform that provides online coding courses, tutorials, and educational content. Currently, we do not offer physical products that require shipping.
              </Typography>
              <Typography paragraph>
                All our services are delivered digitally through our online platform, including:
              </Typography>
              <ul className="policy-list">
                <li>Online coding courses and tutorials</li>
                <li>Interactive coding playground access</li>
                <li>Digital certificates and badges</li>
                <li>Premium feature access</li>
                <li>Community forum participation</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                2. Instant Digital Delivery
              </Typography>
              <Typography paragraph>
                Upon successful payment and account verification:
              </Typography>
              <ul className="policy-list">
                <li><strong>Immediate Access:</strong> Premium features are activated instantly</li>
                <li><strong>Course Materials:</strong> Available immediately after subscription</li>
                <li><strong>Digital Certificates:</strong> Generated upon course completion</li>
                <li><strong>Account Upgrades:</strong> Processed within minutes</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                3. Future Physical Products
              </Typography>
              <Typography paragraph>
                While we currently focus on digital services, CodeTapasya may introduce physical products in the future, such as:
              </Typography>
              <ul className="policy-list">
                <li>Branded merchandise (t-shirts, stickers, mugs)</li>
                <li>Printed coding reference materials</li>
                <li>Hardware kits for programming projects</li>
                <li>Books and study guides</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                4. Shipping Policy for Future Physical Products
              </Typography>
              
              <Typography variant="h6" gutterBottom className="subsection-title">
                4.1 Shipping Coverage
              </Typography>
              <Typography paragraph>
                When we introduce physical products, we plan to offer:
              </Typography>
              <ul className="policy-list">
                <li><strong>Domestic Shipping:</strong> All major cities and towns in India</li>
                <li><strong>International Shipping:</strong> Select countries (to be announced)</li>
                <li><strong>Remote Areas:</strong> May require additional handling time</li>
              </ul>

              <Typography variant="h6" gutterBottom className="subsection-title">
                4.2 Estimated Delivery Times
              </Typography>
              <ul className="policy-list">
                <li><strong>Metro Cities:</strong> 2-3 business days</li>
                <li><strong>Tier 2 Cities:</strong> 3-5 business days</li>
                <li><strong>Rural Areas:</strong> 5-7 business days</li>
                <li><strong>International:</strong> 7-14 business days</li>
              </ul>

              <Typography variant="h6" gutterBottom className="subsection-title">
                4.3 Shipping Charges
              </Typography>
              <ul className="policy-list">
                <li><strong>Free Shipping:</strong> Orders above ₹500 within India</li>
                <li><strong>Standard Shipping:</strong> ₹50-100 depending on location</li>
                <li><strong>Express Shipping:</strong> ₹150-200 for next-day delivery</li>
                <li><strong>International:</strong> Calculated based on destination and weight</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                5. Order Processing
              </Typography>
              <Typography paragraph>
                For future physical products:
              </Typography>
              <ul className="policy-list">
                <li><strong>Order Confirmation:</strong> Immediate email confirmation</li>
                <li><strong>Processing Time:</strong> 1-2 business days</li>
                <li><strong>Packaging:</strong> Eco-friendly materials whenever possible</li>
                <li><strong>Tracking:</strong> Tracking number provided via email/SMS</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                6. Delivery and Returns
              </Typography>
              
              <Typography variant="h6" gutterBottom className="subsection-title">
                6.1 Delivery Process
              </Typography>
              <ul className="policy-list">
                <li>Delivery attempts during business hours (9 AM - 7 PM)</li>
                <li>SMS/Email notifications before delivery</li>
                <li>Signature required for valuable items</li>
                <li>Safe drop-off options available</li>
              </ul>

              <Typography variant="h6" gutterBottom className="subsection-title">
                6.2 Return Policy for Physical Products
              </Typography>
              <ul className="policy-list">
                <li><strong>Return Window:</strong> 7 days from delivery</li>
                <li><strong>Condition:</strong> Items must be unused and in original packaging</li>
                <li><strong>Return Shipping:</strong> Customer responsibility unless item defective</li>
                <li><strong>Refund Processing:</strong> 5-7 business days after return verification</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                7. International Shipping (Future)
              </Typography>
              <Typography paragraph>
                For international orders, customers should be aware of:
              </Typography>
              <ul className="policy-list">
                <li><strong>Customs Duties:</strong> Customer responsibility</li>
                <li><strong>Import Restrictions:</strong> Compliance with local laws</li>
                <li><strong>Extended Delivery:</strong> Possible delays due to customs</li>
                <li><strong>Address Accuracy:</strong> Critical for international delivery</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                8. Shipping Partners
              </Typography>
              <Typography paragraph>
                When we launch physical products, we plan to partner with:
              </Typography>
              <ul className="policy-list">
                <li><strong>Domestic:</strong> BlueDart, DTDC, India Post, Delhivery</li>
                <li><strong>International:</strong> DHL, FedEx, UPS</li>
                <li><strong>Last Mile:</strong> Local courier services for remote areas</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                9. Special Circumstances
              </Typography>
              
              <Typography variant="h6" gutterBottom className="subsection-title">
                9.1 Failed Delivery Attempts
              </Typography>
              <ul className="policy-list">
                <li>Multiple delivery attempts (usually 3)</li>
                <li>Package held at local facility for 7 days</li>
                <li>Customer notification via SMS/email</li>
                <li>Return to sender if unclaimed</li>
              </ul>

              <Typography variant="h6" gutterBottom className="subsection-title">
                9.2 Damaged or Lost Packages
              </Typography>
              <ul className="policy-list">
                <li>Immediate replacement for damaged items</li>
                <li>Investigation for lost packages</li>
                <li>Insurance coverage for high-value items</li>
                <li>Full refund if replacement not possible</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                10. Contact Information for Shipping
              </Typography>
              <Typography paragraph>
                For shipping-related queries (when applicable):
              </Typography>
              <ul className="policy-list">
                <li><strong>Support:</strong> support@codetapasya.com</li>
                <li><strong>Track Orders:</strong> Available through account dashboard</li>
                <li><strong>Customer Service:</strong> Available during business hours</li>
              </ul>

              <Typography variant="h5" gutterBottom className="section-title">
                11. Governing Law and Jurisdiction
              </Typography>
              <Typography paragraph>
                This Shipping Policy shall be governed by and interpreted in accordance with the laws of India. Any disputes relating to shipping or delivery shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.
              </Typography>

              <Box mt={4} p={3} style={{ backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                  🔔 <strong>Important Notice:</strong> As of June 2025, CodeTapasya offers only digital services with no physical product shipping. This Shipping Policy is published in anticipation of future product offerings. Users will be notified when physical merchandise becomes available.
                </Typography>
              </Box>

              <Box mt={3} p={3} style={{ backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <Typography variant="body2">
                  <strong>Stay Updated:</strong> Follow our announcements for updates on physical product launches, exclusive merchandise, and special shipping offers for CodeTapasya community members.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}

export default ShippingPolicy;