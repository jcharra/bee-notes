import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../../../shared/shared.module";
import { SwarmDetailPageRoutingModule } from "./swarm-detail-routing.module";
import { SwarmDetailPage } from "./swarm-detail.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    SwarmDetailPageRoutingModule,
    TranslateModule,
    SharedModule,
  ],
  declarations: [SwarmDetailPage],
})
export class SwarmDetailPageModule {}
