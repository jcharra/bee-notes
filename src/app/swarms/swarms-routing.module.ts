import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwarmsPage } from './swarms.page';


const routes: Routes = [
  {
    path: '',
    component: SwarmsPage
  },
  {
    path: 'view/:swarmId',
    loadChildren: () =>
      import('./swarm-detail/swarm-detail.module').then(
        m => m.SwarmDetailPageModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwarmsPageRoutingModule {}
