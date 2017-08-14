import {Injectable}    from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {User} from '../model/user';
import {NetworkUser} from '../model/networkuser';
import {Friendship} from '../model/friendship';
import {AddFriendship} from '../model/addFriendship';
import {TransactionList} from '../model/transactionlist';
import {coinsRequest} from '../model/coinsRequest';
import {RequestedCoinsList} from '../model/requestedCoinsList';
import {Device} from '../model/device';

import {RequestOptions, Request, RequestMethod} from '@angular/http';
import {Headers} from '@angular/http';

var conf = require('../../../../config.json');
// var serverURL = 'http://46.101.198.127';
var serverURL = 'http://localhost';

var conf = require('../../../../config.json');
let headers = new Headers();
let options = new RequestOptions({ headers: headers, withCredentials: true });

@Injectable()
export class UserService {

  private apiURLRegister =  serverURL + ':8001/register/';
  private apiURLLogin =  serverURL + ':8001/login/';
  private apiURLLogout =  serverURL + ':8001/logout/';
  private apiURLNetwork =  serverURL + ':8001/user/?all=X';
  private apiURLFriendships =  serverURL + ':8001/sfbuserinfo/';
  private apiURLAddFriend =  serverURL + ':8001/friendship/';
  private apiURLTransaction =  serverURL + ':8001/acctransaction';
  private apiURLUser =  serverURL + ':8001/user';
  private apiURLAddCoins =  serverURL + ':8001/coinrequest/';
  private apiURLRequestedCoins = serverURL + ':8001/requestedcoins/';
  private apiURLDevice = serverURL + ':8001/device/';

  constructor(private http: Http) {
  }

  registerUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLRegister, newUser, options)
      .toPromise()
      .catch(this.handleError);
  }

  loginUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLLogin, newUser, options)
      .toPromise()
      .catch(this.handleError);
  }

  logoutUser(): Promise<any> {
    return this.http.get(this.apiURLLogout, options)
      .toPromise()
      .catch(this.handleError);
  }

  getNetwork(): Promise<NetworkUser[]> {
    return this.http.get(this.apiURLNetwork, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new NetworkUser(obj)))
      .catch(this.handleError);
  }

  getTransactions(): Promise<TransactionList[]> {
    return this.http.get(this.apiURLTransaction, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new TransactionList(obj)))
      .catch(this.handleError);
  }

  getUser(): Promise<NetworkUser> {
    return this.http.get(this.apiURLUser, options)
      .toPromise()
      .then((res: Response) => res.json() as NetworkUser)
      .catch(this.handleError);
  }

  getFriends(): Promise<Friendship[]> {
    return this.http.get(this.apiURLFriendships, options)
      .toPromise()
      .then((res: Response) => res.json().connections.map(obj => new Friendship(obj)))
      .catch(this.handleError);
  }

  getRequestedCoins(): Promise<RequestedCoinsList[]> {
    return this.http.get(this.apiURLRequestedCoins, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new RequestedCoinsList(obj)))
      .catch(this.handleError);
  }

  addFriend(friendship: Friendship): Promise<any> {
    return this.http.post(this.apiURLAddFriend, friendship, options)
      .toPromise()
      .catch(this.handleError);
  }

  requestCoins(addCoins: coinsRequest): Promise<any> {
    return this.http.post(this.apiURLAddCoins, addCoins, options)
      .toPromise()
      .catch(this.handleError);
  }

  deleteUser(newUser: User): Promise<any> {
    return this.http.delete(this.apiURLUser, newUser)
      .toPromise()
      .catch(this.handleError);
  }

  addDevice(addDevice: Device): Promise<any> {
    return this.http.post(this.apiURLDevice, addDevice, options)
      .toPromise()
      .catch(this.handleError);
  }

  getDevices(): Promise<Device[]> {
    return this.http.get(this.apiURLDevice, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new Device(obj)))
      .catch(this.handleError);
  }

  deleteDevice(addDevice: Device): Promise<any> {
    return this.http.delete(this.apiURLDevice + "?device=" + addDevice)
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
