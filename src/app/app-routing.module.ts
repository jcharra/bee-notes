import { NgModule } from "@angular/core";
import { AngularFireAuthGuard, redirectUnauthorizedTo } from "@angular/fire/auth-guard";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["auth"]);

const routes: Routes = [
  {
    path: "swarms",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import("./pages/swarms/swarms.module").then((m) => m.SwarmsPageModule),
  },
  {
    path: "finance",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import("./pages/finance/finance.module").then((m) => m.FinancePageModule),
  },
  {
    path: "excolonies",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import("./pages/excolonies/excolonies.module").then((m) => m.ExcoloniesPageModule),
  },
  {
    path: "settings",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import("./pages/settings/settings.module").then((m) => m.SettingsPageModule),
  },
  {
    path: "reminders",
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import("./pages/reminder/reminder.module").then((m) => m.ReminderPageModule),
  },
  {
    path: "",
    redirectTo: "swarms",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () => import("./pages/auth/auth.module").then((m) => m.AuthPageModule),
  },
  {
    path: "excolonies",
    loadChildren: () => import("./pages/excolonies/excolonies.module").then((m) => m.ExcoloniesPageModule),
  },
  {
    path: "settings",
    loadChildren: () => import("./pages/settings/settings.module").then((m) => m.SettingsPageModule),
  },
  {
    path: "about",
    loadChildren: () => import("./pages/about/about.module").then((m) => m.AboutPageModule),
  },
  {
    path: "accountdeletion",
    loadChildren: () => import("./accountdeletion/accountdeletion.module").then((m) => m.AccountdeletionPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: "legacy",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
