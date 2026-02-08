import { Timestamp, FieldValue } from "firebase/firestore";

export interface Company {
  id?: string;
  name: string;
  logo?: string;
  banner?: string;
  bio: string;
  website: string;
  video_url?: string;
  tech_stack?: string[];
  location: string;
  employer_ids: string[];
  created_at?: Timestamp | FieldValue;
  updated_at?: Timestamp | FieldValue;
}
