import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {UserService} from '../shared/services/user.service'; //API Service
import {Router} from '@angular/router';
import {Device} from '../shared/model/device';
import {ChangeDevice} from '../shared/model/ChangeDevice';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-devicemanagement',
  templateUrl: './devicemanagement.component.html',
  styleUrls: ['./devicemanagement.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})

export class DevicemanagementComponent implements OnInit {

  registeredDevices: Device[];
  device: Device;

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              public changeDevice: ChangeDevice,
              private userService: UserService, //API Service
              private router: Router) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    //get devices
    this.userService
      .getDevices()
      .then(result => {
        this.registeredDevices = result;
      })
      .catch(err => this.handleError(err));
  }

  //get all registered devices
  getregisteredDevices(): Device[] {
    if (this.registeredDevices) {
      return this.registeredDevices;
    }
    else {
      return [];
    }
  }

  //remove a device
  removeDevice(name) {
    this.userService
      .deleteDevice(name.device)
      .catch(err => this.handleError(err));
    window.location.reload();
  }

  //change device with ID
  changeDeviceNav(name) {
    this.changeDevice.device = name;
    this.router.navigate(['/changeDevice', name.device]);
  }

  nav_adddevice(){
    this.router.navigate(['/adddevice']);
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
