import { EntryType } from "./EntryType";

export interface JournalEntry {
  id?: string;
  text: string;
  date: Date;
  type: EntryType;
  amount?: number;
}
