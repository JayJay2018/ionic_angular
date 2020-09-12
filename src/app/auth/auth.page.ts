import { Component, OnInit } from '@angular/core';
import { AuthService, AUTHRESTDATA } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, NgForm, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

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
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...'
    })
    .then( loadingEl => {
      loadingEl.present();
      let authObs: Observable<AUTHRESTDATA>
      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      } else {
        authObs = this.authService.signUp(email, password);
      }
      authObs.subscribe( (resData) => {
        // console.log(resData);
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
      } else if (code === 'EMAIL_NOT_FOUND') {
        message = 'Email does not exist.'
      } else if (code === 'INVALID_PASSWORD') {
        message = 'Email or password invalid.'
      }
      this.showAlert(message);
     });
    })
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    form.reset();
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Something went wrong...',
      message: message,
      buttons: ['Ok']
    }).then(loadingEl => {
      loadingEl.present();
    })
  }

}
