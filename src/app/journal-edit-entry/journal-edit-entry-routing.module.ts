import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JournalEditEntryPage } from './journal-edit-entry.page';

const routes: Routes = [
  {
    path: '',
    component: JournalEditEntryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JournalEditEntryPageRoutingModule {}
