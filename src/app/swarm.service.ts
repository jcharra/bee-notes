import {Injectable} from "@angular/core";
import {Observable, of, empty} from "rxjs";

export interface Swarm {
  id: string,
  name: string,
  started: Date
}

@Injectable({
  providedIn: 'root'
})
export class SwarmService {
  swarms: Swarm[] = [
    {
      id: '1',
      name: 'Ableger',
      started: new Date()
    }, {
      id: '2',
      name: 'Martinsvolk',
      started: new Date()
    }
  ];

  constructor() { }

  getSwarms(): Observable<Swarm[]> {
    return of(this.swarms);
  }

  getSwarm(id: string): Observable<Swarm> {
    let swarms = this.swarms.filter(s => s.id === id);
    return swarms.length === 1 ? of(swarms[0]) : empty();
  }
}
