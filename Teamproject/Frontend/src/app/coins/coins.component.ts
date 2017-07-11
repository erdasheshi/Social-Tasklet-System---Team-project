import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { NetworkUser } from '../shared/model/networkuser';
import { coinsRequest }    from '../shared/model/coinsRequest';
import { RequestedCoinsList } from '../shared/model/requestedCoinsList';

var conf = require('../../../config.json');

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class CoinsComponent implements OnInit {

  NetworkUserItems: NetworkUser;
<<<<<<< Updated upstream
  balance = 0;
=======
  requestedCoinsListItems: RequestedCoinsList[];
  balance = 101;
>>>>>>> Stashed changes
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

        //get all coin requests
        this.userService
            .getRequestedCoins()
            .then(result => {
                console.log('RequestedCoins' + result);
                console.log('Hallo');
                this.requestedCoinsListItems = result;
                console.log(this.requestedCoinsListItems);
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
