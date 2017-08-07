import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { Router } from '@angular/router';
import { Device } from './device';
import { NetworkUser } from '../shared/model/networkuser';

var conf = require('../../../config.json');

@Component({
  selector: 'app-registerdevice',
  templateUrl: './registerdevice.component.html',
  styleUrls: ['./registerdevice.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class RegisterdeviceComponent implements OnInit {

  NetworkUserItems: NetworkUser;
  username: string;
  deviceNew = new Device ("", "", 0, "", "", "");

  constructor(
    private userService: UserService, //API Service
    private router: Router,
  ) { }

  ngOnInit() {
    //get username
    this.userService
      .getUser()
      .then(result => {
        this.NetworkUserItems = result;
        this.username = this.NetworkUserItems.username;
      })
      .catch(this.handleError);
  }

  onSubmit(device: Device) {

    console.log(this.deviceNew);
    this.deviceNew.username = this.username;
    this.userService
      .addDevice(this.deviceNew)
      .then(res => {
        console.log(JSON.stringify(res));
        if (res.status === 200){
          this.router.navigate(['/devices']);
        }
      })
      .catch(this.handleError);
  }

  private handleError(err: any) {
     alert(err || err.message);
  }

}
