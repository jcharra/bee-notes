import { NgModule } from "@angular/core";
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
} from "@angular/fire/auth-guard";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["auth"]);

const routes: Routes = [
  {
    path: "swarms",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () =>
      import("./swarms/swarms.module").then((m) => m.SwarmsPageModule),
  },
  {
    path: "finance",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () =>
      import("./finance/finance.module").then((m) => m.FinancePageModule),
  },
  {
    path: "excolonies",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () =>
      import("./excolonies/excolonies.module").then(
        (m) => m.ExcoloniesPageModule
      ),
  },
  {
    path: "settings",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () =>
      import("./settings/settings.module").then((m) => m.SettingsPageModule),
  },
  {
    path: "",
    redirectTo: "swarms",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./auth/auth.module").then((m) => m.AuthPageModule),
  },
  {
    path: "excolonies",
    loadChildren: () =>
      import("./excolonies/excolonies.module").then(
        (m) => m.ExcoloniesPageModule
      ),
  },
  {
    path: "settings",
    loadChildren: () =>
      import("./settings/settings.module").then((m) => m.SettingsPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
