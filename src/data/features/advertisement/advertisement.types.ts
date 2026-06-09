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
  googleAdId?: string;
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
  { id: "ARTICLE_SIDEBAR_2", name: "Article Sidebar Bottom", dimensions: "300x250", type: "SIDEBAR" },
  { id: "ARTICLE_FOOTER_1", name: "Article Bottom Banner", dimensions: "728x90", type: "BANNER" },
  
  // Category & Tag Pages
  { id: "CATEGORY_BANNER_1", name: "Category/Tag Top Banner", dimensions: "728x90", type: "BANNER" },
  { id: "CATEGORY_SIDEBAR_1", name: "Category/Tag Sidebar", dimensions: "300x250", type: "SIDEBAR" },
];

export const GOOGLE_AD_MAPPINGS: Record<string, string> = {
  // Map Slot IDs to Google AdSense Unit IDs
  "HOME_BANNER_TOP_1": "1234567890", // Replace with real AdSense IDs later
  "HOME_BANNER_TOP_2": "0987654321",
  "HOME_SIDEBAR_1": "1112223334",
  "HOME_SIDEBAR_2": "5556667778",
  "HOME_FEED_1": "9990001112",
  "HOME_POPUP": "4445556667",
  "ARTICLE_BANNER_1": "7778889990",
  "ARTICLE_SIDEBAR_1": "2223334445",
  "ARTICLE_SIDEBAR_2": "8889990001",
  "ARTICLE_FOOTER_1": "3334445556",
  "CATEGORY_BANNER_1": "6667778889",
  "CATEGORY_SIDEBAR_1": "1231231234",
};
