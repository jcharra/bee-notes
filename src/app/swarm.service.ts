import { Injectable } from '@angular/core';
import { Observable, of, empty, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface Swarm {
  id: string;
  name: string;
  created: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SwarmService {
  swarms$ = new Subject<Swarm[]>();
  lastValue: Swarm[];

  swarms: Swarm[] = [
    {
      id: '1',
      name: 'Ableger',
      created: new Date()
    },
    {
      id: '2',
      name: 'Martinsvolk',
      created: new Date()
    }
  ];

  constructor() {}

  getSwarms(force: boolean = false): Observable<Swarm[]> {
    if (!this.lastValue || force) {
      this.lastValue = [...this.swarms]; // fetch real data
      this.swarms$.next(this.lastValue);
      console.log('init with', this.lastValue);
    }

    return this.swarms$.pipe(shareReplay(1));
  }

  getSwarm(id: string): Observable<Swarm> {
    const swarms = this.swarms.filter(s => s.id === id);
    return swarms.length === 1 ? of(swarms[0]) : empty();
  }

  createSwarm(name: string) {
    const s: Swarm = {
      id: this.generateId(),
      name,
      created: new Date()
    };

    this.swarms.push(s);

    this.swarms$.next(this.swarms);
  }

  private generateId(): string {
    return Math.random()
      .toString(36)
      .substring(7);
  }
}
