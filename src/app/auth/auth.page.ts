import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isSignup = false;
  isLoading = false;
  loginForm: FormGroup;

  constructor(private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertController: AlertController) {

  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });

    // Prepopulate email field if possible
    Plugins.Storage
      .get({ key: 'lastEmailAddress' })
      .then((data: any) => { 
        if (data && data.value) {
          this.loginForm.get('email').setValue(data.value);
        }
      })    
  }

  onLogin() {
    if (!this.loginForm.valid) {
      return;
    }

    Plugins.Storage
      .set({ key: 'lastEmailAddress', value: this.loginForm.value.email })
    
    this.isLoading = true;
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in ...'
    }).then(loadingEl => {
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
          .catch(err => {
            loadingEl.dismiss();
            this.onSignupFailed(err);
          });
      } else {
        this.authService
          .login(email, password)
          .then(() => {
            loadingEl.dismiss();
            this.router.navigateByUrl('/swarms');
          })
            .catch(err => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.onLoginFailed(err);
          });
      }      
    });
  }

  async onLoginFailed(msg: string = null) {
    const alert = await this.alertController.create({
      header: 'Login failed',
      message: msg || 'Username and password do not match.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async onSignupFailed(msg: string) {
    const alert = await this.alertController.create({
      header: 'Signup failed',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async onSignupSuccess() {
    const alert = await this.alertController.create({
      header: 'Signup successful',
      message: 'We just sent you an email with a validation link.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
