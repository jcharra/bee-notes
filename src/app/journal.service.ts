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

  getEntries(swarmId: string, limit: number = -1): Observable<JournalEntry[]> {
    return this.http
      .get<{ [key: string]: any }>('https://beetracker-6865b.firebaseio.com/journal.json')
      .pipe(map(data => { 
        const entries: JournalEntry[] = [];
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

        entries.sort((a, b) => { return a.date > b.date ? 1 : -1});

        return limit > -1 ? entries.splice(0, limit) : entries;
      }));
  }

  createEntry(entry: JournalEntry): Observable<any> { 
    return this.http
      .post('https://beetracker-6865b.firebaseio.com/journal.json', entry);
  }

  updateEntry(entry: JournalEntry) {
    return this.http
      .put('https://beetracker-6865b.firebaseio.com/journal/' + entry.id + '.json', entry);
  }

  deleteEntry(id: string) {
    return this.http
      .delete('https://beetracker-6865b.firebaseio.com/journal/' + id + '.json');
  }
}
