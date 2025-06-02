export interface User {
  id: number;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  photoId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  id: number;
  authorId: number;
  author: User;
  title: string;
  destination: string;
  description?: string;
  photoId?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  fileName: string;
  filePath: string;
  caption?: string;
  userId?: number;
  itineraryId?: number;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}