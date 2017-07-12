import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/services/user.service'; //API Service

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class HeaderComponent implements OnInit {

  constructor(private userService: UserService) { }

  ngOnInit() {
      }

  logoutFunction(){

    //logout
    this.userService
      .logoutUser()
      .then(result => {
        console.log('Tscchüüüsssiii');
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
