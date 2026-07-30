import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SettingsPageRoutingModule } from "./settings-routing.module";

import { SettingsPage } from "./settings.page";
import { TranslatePipe } from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, SettingsPageRoutingModule, TranslatePipe],
  declarations: [SettingsPage],
})
export class SettingsPageModule {}
