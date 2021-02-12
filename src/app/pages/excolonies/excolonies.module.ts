import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ExcoloniesPageRoutingModule } from "./excolonies-routing.module";

import { ExcoloniesPage } from "./excolonies.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExcoloniesPageRoutingModule,
    TranslateModule,
  ],
  declarations: [ExcoloniesPage],
})
export class ExcoloniesPageModule {}
