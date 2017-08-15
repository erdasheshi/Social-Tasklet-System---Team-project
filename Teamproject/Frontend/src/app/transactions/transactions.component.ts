import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {UserService} from '../shared/services/user.service'; //API Service
import {TransactionList} from '../shared/model/transactionlist';
import {NetworkUser} from '../shared/model/networkuser';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

var conf = require('../../../config.json');

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class TransactionsComponent implements OnInit {

  transactionListItems: TransactionList[];
  NetworkUserItems: NetworkUser;
  balance = 0;

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService,) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {

    //get all transactions
    this.userService
      .getTransactions()
      .then(result => {
        this.transactionListItems = result;
      })
      .catch(err => this.handleError(err));

    //get balance
    this.userService
      .getUser()
      .then(result => {
        this.NetworkUserItems = result;
        this.balance = this.NetworkUserItems.balance;
      })
      .catch(err => this.handleError(err));

  }

  getTransactions(): TransactionList[] {
    return this.transactionListItems;
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
