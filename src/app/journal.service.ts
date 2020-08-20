import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface JournalEntry {
  id?: string;
  swarmId: string;
  title: string;
  text: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  constructor(private http: HttpClient) { }

  getEntries(swarmId: string): Observable<JournalEntry[]> {
    return this.http
      .get<{ [key: string]: any }>('https://beetracker-6865b.firebaseio.com/journal.json')
      .pipe(map(data => { 
        const entries = [];
        for (const key in data) {
          if (data.hasOwnProperty(key) && data[key].swarmId === swarmId) { 
            entries.push({
              id: key,
              swarmId: data[key].swarmId,
              title: data[key].title,
              text: data[key].text,
              date: new Date(data[key].date)
            });
          }
        }
        return entries;
      }));
  }

  saveEntry(entry: JournalEntry): Observable<any> { 
    return this.http
      .post('https://beetracker-6865b.firebaseio.com/journal.json', entry);
  }
}
