import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SwarmEditPage } from "./swarm-edit.page";

const routes: Routes = [
  {
    path: "",
    component: SwarmEditPage,
  },
  {
    path: ":swarmId",
    component: SwarmEditPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwarmEditPageRoutingModule {}
