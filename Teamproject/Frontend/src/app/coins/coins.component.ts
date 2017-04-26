import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { NetworkUser } from '../shared/model/networkuser';
import { coinsRequest }    from '../shared/model/coinsRequest';

var conf = require('../../../config.json');

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class CoinsComponent implements OnInit {

  NetworkUserItems: NetworkUser;
  balance = 101;
  coinsReq = new coinsRequest (0);

  constructor(private userService: UserService) { }

  ngOnInit() {

    //get balance
    this.userService
        .getUser()
        .then(result => {
            console.log('Coins' + result);
            console.log('Hallo');
            this.NetworkUserItems = result;
            console.log(this.NetworkUserItems);
            this.balance = this.NetworkUserItems.balance;
        })
        .catch(this.handleError);

  }

  onSubmit(user: coinsRequest) {
    console.log(this.coinsReq);
    this.userService
        .requestCoins(this.coinsReq)
        .then(res => {
          console.log(JSON.stringify(res));
          if (res.status === 200){
            console.log("NIICCCEEE! Rich guy!");
          }
        })
        .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
      return Promise.reject(error.message || error);
  }

  getUser(): NetworkUser{
      return this.NetworkUserItems;
  }

}
