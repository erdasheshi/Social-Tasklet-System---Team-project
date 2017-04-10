import { Injectable }    from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { User } from '../model/user';
import { NetworkUser } from '../model/networkuser';
import { Friendship } from '../model/friendship';


@Injectable()
export class UserService {

  private apiURLRegister = 'http://localhost:8001/register/';
  private apiURLLogin = 'http://localhost:8001/login/';
  private apiURLNetwork = 'http://localhost:8001/user/';


  constructor(private http: Http) { }

  registerUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLRegister, newUser)
        .toPromise()
        .catch(this.handleError);
  }

  loginUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLLogin, newUser)
        .toPromise()
        .catch(this.handleError);
  }

  getNetwork(): Promise<NetworkUser[]> {
    return this.http.get(this.apiURLNetwork)
        .toPromise()
        .then((res: Response) => res.json())
        .catch(this.handleError);
  }

  getFriends(user: string): Promise<Friendship[]> {
    return this.http.get(this.apiURLNetwork + '?user=' + user)
        .toPromise()
        .then((res: Response) => res.json())
        .catch(this.handleError);
  }


  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
