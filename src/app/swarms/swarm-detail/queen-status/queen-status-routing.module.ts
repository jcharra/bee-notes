import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QueenStatusPage } from './queen-status.page';

const routes: Routes = [
  {
    path: '',
    component: QueenStatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QueenStatusPageRoutingModule {}
