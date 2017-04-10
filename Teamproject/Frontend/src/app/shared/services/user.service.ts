import { Injectable }    from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { User } from '../model/user'


@Injectable()
export class UserService {

  private apiURLRegister = 'http://localhost:8001/register/';
  private apiURLLogin = 'http://localhost:8001/login/';
  private apiURLNetwork = 'http://localhost:8001/user/';


  constructor(private http: Http) { }

  registerUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLRegister, newUser)
        .toPromise()
  }

  loginUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLLogin, newUser)
        .toPromise()
  }

}
