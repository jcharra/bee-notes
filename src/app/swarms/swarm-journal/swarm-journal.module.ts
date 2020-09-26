import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwarmJournalPageRoutingModule } from './swarm-journal-routing.module';

import { SwarmJournalPage } from './swarm-journal.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwarmJournalPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SwarmJournalPage]
})
export class SwarmJournalPageModule {}
