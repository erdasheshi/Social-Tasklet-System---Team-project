import { Component, OnInit } from '@angular/core';

var conf = require('../../../config.json');
var socket = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket);

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  clickMessage = '';

  onClickMe() {
    var j={"type":"User", "userid":"test", "password":"123", "price":"1234", "email":"test", "firstname":"test", "lastname":"test"};
    JSON.stringify(j);
    this.clickMessage = 'You are my hero!';
    console.log(j);

    socket.emit('SFWrite_User', j);

  }

}
