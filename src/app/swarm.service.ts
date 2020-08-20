import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { shareReplay, map, filter } from 'rxjs/operators';

export interface Swarm {
  id?: string;
  name: string;
  created: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SwarmService {
  constructor(private http: HttpClient) { }

  getSwarms(force: boolean = false): Observable<Swarm[]> {
    return this.http
      .get<{ [key: string]: Swarm }>('https://beetracker-6865b.firebaseio.com/swarms.json')
      .pipe(map(swarmData => { 
        const swarms: Swarm[] = [];
        for (const key in swarmData) { 
          if (swarmData.hasOwnProperty(key)) { 
            swarms.push({
              id: key,
              name: swarmData[key].name,
              created: new Date(swarmData[key].created)
            });
          }
        }
        return swarms;
      }));
  }

  getSwarm(id: string): Observable<Swarm> {
    return this.http
      .get('https://beetracker-6865b.firebaseio.com/swarms/' + id + '.json')
      .pipe(map((s: any) => { 
        return {
          id,
          name: s.name,
          created: new Date(s.created)
        };
      }));
  }

  createSwarm(s: Swarm): Observable<Swarm> {
    return this.http
      .post<Swarm>('https://beetracker-6865b.firebaseio.com/swarms.json', s);
  }
}
