import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
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
    email: ['lol@', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]

  })
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    console.log(this.authForm.get('email').value);
  }

  onLogin(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(form);
    this.isLoading = true;
    this.authService.login();
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in...'
    })
    .then( loadingEl => {
      loadingEl.present();
      setTimeout( () => {
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      }, 1500)
    })
  }

  // onSubmit(form: NgForm) {
  //   if (!form.valid) {
  //     return;
  //   }
  //   console.log(form);
  // }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
  }

}
