import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwarmsPageRoutingModule } from './swarms-routing.module';

import { SwarmsPage } from './swarms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwarmsPageRoutingModule
  ],
  declarations: [SwarmsPage]
})
export class SwarmsPageModule {}
