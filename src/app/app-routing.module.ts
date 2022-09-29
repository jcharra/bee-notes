import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from "@angular/fire/auth-guard";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["auth"]);
const redirectLoggedInToHome = () => redirectLoggedInTo(["swarms"]);

const routes: Routes = [
  {
    path: "swarms",
    loadChildren: () => import("./pages/swarms/swarms.module").then((m) => m.SwarmsPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "finance",
    loadChildren: () => import("./pages/finance/finance.module").then((m) => m.FinancePageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "excolonies",
    loadChildren: () => import("./pages/excolonies/excolonies.module").then((m) => m.ExcoloniesPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "settings",
    loadChildren: () => import("./pages/settings/settings.module").then((m) => m.SettingsPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "reminders",
    loadChildren: () => import("./pages/reminder/reminder.module").then((m) => m.ReminderPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "",
    redirectTo: "swarms",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () => import("./pages/auth/auth.module").then((m) => m.AuthPageModule),
    ...canActivate(redirectLoggedInToHome),
  },
  {
    path: "excolonies",
    loadChildren: () => import("./pages/excolonies/excolonies.module").then((m) => m.ExcoloniesPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "settings",
    loadChildren: () => import("./pages/settings/settings.module").then((m) => m.SettingsPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "about",
    loadChildren: () => import("./pages/about/about.module").then((m) => m.AboutPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "accountdeletion",
    loadChildren: () => import("./accountdeletion/accountdeletion.module").then((m) => m.AccountdeletionPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: "privacy",
    loadChildren: () => import("./privacy/privacy.module").then((m) => m.PrivacyPageModule),
  },
  {
    path: "support",
    loadChildren: () => import("./support/support.module").then((m) => m.SupportPageModule),
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
