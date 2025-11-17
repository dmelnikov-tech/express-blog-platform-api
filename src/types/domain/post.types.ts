export interface Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export interface PostResponseDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export interface CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
