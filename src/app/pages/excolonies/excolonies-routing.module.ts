import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExcoloniesPage } from './excolonies.page';

const routes: Routes = [
  {
    path: '',
    component: ExcoloniesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExcoloniesPageRoutingModule {}
