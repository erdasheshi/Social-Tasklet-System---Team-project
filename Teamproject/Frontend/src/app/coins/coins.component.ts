import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {UserService} from '../shared/services/user.service'; //API Service
import {NetworkUser} from '../shared/model/networkuser';
import {coinsRequest} from '../shared/model/coinsRequest';
import {RequestedCoinsList} from '../shared/model/requestedCoinsList';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

var conf = require('../../../config.json');

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})

export class CoinsComponent implements OnInit {

  requestedCoinsListItems: RequestedCoinsList[];
  NetworkUserItems: NetworkUser;
  balance = 0;
  coinsReq = new coinsRequest(0);

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {

    //get balance
    this.userService
      .getUser()
      .then(result => {
        this.NetworkUserItems = result;
        this.balance = this.NetworkUserItems.balance;
      })
      .catch(err => this.handleError(err));

    //get all coin requests
    this.userService
      .getRequestedCoins()
      .then(result => {
        this.requestedCoinsListItems = result;
      })
      .catch(err => this.handleError(err));

  }

  onSubmit(user: coinsRequest) {
    this.userService
      .requestCoins(this.coinsReq)
      .then(res => {
        return;
      })
      .then(() => this.userService.getRequestedCoins())
      .then(result => {
        this.requestedCoinsListItems = result;
      })
      .catch(err => this.handleError(err));
  }

  getRequestedCoins(): RequestedCoinsList[] {
    return this.requestedCoinsListItems;
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
