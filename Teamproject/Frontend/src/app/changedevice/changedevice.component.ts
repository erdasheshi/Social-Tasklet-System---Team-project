import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { Router, ActivatedRoute, Params, Data } from '@angular/router';
import { Device } from './device';
import { NetworkUser } from '../shared/model/networkuser';
import { ChangeDevice } from '../shared/model/ChangeDevice';

@Component({
  selector: 'app-changedevice',
  templateUrl: './changedevice.component.html',
  styleUrls: ['./changedevice.component.css']
})
export class ChangedeviceComponent implements OnInit {

  NetworkUserItems: NetworkUser;
  username: string;
  device: Params;
  deviceNew: Device;
  deviceID: string;

  constructor(
    private userService: UserService, //API Service
    private router: Router,
    private route: ActivatedRoute,
    public changeDevice: ChangeDevice,
  ) { }

  ngOnInit() {
    this.deviceNew = this.changeDevice.device;
    console.log(this.deviceNew);

  }

  onSubmit(device: Device) {
    console.log(this.deviceNew);
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
