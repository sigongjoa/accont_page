export interface Site {
  id: string;
  name: string;
  description: string;
  url: string; // Add URL field
  category: string;
  isSubscribed: boolean;
  usage: string;
  createdAt: string;
  updatedAt: string;
}