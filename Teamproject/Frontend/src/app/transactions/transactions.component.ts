import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { TransactionList } from '../shared/model/transactionlist';
import { NetworkUser } from '../shared/model/networkuser'

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
  balance = 101;

  constructor(private userService: UserService,) { }

  ngOnInit() {

    //get all transactions
    this.userService
        .getTransactions()
        .then(result => {
            console.log('Transactions' + result);
            console.log('Hallo');
            this.transactionListItems = result;
            console.log(this.transactionListItems);
        })
        .catch(this.handleError);

        //get balance
        this.userService
            .getUser()
            .then(result => {
                this.NetworkUserItems = result;
                this.balance = this.NetworkUserItems.balance;
            })
            .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
      return Promise.reject(error.message || error);
  }

  getTransactions(): TransactionList[] {
      return this.transactionListItems;
  }

    getUser(): NetworkUser{
        return this.NetworkUserItems;
    }

}
