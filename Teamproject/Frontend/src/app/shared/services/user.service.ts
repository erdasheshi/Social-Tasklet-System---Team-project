import {Injectable} from '@angular/core';
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

//For local testing use localhost, for testing against a specific server the corresponding server IP
//var serverURL = 'http://localhost';
var serverURL = 'http://34.212.187.85'; // AWS
// var serverURL = 'http://46.101.198.127'; // DigitalOcean

let headers = new Headers();
let options = new RequestOptions({headers: headers, withCredentials: true});

@Injectable()
export class UserService {

  //API Path definitions
  private apiURLRegister = serverURL + ':8001/register/';
  private apiURLLogin = serverURL + ':8001/login/';
  private apiURLLogout = serverURL + ':8001/logout/';
  private apiURLNetwork = serverURL + ':8001/user/?all=X';
  // private apiURLFriendships =  serverURL + ':8001/sfbuserinfo/';
  private apiURLAddFriend = serverURL + ':8001/friendship/';
  private apiURLTransaction = serverURL + ':8001/acctransaction';
  private apiURLUser = serverURL + ':8001/user';
  private apiURLAddCoins = serverURL + ':8001/coinrequest/';
  private apiURLRequestedCoins = serverURL + ':8001/requestedcoins/';
  private apiURLDevice = serverURL + ':8001/device/';

  constructor(private http: Http) {
  }

  //API Get and Post Calls for the application. Each component uses those central calls if needed.
  //All according classes can be found in ../model which are referenced in this class

  /*
  Register a new user thru the user obejct
   */
  registerUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLRegister, newUser, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
   Loigin the user with the user obejct
   */
  loginUser(newUser: User): Promise<any> {
    return this.http.post(this.apiURLLogin, newUser, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
   End the current session of a user
   */
  logoutUser(): Promise<any> {
    return this.http.post(this.apiURLLogout, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
  Get all friends of a user
   */
  getNetwork(): Promise<NetworkUser[]> {
    return this.http.get(this.apiURLNetwork, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new NetworkUser(obj)))
      .catch(this.handleError);
  }

  /*
  Get all transactions of a user
   */
  getTransactions(): Promise<TransactionList[]> {
    return this.http.get(this.apiURLTransaction, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new TransactionList(obj)))
      .catch(this.handleError);
  }

  /*
  Get the current user object
   */
  getUser(): Promise<NetworkUser> {
    return this.http.get(this.apiURLUser, options)
      .toPromise()
      .then((res: Response) => res.json() as NetworkUser)
      .catch(this.handleError);
  }

  /*
   Get all friends
   */
  getFriends(): Promise<Friendship[]> {
    return this.http.get(this.apiURLAddFriend, options)
      .toPromise()
      .then((res: Response) => {
        return JSON.parse(res.json()).map(obj => new Friendship(obj))
      })
      .catch(this.handleError);
  }

  /*
   Get all pending coin requests
   */
  getRequestedCoins(): Promise<RequestedCoinsList[]> {
    return this.http.get(this.apiURLRequestedCoins, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new RequestedCoinsList(obj)))
      .catch(this.handleError);
  }

  /*
   Add a new friendship object. Friendship object must contain the user ID of the friend which should be added
   */
  addFriend(friendship: Friendship): Promise<any> {
    return this.http.post(this.apiURLAddFriend, friendship, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
  Needs ammount of coins as coin object
   */
  requestCoins(addCoins: coinsRequest): Promise<any> {
    return this.http.post(this.apiURLAddCoins, addCoins, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
  Needs the username which should be deleted.
   */
  deleteUser(username: string): Promise<any> {
    return this.http.delete(this.apiURLUser + "?username=" + username, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
   Needs the device opject which should be added or updated.
   */
  addDevice(addDevice: Device): Promise<any> {
    return this.http.post(this.apiURLDevice, addDevice, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
   Does not need any inputs. Gets all devices for a user, whereas the user is defined in the express.js session
   */
  getDevices(): Promise<Device[]> {
    return this.http.get(this.apiURLDevice, options)
      .toPromise()
      .then((res: Response) => res.json().map(obj => new Device(obj)))
      .catch(this.handleError);
  }

  /*
   Delete the device with corresponding device ID
   */
  deleteDevice(addDevice: Device): Promise<any> {
    return this.http.delete(this.apiURLDevice + "?device=" + addDevice, options)
      .toPromise()
      .catch(this.handleError);
  }

  /*
   Delete a friendship whereas the userID is the username
   */
  deleteFriendship(user: string): Promise<any> {
    return this.http.delete(this.apiURLAddFriend + "?user=" + user, options)
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
