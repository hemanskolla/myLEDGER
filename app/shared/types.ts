export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Note {
  id: string;
  contact_id: string;
  body: string;
  position: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  where_met: string | null;
  linkedin: string | null;
  email: string | null;
  phone: string | null;
  category_id: string;
  status: 'actual' | 'potential';
  created_at: string;
  updated_at: string;
}

export interface ContactWithNotes extends Contact {
  notes: Note[];
}

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
}
