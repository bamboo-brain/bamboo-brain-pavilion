export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  image?: string;
  provider: 'credentials' | 'google' | 'azure-ad';
  hskLevel: number;
  isGcalSyncEnabled: boolean;
  isMicrosoftAccountEnabled: boolean;
  isCredentialsUser: boolean;
  passwordChangedAt?: string;
  areaOfInterests: string[];
  createdAt: string;
}
