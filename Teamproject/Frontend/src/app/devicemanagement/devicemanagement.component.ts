import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { Router } from '@angular/router';
import { Device } from '../shared/model/device';

@Component({
  selector: 'app-devicemanagement',
  templateUrl: './devicemanagement.component.html',
  styleUrls: ['./devicemanagement.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})

export class DevicemanagementComponent implements OnInit {

  registeredDevices: Device[];

  constructor(
    private userService: UserService, //API Service
    private router: Router,
  ) { }

  ngOnInit() {
    //get devices
    this.userService
      .getDevices()
      .then(result => {
        console.log('Devices' + result);
        this.registeredDevices = result;
        console.log(this.registeredDevices);
      })
      .catch(this.handleError);
  }

  getregisteredDevices(): Device[] {
    if (this.registeredDevices) {
      console.log(this.registeredDevices.length);
      return this.registeredDevices;
    }
    else{
      console.log(this.registeredDevices.length);
      return [];
    }
  }

  removeDevice(name){
    this.userService
      .deleteDevice(name.device)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
