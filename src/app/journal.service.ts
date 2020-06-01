import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  entries: JournalEntry[] = [
    {
      id: '1',
      title: 'Königin gecheckt',
      text: 'Heut die Königin gesichtet',
      date: new Date(2020, 1, 1)
    }, {
      id: '2',
      title: 'Viel Honig drin',
      text: '10 Waben voll ... bald schleudern!',
      date: new Date(2020, 4, 1)
    }
  ];

  constructor() { }


  getEntries(id: string): Observable<JournalEntry[]> {
    return of(this.entries);
  }
}
