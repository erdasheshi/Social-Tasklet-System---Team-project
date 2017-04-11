import {Injectable}    from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {User} from '../model/user';
import {NetworkUser} from '../model/networkuser';
import {Friendship} from '../model/friendship';
import {TransactionList} from '../model/transactionlist';


@Injectable()
export class UserService {

    private apiURLRegister = 'http://localhost:8001/register/';
    private apiURLLogin = 'http://localhost:8001/login/';
    private apiURLNetwork = 'http://localhost:8001/user/?all=X';
    private apiURLFriendships = 'http://localhost:8001/user/';
    private apiURLAddFriend = 'http://localhost:8001/friendship/';
    private apiURLTransaction = 'http://localhost:8001/acctransaction?all=X';


    constructor(private http: Http) {
    }

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
            .then((res: Response) => {
                debugger;
                return res.json()[0].map(obj => new NetworkUser(obj))
            })
            .catch(this.handleError);
    }

    getTransactions(): Promise<TransactionList[]> {
        return this.http.get(this.apiURLTransaction)
            .toPromise()
            .then((res: Response) => {
                return res.json().map(obj => new TransactionList(obj))
            })
            .catch(this.handleError);
    }

    getFriends(): Promise<Friendship[]> {
        return this.http.get(this.apiURLFriendships)
            .toPromise()
            .then((res: Response) => res.json())
            .catch(this.handleError);
    }

    addFriend(name: string): Promise<any> {
        return this.http.post(this.apiURLAddFriend, name)
            .toPromise()
            .catch(this.handleError);
    }


    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }

}
