import { Component, OnInit } from '@angular/core';
import {SwarmService, Swarm} from "../swarm.service";
import {ActivatedRoute} from "@angular/router";
import {JournalService, JournalEntry} from "../journal.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-swarm',
  templateUrl: './swarm.component.html',
  styleUrls: ['./swarm.component.scss'],
})
export class SwarmComponent implements OnInit {

  swarm$: Observable<Swarm>;
  journalEntries$: Observable<JournalEntry[]>;

  constructor(private swarmService: SwarmService,
              private journalService: JournalService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    let id = this.route.snapshot.params['id'];
    this.swarm$ = this.swarmService.getSwarm(id);
    this.journalEntries$ = this.journalService.getEntries(id);
  }
}
