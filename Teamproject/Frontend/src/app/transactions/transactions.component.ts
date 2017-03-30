import { Component, OnInit } from '@angular/core';
import { Transaction } from './transaction'

var conf = require('../../../config.json');
var socket = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket);

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    socket.emit('SFRead_Acc')
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
