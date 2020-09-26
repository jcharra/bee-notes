import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SwarmsPageRoutingModule } from './swarms-routing.module';
import { SwarmsPage } from './swarms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwarmsPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SwarmsPage]
})
export class SwarmsPageModule { }
