import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {UserService} from '../shared/services/user.service'; //API Service
import {User} from './user';
import {NetworkUser} from '../shared/model/networkuser';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class HeaderComponent implements OnInit {

  networkUserForHeader: NetworkUser[];

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  user = new User("", "", "", "", 0, "");
  userInfo: NetworkUser;

  ngOnInit() {
    this.userService
      .getNetwork()
      .then(result => {
        this.networkUserForHeader = result;
      })
      .catch(err => this.handleError(err));
  }

  logoutFunction() {
    //logout
    this.userService
      .logoutUser()
      .then(result => {
        window.location.reload();
      })
      .catch(err => this.handleErrorToaster(err));
  }

  deleteUserFunction() {
    this.userService
      .getUser()
      .then(result => {
        this.userInfo = result;
      })
      .then(() => {
        return this.userService.deleteUser(this.userInfo.username);
      })
      .then(() => {
        return window.location.reload();
      })
      .catch(err => this.handleErrorToaster(err));
  }

  private handleError(err: any) {
    console.log(JSON.parse(err._body).err);
  }

  private handleErrorToaster(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
