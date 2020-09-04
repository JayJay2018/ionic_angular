import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';


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
export class AuthService {
  private _user = new BehaviorSubject<User>(null)

  get userIsAthenticated() {
    return this._user.asObservable().pipe(map( user => {
      if (user) {
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

  constructor(
    private http: HttpClient
  ) { }

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
    this._user.next(null);
  }

  private setUserData(userData: AUTHRESTDATA) {
    const expirationDateTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
    const newUser = new User(
      userData.localId, 
      userData.email, 
      userData.idToken, 
      expirationDateTime)
  }
}
