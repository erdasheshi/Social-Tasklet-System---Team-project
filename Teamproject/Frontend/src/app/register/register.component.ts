import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {User} from './user';
import {UserService} from '../shared/services/user.service'; //API Service
import {Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

var conf = require('../../../config.json');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})
export class RegisterComponent implements OnInit {

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService, //API Service
              private router: Router,) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
  }

  //Initiate User Object. This user object is linked to the form and gets updated accordingly
  user = new User("", "", "", "", 0, "");

  //add new user object. On success from the API navigate to the transaction screen
  onSubmit(user: User) {
    this.userService
      .registerUser(this.user)
      .then(res => {
        if (res.status === 200) {
          this.router.navigate(['/transactions']);
          window.location.reload();
        }
      })
      .catch(err => this.handleError(err));
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
