import { JournalPageRoutingModule } from './../journal/journal-routing.module';
import { JournalPage } from './../journal/journal.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwarmDetailPage } from './swarm-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SwarmDetailPage
  }, {
    path: 'journal',
    loadChildren: () => import('../journal/journal.module').then(m => m.JournalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwarmDetailPageRoutingModule { }
