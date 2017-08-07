import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service
import { User }    from './user';
import {NetworkUser} from '../shared/model/networkuser'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class HeaderComponent implements OnInit {

  networkUserForHeader: NetworkUser[];

  constructor(private userService: UserService) { }

  user = new User("", "", "", "", 0, "");

  ngOnInit() {

    this.userService
      .getNetwork()
      .then(result => {
        console.log('Network' + result);
        this.networkUserForHeader = result;
      })
      .catch(this.handleError);

  }

  logoutFunction(){
    //logout
    this.userService
      .logoutUser()
      .then(result => {
        console.log('Tscchüüüsssiii');
        window.location.reload();
      })
      .catch(this.handleError);

  }

  deleteUserFunction(){

    this.userService
      .deleteUser(this.user)
      .then(result => {
        window.location.reload();
      })
      .catch(this.handleError);
  }


  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  getNetworkUserForHeader(): NetworkUser[] {
    return this.networkUserForHeader;
  }
}
