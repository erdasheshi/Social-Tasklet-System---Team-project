import { Component, OnInit } from '@angular/core';
import { User }    from './user';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';

var conf = require('../../../config.json');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {

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
        .registerUser(this.user)
        .then(res => {
          console.log(JSON.stringify(res));
          if (res.status === 200){
            this.router.navigate(['/transactions']);
          }
        })
        .catch(this.handleError);
  }

  private handleError(err: any) {
    if (err.status === 409) {
      alert('This user was already added.');
    } else {
      alert(err || err.message);
    }
  }

}
