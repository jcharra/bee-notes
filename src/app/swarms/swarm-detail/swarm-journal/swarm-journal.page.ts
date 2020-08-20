import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JournalEntry, JournalService } from 'src/app/journal.service';

@Component({
  selector: 'app-swarm-journal',
  templateUrl: './swarm-journal.page.html',
  styleUrls: ['./swarm-journal.page.scss'],
})
export class SwarmJournalPage implements OnInit {
  journalEntries: JournalEntry[];
  
  constructor(
    private journalService: JournalService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    const id = this.route.snapshot.params.id;
    this.journalService
      .getEntries(id)
      .subscribe((entries: JournalEntry[]) => { 
        this.journalEntries = entries;
      });
  }

}
