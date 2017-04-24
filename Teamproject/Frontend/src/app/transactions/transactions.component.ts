import { Component, OnInit } from '@angular/core';
import { Transaction } from './transaction';
import { UserService } from '../shared/services/user.service'; //API Service
import { TransactionList } from '../shared/model/transactionlist';

var conf = require('../../../config.json');
var socket = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket);

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [UserService] //API Service
})
export class TransactionsComponent implements OnInit {

  transactionListItems: TransactionList[];

  constructor(private userService: UserService,) { }

  ngOnInit() {
    //socket.emit('SFRead_Acc')

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

  }

  private handleError(error: any): Promise<any> {
      return Promise.reject(error.message || error);
  }

  getTransactions(): TransactionList[] {
      return this.transactionListItems;
  }

  transactions = [
    new Transaction('Sebastian', 'Sammer', 250, 250, 'successful', '1'),
    new Transaction('Sebastian', 'Erda', 450, 450, 'successful', '1'),
    new Transaction('Sebastian', 'Alex', 450, 450, 'successful', '1'),
    new Transaction('Sebastian', 'Sammer', 750, 750, 'successful', '1'),
    new Transaction('Sebastian', 'Sammer', 1850, 1850, 'successful', '1'),
    new Transaction('Sebastian', 'Sammer', 50, 50, 'successful', '1')
  ];

}
