import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Swarm, SwarmService } from '../swarm.service';
import { JournalEntry, JournalService } from '../journal.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-swarm-detail',
  templateUrl: './swarm-detail.page.html',
  styleUrls: ['./swarm-detail.page.scss'],
})
export class SwarmDetailPage implements OnInit {

  swarm$: Observable<Swarm>;
  journalEntries$: Observable<JournalEntry[]>;

  constructor(private swarmService: SwarmService,
    private journalService: JournalService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    const id = this.route.snapshot.params.id;
    this.swarm$ = this.swarmService.getSwarm(id);
    this.journalEntries$ = this.journalService.getEntries(id);
  }
}
