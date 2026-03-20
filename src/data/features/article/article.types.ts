// export interface Article {
//   id: string;
//   title: string;
//   subHeadline:string;
//   slug: string;
//   content: string;
//   authorId: string;
//   isPaywalled: boolean;
//   updatedAt: string; 
//   status: 'Draft' | 'Pending' | 'Published' | 'Rejected';
//   priority?: 'High' | 'Medium' | 'Low';
//   language?: string;
//   tags?: string[];
//   thumbnailUrl?: string;
//   createdAt: string;
// }
export interface ArticleDocument {
  id: string;
  articleId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineUpdate {
  _localId?: string;
  updateDate: Date | string;
  title?: string;
  content: string;
}

export interface Advocate {
  userId?: string;
  name: string;
  email?: string;
}

export interface Article {
  id: string;
  title: string;
  subHeadline: string | null;
  aiSummary?: string | null;
  slug: string;
  content: string;
  authorId: string;
  authorRole?: string | null;
  advocateName: string | null;
  advocates?: Advocate[];
  location: string | null;
  authors: string | null;
  thumbnail: string | null;
  documents?: ArticleDocument[] | null;
  updates?: TimelineUpdate[];
  status: "pending" | "published" | "draft" | "rejected";
  rejectionReason: string | null;
  language: string | null;
  isPaywalled: boolean;
  createdAt: string;
  updatedAt: string;

  category: Category | null;
  subcategory: Subcategory | null;

  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
// export interface Category {
//   id: string;
//   name: string;
//   slug: string;
//   description: string | null;
//   parentId: string | null;
//   createdAt: string;
//   updatedAt: string;
// }
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}



export interface ArticleListResponse {
  success: boolean;
  message: string;
  data: Article[];
}

export interface CreateArticleResponse {
  success: boolean;
  message: string;
  data: Article;
}

export interface CreateArticleRequest {
  title: string;
  location: string;
  subHeadline: string;
  updates?: TimelineUpdate[];
  category: string;
  slug: string;
  tags: string[];
  language: string;
  author: string;
  isPaywalled: boolean;
  content: string;
  advocateName: string;
  advocates: Advocate[];
  thumbnail: File | null;
  documents?: File[];
  removedDocumentIds?: string[];
  status?: "draft" | "pending";
}

export interface ArticleState {
  loading: boolean;
  error: string | null;
  message: string | null;
  articles: Article[];
}
