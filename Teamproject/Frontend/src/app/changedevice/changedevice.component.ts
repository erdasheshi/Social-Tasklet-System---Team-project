import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { Router } from '@angular/router';
import { Device } from './device';
import { NetworkUser } from '../shared/model/networkuser';

@Component({
  selector: 'app-changedevice',
  templateUrl: './changedevice.component.html',
  styleUrls: ['./changedevice.component.css']
})
export class ChangedeviceComponent implements OnInit {

  NetworkUserItems: NetworkUser;
  username: string;
  deviceNew = new Device ("", "", 0, "", "", "");

  constructor(
    private userService: UserService, //API Service
    private router: Router,
  ) { }

  ngOnInit() {

    this.userService
      .getUser()
      .then(result => {
        this.NetworkUserItems = result;
        this.username = this.NetworkUserItems.username;
      })
      .catch(this.handleError);

  }

  private handleError(err: any) {
    alert(err || err.message);
  }

}
