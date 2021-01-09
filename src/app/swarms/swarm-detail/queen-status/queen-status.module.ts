import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { QueenStatusPageRoutingModule } from "./queen-status-routing.module";

import { QueenStatusPage } from "./queen-status.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QueenStatusPageRoutingModule,
    TranslateModule,
  ],
  declarations: [QueenStatusPage],
})
export class QueenStatusPageModule {}
