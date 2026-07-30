import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { FramesPageRoutingModule } from "./frames-routing.module";

import { FramesPage } from "./frames.page";
import { TranslatePipe } from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, FramesPageRoutingModule, TranslatePipe],
  declarations: [FramesPage],
})
export class FramesPageModule {}
