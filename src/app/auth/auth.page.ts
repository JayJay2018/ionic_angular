import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  authForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.minLength(3)]]

  })
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.authService.login();
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...'
    })
    .then( loadingEl => {
      loadingEl.present();
      this.authService.signUp(email, password)
        .subscribe( (resData) => {
        console.log(resData);
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
     },
     errorRes => {
      loadingEl.dismiss();
      this.isLoading = false;
      const code = errorRes.error.error.message;
      let message = 'We are sorry, but authentication failed.'
      if (code === 'EMAIL_EXISTS') {
        message = 'Email exists already.'
      }
      this.showAlert(message);
     });
    })
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'An error occured',
      message: message,
      buttons: ['Ok']
    }).then(loadingEl => {
      loadingEl.present();
    })
  }

}
