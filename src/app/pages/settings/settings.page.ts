import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Storage } from "@ionic/storage";
import { AuthService } from "../auth/auth.service";
import { AlertController } from "@ionic/angular";

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

  settingsForm: FormGroup;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private storage: Storage,
    private authService: AuthService,
    private alertCtrl: AlertController
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
  }

  submit() {
    const lang = this.settingsForm.controls.language.value.langCode;
    this.translate.use(lang);
    this.storage.set("language", lang);
  }

  async deleteAccount() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        "SETTINGS_PAGE.deleteAccountConfirmHeader"
      ),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("SETTINGS_PAGE.deleteAccountConfirm"),
          handler: () => {
            this.authService.deleteUser();
          },
        },
      ],
    });

    await alert.present();
  }
}
