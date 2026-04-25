export interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link: string;
  slotId: string;
  adType: "IMAGE" | "GOOGLE_ADSENSE" | "HTML";
  googleAdId?: string;
  htmlContent?: string;
  isActive: boolean;
  priority: number;
  totalImpressions: number;
  totalClicks: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertisementRequest {
  title: string;
  description?: string;
  link: string;
  slotId: string;
  adType: string;
  priority: number;
  isActive: boolean;
  thumbnail?: File;
}

export interface AdvertisementListResponse {
  success: boolean;
  message: string;
  data: Advertisement[];
}

export interface AdvertisementResponse {
  success: boolean;
  message: string;
  data: Advertisement;
}

export const AD_SLOTS = [
  // Home Screen
  { id: "HOME_BANNER_TOP_1", name: "Home Top Banner (1)", dimensions: "728x90", type: "BANNER" },
  { id: "HOME_BANNER_TOP_2", name: "Home Top Banner (2)", dimensions: "728x90", type: "BANNER" },
  { id: "HOME_SIDEBAR_1", name: "Home Sidebar (1)", dimensions: "300x250", type: "SIDEBAR" },
  { id: "HOME_SIDEBAR_2", name: "Home Sidebar (2)", dimensions: "300x250", type: "SIDEBAR" },
  { id: "HOME_FEED_1", name: "Home In-Feed (1)", dimensions: "728x150", type: "BANNER" },
  { id: "HOME_POPUP", name: "Home Global Popup", dimensions: "300x250", type: "POPUP" },
  
  // Article Pages
  { id: "ARTICLE_BANNER_1", name: "Article Top Banner", dimensions: "728x90", type: "BANNER" },
  { id: "ARTICLE_SIDEBAR_1", name: "Article Sidebar Top", dimensions: "300x250", type: "SIDEBAR" },
  { id: "ARTICLE_SIDEBAR_2", name: "Article Sidebar Bottom", dimensions: "300x600", type: "SIDEBAR" },
  { id: "ARTICLE_FOOTER_1", name: "Article Bottom Banner", dimensions: "728x90", type: "BANNER" },
  
  // Category & Tag Pages
  { id: "CATEGORY_BANNER_1", name: "Category/Tag Top Banner", dimensions: "728x90", type: "BANNER" },
  { id: "CATEGORY_SIDEBAR_1", name: "Category/Tag Sidebar", dimensions: "300x250", type: "SIDEBAR" },
];
