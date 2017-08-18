import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {User} from './user';
import {UserService} from '../shared/services/user.service';
import {Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';


var conf = require('../../../config.json');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService,
              private router: Router,) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
  }

  user = new User("", "", "", "", 0, "");

  onSubmit(user: User) {
    this.userService
      .loginUser(this.user)
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
