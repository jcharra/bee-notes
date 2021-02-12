import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Plugins } from "@capacitor/core";
import { AlertController, LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "./auth.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  isSignup = false;
  isLoading = false;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required]),
    });

    // Prepopulate email field if possible
    Plugins.Storage.get({ key: "lastEmailAddress" }).then((data: any) => {
      if (data && data.value) {
        this.loginForm.get("email").setValue(data.value);
      }
    });
  }

  onLogin() {
    if (!this.loginForm.valid) {
      return;
    }

    Plugins.Storage.set({
      key: "lastEmailAddress",
      value: this.loginForm.value.email,
    });

    this.isLoading = true;
    this.loadingCtrl
      .create({
        keyboardClose: true,
        message: this.translate.instant("AUTH_PAGE.loginSpinner"),
      })
      .then((loadingEl) => {
        loadingEl.present();

        const email = this.loginForm.value.email;
        const password = this.loginForm.value.password;

        if (this.isSignup) {
          this.authService
            .signup(email, password)
            .then(() => {
              loadingEl.dismiss();
              this.onSignupSuccess();
              this.isSignup = false;
            })
            .catch((err) => {
              loadingEl.dismiss();
              this.onSignupFailed(err);
            });
        } else {
          this.authService
            .login(email, password)
            .then(() => {
              loadingEl.dismiss();
              this.router.navigateByUrl("/swarms");
            })
            .catch((err) => {
              this.isLoading = false;
              loadingEl.dismiss();
              this.onLoginFailed(err);
            });
        }
      });
  }

  async resetPassword() {
    const address = this.loginForm.controls.email.value.trim();

    const mailAddressComplete = address.length > 4 && address.indexOf("@") > 0;
    if (!mailAddressComplete) {
      this.onMailAddressIncomplete();
      return;
    }

    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.passwordReset"),
      message: this.translate.instant("AUTH_PAGE.passwordResetPrompt", {
        address: address,
      }),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("GENERAL.yes"),
          cssClass: "secondary",
          handler: () => {
            this.authService
              .resetPassword(address)
              .then(() => {
                this.onResetLinkSent();
              })
              .catch((err) => {
                this.onResetLinkFailure(err);
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async onLoginFailed(msg: string = null) {
    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.loginFailed"),
      message: msg || this.translate.instant("AUTH_PAGE.credentialsFailed"),
      buttons: ["OK"],
    });

    await alert.present();
  }

  async onSignupFailed(msg: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.signupFailed"),
      message: msg,
      buttons: ["OK"],
    });

    await alert.present();
  }

  async onSignupSuccess() {
    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.signupSuccess"),
      message: this.translate.instant("AUTH_PAGE.signupSuccessText"),
      buttons: ["OK"],
    });

    await alert.present();
  }

  async onMailAddressIncomplete() {
    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.noEmailAddress"),
      message: this.translate.instant("AUTH_PAGE.noEmailAddressText"),
      buttons: ["OK"],
    });

    await alert.present();
  }

  async onResetLinkSent() {
    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.resetLinkSent"),
      message: this.translate.instant("AUTH_PAGE.resetLinkSentText"),
      buttons: ["OK"],
    });

    await alert.present();
  }

  async onResetLinkFailure(msg: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant("AUTH_PAGE.resetLinkFailure"),
      message: this.translate.instant("AUTH_PAGE.resetLinkFailureText") + msg,
      buttons: ["OK"],
    });

    await alert.present();
  }
}
