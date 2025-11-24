export interface BlogResponseDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export interface CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface UpdateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

