export interface ContactEmail {
  id: number;
  email: string;
  is_primary: boolean;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  nickname?: string;
  is_favorite: boolean;
  emails: ContactEmail[];
  created_at: string;
  updated_at: string;
}
