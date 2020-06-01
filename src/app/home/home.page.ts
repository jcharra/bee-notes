import {Component, OnInit} from '@angular/core';
import {SwarmService, Swarm} from "../swarm.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  swarms$: Observable<Swarm[]>;

  constructor(private swarmService: SwarmService) {}

  ngOnInit(): void {
    this.swarms$ = this.swarmService.getSwarms();
  }
}
