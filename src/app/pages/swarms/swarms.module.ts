import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslatePipe } from "@ngx-translate/core";
import { SharedModule } from "src/app/shared/shared.module";
import { SwarmsPageRoutingModule } from "./swarms-routing.module";
import { SwarmsPage } from "./swarms.page";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SwarmsPageRoutingModule, SharedModule, TranslatePipe],
  declarations: [SwarmsPage],
})
export class SwarmsPageModule {}
