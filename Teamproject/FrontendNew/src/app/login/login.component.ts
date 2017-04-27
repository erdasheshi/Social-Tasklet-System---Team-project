import { Component, OnInit } from '@angular/core';
import { User }    from './user';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';


var conf = require('../../../config.json');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  constructor(
      private userService: UserService,
        private router: Router,
  ) { }

  ngOnInit() {
  }

  user = new User("", "", "", "", 0, "");

  onSubmit(user: User) {
    console.log(this.user);
    this.userService
        .loginUser(this.user)
        .then(res => {
            console.log(res.status);
            if (res.status === 200){
                this.router.navigate(['/transactions']);
            }
          console.log(JSON.stringify(res));
        })
        .catch(this.handleError);
  }

  private handleError(err: any) {

      alert(err || err.message);

  }

}
