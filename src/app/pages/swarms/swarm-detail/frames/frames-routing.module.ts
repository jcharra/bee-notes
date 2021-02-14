import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FramesPage } from './frames.page';

const routes: Routes = [
  {
    path: '',
    component: FramesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FramesPageRoutingModule {}
