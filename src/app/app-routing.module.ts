import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'swarms',
    loadChildren: () =>
      import('./swarms/swarms.module').then(m => m.SwarmsPageModule)
  },
  {
    path: '',
    redirectTo: 'swarms',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
