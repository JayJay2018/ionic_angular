import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, from } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';


export interface AUTHRESTDATA {
  email: string;
  expiresIn: string;
  idToken: string;
  kind: string;
  localId: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null)
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map( user => {
      if (user) {
        console.log('user', user)
        return !!user.token;  
      }
      return false;
    })
      );
  }


  get userId() {
    return this._user.asObservable().pipe(map( user => {
      if (user) {
        return user.id
      }
      return null;
     
    })
    );
  }

  get token() {
    return this._user.asObservable().pipe(map( user => {
      if (user) {
        return user.token
      }
      return null;
     
    })
    );
  }

  constructor(
    private http: HttpClient
  ) { }

autoLogin() {
  return from(Plugins.Storage.get({ key: 'authData'}))
  .pipe(
    map( storedData => {
    if (!storedData || !storedData.value) {
      return null;
    }
    const parsedData = JSON.parse(storedData.value) as {token: string, email: string, userId: string, tokenExpirationDate: string};
    console.log('storedData', parsedData)
    const expirationTime = new Date(parsedData.tokenExpirationDate);
    if (expirationTime <= new Date()) {
      return null
    }
    const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime)
    return user;
  }),
    tap( user => {
      if (user) {
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
      }
    }), 
    map( user => {
      return !!user;
    }))
}

  signUp(email: string, password: string) {
    return this.http.post<AUTHRESTDATA>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
    {email: email,
    password: password,
    returnSecureToken: true
    })
    .pipe(tap(this.setUserData.bind(this)))
  }

  login(email: string, password: string) {
    return this.http.post<AUTHRESTDATA>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
   { email: email,
    password: password,
    returnSecureToken: true
  })
  .pipe(tap(this.setUserData.bind(this)))
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({key: 'authData'});
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }
  private setUserData(userData: AUTHRESTDATA) {
    const expirationDateTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
    const user = new User(
      userData.localId, 
      userData.email, 
      userData.idToken, 
      expirationDateTime)
    // console.log('idToken_?', userData.idToken);
    this._user.next(user);
    this.autoLogout(user.tokenDuration);

    this.storeAuthData(
      userData.localId,
      userData.email, 
      userData.idToken, 
      expirationDateTime.toISOString())
  }

  private storeAuthData(userId: string, email: string, token: string, tokenExpirationDate: string) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    Plugins.Storage.set({key: 'authData', value: data})
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration)
  }
}
