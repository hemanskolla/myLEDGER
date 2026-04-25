export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Note {
  id: number;
  contact_id: number;
  body: string;
  position: number;
}

export interface Contact {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  where_met: string | null;
  category_id: number;
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
