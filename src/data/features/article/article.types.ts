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
export interface Article {
  id: string;
  title: string;
  subHeadline: string | null;
  slug: string;
  content: string;
  authorId: string;
  authorRole?: string | null;
  advocateName: string | null;
  location: string | null;
  authors: string | null;
  thumbnail: string | null;
  status: "pending" | "published" | "draft" | "rejected";
  rejectionReason: string | null;
  language: string | null;
  isPaywalled: boolean;
  createdAt: string;
  updatedAt: string;

  category: Category | null;
  subcategory: Subcategory | null;

  tags: string[];
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
  category: string;
  slug: string;
  tags: string[];
  language: string;
  author: string;
  content: string;
  advocateName: string;
  thumbnail: File | null;
  status?: "draft" | "pending";
}

export interface ArticleState {
  loading: boolean;
  error: string | null;
  message: string | null;
  articles: Article[];
}
