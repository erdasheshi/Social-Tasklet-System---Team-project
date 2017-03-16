import { Component, OnInit } from '@angular/core';

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
    var j={"userid":"test", "password":"test", "price":"test", "email":"test", "firstname":"test", "lastname":"test"};
    JSON.stringify(j);
    this.clickMessage = 'You are my hero!';
    console.log(j);
  }

}
