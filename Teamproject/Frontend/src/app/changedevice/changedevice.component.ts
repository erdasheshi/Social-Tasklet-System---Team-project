import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {UserService} from '../shared/services/user.service'; //API Service
import {Router, ActivatedRoute, Params, Data} from '@angular/router';
import {Device} from './device';
import {NetworkUser} from '../shared/model/networkuser';
import {ChangeDevice} from '../shared/model/ChangeDevice';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-changedevice',
  templateUrl: './changedevice.component.html',
  styleUrls: ['./changedevice.component.css', '../shared/styles/grid.css', '../shared/styles/global.css']
})
export class ChangedeviceComponent implements OnInit {

  NetworkUserItems: NetworkUser;
  username: string;
  device: Params;
  deviceNew = new Device("", "", 0, "", "", "", "");
  deviceID: string;

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService, //API Service
              private router: Router,
              private route: ActivatedRoute,
              public changeDevice: ChangeDevice,) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.deviceNew = this.changeDevice.device;
  }

  onSubmit(device: Device) {
    this.deviceNew.download = "";
    this.userService
      .addDevice(this.deviceNew)
      .then(res => {
        if (res.status === 200) {
          this.router.navigate(['/devices']);
        }
      })
      .catch(err => this.handleError(err));
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
