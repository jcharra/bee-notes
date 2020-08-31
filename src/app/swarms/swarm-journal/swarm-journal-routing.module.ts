import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwarmJournalPage } from './swarm-journal.page';

const routes: Routes = [
  {
    path: '',
    component: SwarmJournalPage
  }, {
    path: 'edit',
    loadChildren: () =>
      import('./journal-edit-entry/journal-edit-entry.module').then(
        m => m.JournalEditEntryPageModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwarmJournalPageRoutingModule {}
