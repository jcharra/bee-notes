import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ExcoloniesPageRoutingModule } from "./excolonies-routing.module";

import { ExcoloniesPage } from "./excolonies.page";
import { TranslatePipe } from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ExcoloniesPageRoutingModule, TranslatePipe],
  declarations: [ExcoloniesPage],
})
export class ExcoloniesPageModule {}
