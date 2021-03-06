import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Friendship} from '../shared/model/friendship';
import {UserService} from '../shared/services/user.service'; //API Service
import {NetworkUser} from '../shared/model/networkuser';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

const conf = require('../../../config.json');

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css', '../shared/styles/grid.css', '../shared/styles/global.css'],
  providers: [UserService] //API Service
})

export class NetworkComponent implements OnInit {

  networkUsers: NetworkUser[];
  friendships: Friendship[];

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService,) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.userService
      .getNetwork()
      .then(result => {
        this.networkUsers = result;
      })
      .catch(err => this.handleError(err));

    this.userService
      .getFriends()
      .then(result => {
        this.friendships = result;
      })
      .catch(err => this.handleError(err));
  }

  //Filter only Pending Friends
  getPendingFriends(): Friendship[] {
    if (this.friendships) {
      return this.friendships.filter(friendship => friendship.status === 'Pending');
    }
    else {
      return [];
    }
  }

  //Filter only Requested Friends
  getRequestedFriends(): Friendship[] {
    if (this.friendships) {
      return this.friendships.filter(friendship => friendship.status === 'Requested');
    }
  }

  //Get all Friends a user
  getFriends(): Friendship[] {
    if (this.friendships) {
      return this.friendships.filter(friendship => friendship.status === 'Confirmed');
    }
  }

  //Get all users in the system
  getNetwork(): NetworkUser[] {
    if (this.networkUsers && this.friendships) {
      for (var i = 0; i < this.friendships.length; i++) {
        for (var j = 0; j < this.networkUsers.length; j++) {
          if (this.networkUsers[j].username === this.friendships[i].name) {
            this.networkUsers.splice(j, 1);
          }
        }
      }
    }
    return this.networkUsers;
  }

  //Method used to update a friendship object
  private updateFriendship(friendships: Friendship[], user, status): Friendship[] {
    return friendships.map(friendship => {
      if (friendship.name === user) friendship.status = status;
      return friendship;
    });
  }

  //confirm a friendship if successful and write it to the notification bar
  confirmFriend(user) {
    var tmp = {user: user, status: "Confirmed"};
    var newFriendship = new Friendship(tmp);

    this.userService
      .addFriend(newFriendship)
      .then(res => {
        if (res.status === 200) {
          this.toastr.success('Friend successfully added.');
        }
      })
      .catch(err => this.handleError(err));

    this.friendships = this.updateFriendship(this.friendships, user, 'Confirmed');
  }

  //add friend --> change status to requested
  addFriend(user) {
    const friend = {
      user: user,
      status: 'Requested'
    };
    var newFriendship = new Friendship(friend);

    this.userService
      .addFriend(newFriendship)
      .then(res => {
        if (res.status === 200) {
          window.location.reload();
          // this.toastr.info('Friendship successfully requested.');
        }
        this.friendships.push(newFriendship);
        window.location.reload();
      })
      .catch(err => this.handleError(err));
  }

  //Delete a friendship object
  deleteFriend(user) {
    this.userService
      .deleteFriendship(user)
      .then(() => this.userService.getFriends())
      .then(result => {
        this.friendships = result;
        window.location.reload();
      })
      .catch(err => this.handleError(err));
  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
