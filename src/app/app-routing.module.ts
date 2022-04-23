import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "swarms",
    loadChildren: () => import("./pages/swarms/swarms.module").then((m) => m.SwarmsPageModule),
  },
  {
    path: "finance",
    loadChildren: () => import("./pages/finance/finance.module").then((m) => m.FinancePageModule),
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
    path: "reminders",
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
