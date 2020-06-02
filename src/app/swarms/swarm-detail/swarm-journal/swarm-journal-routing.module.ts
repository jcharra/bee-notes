import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwarmJournalPage } from './swarm-journal.page';

const routes: Routes = [
  {
    path: '',
    component: SwarmJournalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwarmJournalPageRoutingModule {}
