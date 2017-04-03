import { Component, OnInit } from '@angular/core';
import { User }    from './user';

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


  user = new User("", "", "", 0, "");

  onSubmit() {
    //var j={"type":"User", "userid":"test", "password":"123", "price":"1234", "email":"test", "firstname":"test", "lastname":"test"};
    //JSON.stringify(j);
    console.log(this.user);

    var userID= Math.floor((Math.random() * 100) + 1);
    var userIDNew = userID.toString();
    var userInfo = {"type":"User", "userid": userIDNew};
//    var user = userInfo.concat(this.user);
  //  JSON.stringify(user);

    //socket.emit('SFWrite_User', user);
  }

}
