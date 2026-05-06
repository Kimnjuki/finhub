import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  structuredData?: any;
}

const SEOHead = ({ 
  title = "FINHUBAFRICA - Professional Crypto & Forex Trading Platform for Africa",
  description = "Leading African financial trading platform. Access real-time cryptocurrency & forex data, advanced charts, market analytics, trading tools & educational resources. Trade Bitcoin, Ethereum, major currency pairs & more.",
  keywords = "crypto trading Africa, forex trading Africa, cryptocurrency platform, Bitcoin trading, Ethereum trading, forex trading platform, African markets, trading tools, market analysis, technical indicators, trading signals, portfolio tracker, risk calculator",
  canonical,
  ogType = "website",
  structuredData
}: SEOHeadProps) => {
  const location = useLocation();
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Define canonical URL first
    const canonicalUrl = canonical || `https://finhubafrica.com${location.pathname}`;
    
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:site_name', 'FINHUBAFRICA', true);
    updateMetaTag('og:locale', 'en_US', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:site', '@finhubafrica');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('bingbot', 'index, follow');
    updateMetaTag('author', 'FINHUBAFRICA');
    updateMetaTag('language', 'English');
    updateMetaTag('revisit-after', '1 days');
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    // Update structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]#dynamic-structured-data');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.id = 'dynamic-structured-data';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonical, ogType, structuredData, location]);
  
  return null;
};

export default SEOHead;
