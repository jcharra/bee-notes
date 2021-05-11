import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import { PurchaseService } from "src/app/purchase.service";

interface Language {
  name: string;
  langCode: string;
}

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit {
  languages: Language[] = [
    { name: "English", langCode: "en" },
    { name: "Deutsch", langCode: "de" },
    //{ name: "Français", langCode: "fr" },
  ];

  purchasesAvailable: boolean;
  hasFullVersion: boolean;

  settingsForm: FormGroup;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private storage: Storage,
    private purchaseService: PurchaseService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let activeLanguage: Language;
    for (let lang of this.languages) {
      if (lang.langCode === this.translate.currentLang) {
        activeLanguage = lang;
      }
    }

    if (!activeLanguage) {
      activeLanguage = this.languages[0];
    }

    this.settingsForm = this.formBuilder.group({
      language: [activeLanguage],
    });

    this.purchasesAvailable = this.purchaseService.purchasesAvailable;
    this.hasFullVersion = this.purchaseService.hasFullVersion;
  }

  submit() {
    const lang = this.settingsForm.controls.language.value.langCode;
    this.translate.use(lang);
    this.storage.set("language", lang);
  }

  async buyFullVersion() {
    this.purchaseService.purchaseFullVersion();
  }

  refreshStore() {
    this.purchaseService.refresh();
    setTimeout(() => this.ref.detectChanges(), 2000);
  }
}
