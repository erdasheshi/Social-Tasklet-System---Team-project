import { Component, OnInit } from '@angular/core';
import { Friendship } from './friendship';
import { UserService } from '../shared/services/user.service'; //API Service
import { NetworkUser } from '../shared/model/networkuser'

var conf = require('../../../config.json');

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css'],
  providers: [UserService] //API Service
})

export class NetworkComponent implements OnInit {

  networkUsers: NetworkUser[];
  friendships2: Friendship[];

  constructor(
      private userService: UserService, //API Service
  ) { }

  ngOnInit() {

    this.userService
        .getNetwork()
        .then(result => {
          console.log(result);
          this.networkUsers = result;
          console.log(this.networkUsers);
        })
        .catch(this.handleError);

    this.userService
        .getFriends('8080') //change the username
        .then(result => {
          console.log(result);
          this.friendships2 = result;
          console.log(this.friendships2);
        })
        .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }


  friendships = [
    new Friendship('Sebastian', 'Sammer', 'accepted'),
    new Friendship('Sebastian', 'Erda', 'none'),
    new Friendship('Sebastian', 'Alex', 'accepted'),
    new Friendship('Sebastian', 'Daniel', 'pending'),
    new Friendship('Sebastian', 'Philipp', 'accepted'),
  ];

  getFriends(): Friendship[] {
    return this.friendships.filter(friendship => friendship.status === 'accepted' || friendship.status === 'pending');
  }

  getNetwork(): Friendship[] {
    return this.friendships.filter(friendship => friendship.status === 'none');
  }

  addFriend(user) {

    var friendshipsLength = this.friendships.length;

    for (var i = 0; i < friendshipsLength; i++) {
      if(this.friendships[i].user2 === user){
        this.friendships[i].status = 'accepted';
      }
    }
  }

  deleteFriend(user) {

    var friendshipsLength = this.friendships.length;

    for (var i = 0; i < friendshipsLength; i++) {
      if(this.friendships[i].user2 === user){
        this.friendships[i].status = 'none';
      }
    }
  }

}
