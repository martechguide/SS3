import { ResponsiveBannerAd } from "./responsive-banner-ad";

interface PageSpecificAdsProps {
  pageName: string;
  additionalPlacements?: string[];
}

export function PageSpecificAds({ pageName, additionalPlacements = [] }: PageSpecificAdsProps) {
  return (
    <>
      {/* Main banner ad for the page */}
      <ResponsiveBannerAd 
        placement={`${pageName}-banner`} 
        className="page-specific-ad" 
      />
      
      {/* Additional placement-specific ads */}
      {additionalPlacements.map((placement, index) => (
        <ResponsiveBannerAd 
          key={`${placement}-${index}`}
          placement={placement}
          className="additional-placement-ad"
          dismissible={false}
        />
      ))}
    </>
  );
}

// Specific page ad components for easy integration
export function HomePageAds() {
  return <PageSpecificAds pageName="home" additionalPlacements={["home-sidebar", "home-featured"]} />;
}

export function VideoPageAds() {
  return <PageSpecificAds pageName="video" additionalPlacements={["video-sidebar", "video-related"]} />;
}

export function SubjectPageAds() {
  return <PageSpecificAds pageName="subject" additionalPlacements={["subject-list", "subject-header"]} />;
}