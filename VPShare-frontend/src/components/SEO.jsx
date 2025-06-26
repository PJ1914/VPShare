import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({
  title = 'CodeTapasya - Learn Programming Online | Best Coding Courses',
  description = 'Master programming with CodeTapasya\'s interactive courses. Learn JavaScript, React, Python, and more with hands-on projects and expert guidance.',
  keywords = 'programming courses, learn coding, online programming, JavaScript, React, Python, web development, coding bootcamp, programming tutorials',
  image = 'https://codetapasya.com/og-image.jpg',
  url = 'https://codetapasya.com',
  type = 'website',
  structuredData = null,
  canonical = null
}) => {
  const fullTitle = title.includes('CodeTapasya') ? title : `${title} - CodeTapasya`;
  const canonicalUrl = canonical || url;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="CodeTapasya" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CodeTapasya" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@CodeTapasya" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Additional SEO tags */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  structuredData: PropTypes.object,
  canonical: PropTypes.string
};

export default SEO;
