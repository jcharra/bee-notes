import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SwarmDetailPage } from "./swarm-detail.page";

const routes: Routes = [
  {
    path: "",
    component: SwarmDetailPage,
  },
  {
    path: "journal",
    loadChildren: () =>
      import("../swarm-journal/swarm-journal.module").then(
        (m) => m.SwarmJournalPageModule
      ),
  },
  {
    path: "frames",
    loadChildren: () =>
      import("./frames/frames.module").then((m) => m.FramesPageModule),
  },
  {
    path: "reminder",
    loadChildren: () =>
      import("./reminder/reminder.module").then((m) => m.ReminderPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwarmDetailPageRoutingModule {}
