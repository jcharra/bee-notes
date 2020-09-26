import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isSignup = false;
  isLoading = false;
  loginForm: FormGroup;
ø
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

      let authObs: Observable<AuthResponseData>;      
      
      if (this.isSignup) {
        authObs = this.authService.signup(email, password);          
      } else {
        authObs = this.authService.login(email, password);          
      }

      authObs.subscribe(res => {
        loadingEl.dismiss();
        this.router.navigateByUrl('/swarms');
      }, err => {
        const code = err.error.error.message;
        this.isLoading = false;
        loadingEl.dismiss();
        this.onLoginFailed();
      });
    });
  }

  async onLoginFailed() {
    const alert = await this.alertController.create({
      header: 'Login failed',
      message: 'Username and password do not match.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
