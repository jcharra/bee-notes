import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";

const routes: Routes = [
    {
      path: 'home',
      loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
  {
    path: 'swarm-detail',
    loadChildren: () => import('./swarm-detail/swarm-detail.module').then( m => m.SwarmDetailPageModule)
  }
  ]
  ;

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
