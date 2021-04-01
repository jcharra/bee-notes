import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountdeletionPage } from './accountdeletion.page';

const routes: Routes = [
  {
    path: '',
    component: AccountdeletionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountdeletionPageRoutingModule {}
