import { EntryType } from "./EntryType";

export interface JournalEntry {
  id?: string;
  title?: string;
  text: string;
  date: Date | string;
  type?: EntryType;
  amount?: number;
}
