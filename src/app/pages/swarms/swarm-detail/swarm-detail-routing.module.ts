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
    path: "queen",
    loadChildren: () =>
      import("./queen-status/queen-status.module").then(
        (m) => m.QueenStatusPageModule
      ),
  },
  {
    path: "frames",
    loadChildren: () =>
      import("./frames/frames.module").then((m) => m.FramesPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwarmDetailPageRoutingModule {}
