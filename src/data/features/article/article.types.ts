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
  subHeadline: string;
  slug: string;
  content: string;
  authorId: string;
  advocateName: string;
  location: string;
  authors: string;
  thumbnail: string | null;
  status: "pending" | "published" | "draft" | "rejected";
  rejectionReason: string | null;
  isPaywalled: boolean;
  createdAt: string;
  updatedAt: string;
  category: string | null;
  tags: string[];
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
  title:string;
  location:string;
  subHeadline:string;
  category: string;
  slug:string;
  tags: string[];
  language: string;
  author: string;  
  content: string;
  advocateName:string;
  thumbnail: File | null; //need to convert into string or url
}

export interface ArticleState {
  loading: boolean;
  error: string | null;
  message: string | null;
  articles: Article[];
}
