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
  requester: string;

  constructor(public toastr: ToastsManager,
              vcr: ViewContainerRef,
              private userService: UserService,) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {

    this.userService
      .getNetwork()
      .then(result => {
        console.log('Network' + result);
        this.networkUsers = result;
      })
      .catch(err => this.handleError(err));

    this.userService
      .getFriends()
      .then(result => {
        console.log('Friends' + result);
        this.friendships = result;
      })
      .catch(err => this.handleError(err));

    this.userService
      .getUser()
      .then(res => {
        this.requester = res.username;
      })
      .catch(err => this.handleError(err));
  }

  getPendingFriends(): Friendship[] {
    if (this.friendships) {
      console.log(this.friendships.length);
      return this.friendships.filter(friendship => friendship.status === 'pending');
    }
    else {
      console.log(this.friendships.length);
      return [];
    }
  }

  getRequestedFriends(): Friendship[] {
    if (this.friendships) {
      return this.friendships.filter(friendship => friendship.status === 'requested');
    }
  }

  getFriends(): Friendship[] {
    if (this.friendships) {
      return this.friendships.filter(friendship => friendship.status === 'confirmed');
    }
  }

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

  private updateFriendship(friendships: Friendship[], user, status): Friendship[] {
    return friendships.map(friendship => {
      if (friendship.name === user) friendship.status = status;
      return friendship;
    });
  }

  confirmFriend(user) {
    var tmp = {name: user, status: "confirmed"};
    var newFriendship = new Friendship(user, tmp);

    this.userService
      .addFriend(newFriendship)
      .then(res => {
        console.log(res.status);
        if (res.status === 200) {
          console.log('success adding a friend');
        }
        console.log(JSON.stringify(res));
      })
      .catch(err => this.handleError(err));

    this.friendships = this.updateFriendship(this.friendships, user, 'confirmed');
  }

  addFriend(user) {
    const friend = {
      status: 'requested',
      user_1: this.requester,
      user_2: user,
    };
    var newFriendship = new Friendship(this.requester, friend);

    this.userService
      .addFriend(newFriendship)
      .then(res => {
        console.log(res.status);
        if (res.status === 200) {
          console.log('success adding a friend');
        }
        console.log(JSON.stringify(res));
      })
      .catch(err => this.handleError(err));

    this.friendships.push(newFriendship);
  }

  deleteFriend(user) {
    //if (this.friendships) {
    //this.friendships = this.updateFriendship(this.friendships, user, 'none');
    //}

    var tmp = {name: user, status: "none"};
    var newFriendship = new Friendship(user, tmp);

    this.userService
      .addFriend(newFriendship)
      .then(res => {
        console.log(res.status);
        if (res.status === 200) {
          console.log('friend successfully deleted');
          window.location.reload();
        }
        console.log(JSON.stringify(res));
      })
      .catch(err => this.handleError(err));

    this.friendships.push(newFriendship);

  }

  private handleError(err: any) {
    this.toastr.error(JSON.parse(err._body).err, 'Oops!');
  }

}
