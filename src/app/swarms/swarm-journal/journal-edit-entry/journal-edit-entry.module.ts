import { TranslateModule } from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { JournalEditEntryPageRoutingModule } from "./journal-edit-entry-routing.module";

import { JournalEditEntryPage } from "./journal-edit-entry.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JournalEditEntryPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [JournalEditEntryPage],
})
export class JournalEditEntryPageModule {}
