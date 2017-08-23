import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {UserService} from '../shared/services/user.service'; // API Service
import {Router} from '@angular/router';
import {Device} from './device';
import {NetworkUser} from '../shared/model/networkuser';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

var conf = require('../../../config.json');

@Component({
  selector: 'app-registerdevice',
  templateUrl: './registerdevice.component.html',
  styleUrls: ['./registerdevice.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] // API Service
})
export class RegisterdeviceComponent implements OnInit {

  NetworkUserItems: NetworkUser;
  username: string;
  deviceNew = new Device("", "", 0, "", "", "", "");
  downloadURL: string;

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService, // API Service
              private router: Router) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    // get username
    this.userService
      .getUser()
      .then(result => {
        this.NetworkUserItems = result;
        this.username = this.NetworkUserItems.username;
      })
      .catch(err => this.handleError(err));
  }

  onSubmit(device: Device) {

    this.deviceNew.username = this.username;
    this.deviceNew.download = "X";
    this.userService
      .addDevice(this.deviceNew)
      .then(res => {
        if (res.status === 200) {
          this.downloadURL = res._body;
          this.downloadURL = this.downloadURL.replace("\"", "");
          this.downloadURL = this.downloadURL.replace("\"", "");
          console.log(this.downloadURL);
          window.open(this.downloadURL);
          this.router.navigate(['/devices']);
        }
      })
      .catch(err => this.handleError(err));
  }

  startDownload(){

    this.downloadURL = this.downloadURL.replace("\"", "");
    this.downloadURL = this.downloadURL.replace("\"", "");
    console.log(this.downloadURL);
    window.open(this.downloadURL);
    this.router.navigate(['/devices']);
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
