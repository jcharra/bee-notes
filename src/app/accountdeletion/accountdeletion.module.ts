import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountdeletionPageRoutingModule } from './accountdeletion-routing.module';

import { AccountdeletionPage } from './accountdeletion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountdeletionPageRoutingModule,
    TranslateModule
  ],
  declarations: [AccountdeletionPage]
})
export class AccountdeletionPageModule {}
