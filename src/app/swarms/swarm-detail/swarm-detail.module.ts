import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwarmDetailPageRoutingModule } from './swarm-detail-routing.module';

import { SwarmDetailPage } from './swarm-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    SwarmDetailPageRoutingModule
  ],
  declarations: [SwarmDetailPage]
})
export class SwarmDetailPageModule {}
