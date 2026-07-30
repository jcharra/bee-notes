import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AuthPageRoutingModule } from "./auth-routing.module";

import { AuthPage } from "./auth.page";
import { TranslatePipe } from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, AuthPageRoutingModule, TranslatePipe],
  declarations: [AuthPage],
})
export class AuthPageModule {}
