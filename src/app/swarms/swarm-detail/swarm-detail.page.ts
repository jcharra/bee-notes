import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { JournalEntry } from 'src/app/journal.service';
import { JournalService } from '../../journal.service';
import { Swarm, SwarmService } from '../../swarm.service';

const JOURNAL_PLACEHOLDER = Array(3).fill({ text: '', date: new Date() });

@Component({
  selector: 'app-swarm-detail',
  templateUrl: './swarm-detail.page.html',
  styleUrls: ['./swarm-detail.page.scss']
})
export class SwarmDetailPage implements OnInit {
  swarmId: string;
  swarm: Swarm;
  journalEntries: JournalEntry[] = JOURNAL_PLACEHOLDER;
  userId: string;

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.userId = this.route.snapshot.data.userId;
  }

  ionViewDidEnter() {
    this.loadData(!this.journalEntries || this.journalEntries.length === 0);
  }

  async loadData(withSpinner: boolean = true) {
    const loading = await this.loadingCtrl.create({
      message: 'Loading journal...',
      showBackdrop: true
    });

    withSpinner && await loading.present();

    this.swarmService
      .getSwarm(this.swarmId)
      .subscribe((s: Swarm) => {
        this.swarm = s;
      });

    this.journalService
      .getEntries(this.swarmId, JOURNAL_PLACEHOLDER.length)
      .subscribe((entries: JournalEntry[]) => {
        this.journalEntries = entries;
        withSpinner && loading.dismiss();
      });
  }
}
