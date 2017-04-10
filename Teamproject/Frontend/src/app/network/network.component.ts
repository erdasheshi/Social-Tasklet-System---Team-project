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

  networkUsers2: NetworkUser[];
  friendships2: Friendship[];

  constructor(
      private userService: UserService, //API Service
  ) { }

  ngOnInit() {

    //get all users in network
    this.userService
        .getNetwork()
        .then(result => {
          debugger;
          console.log(result);
          this.networkUsers2 = result
          console.log(this.networkUsers2);
        })
        .catch(this.handleError);

    //get all friends of current user
    this.userService
        .getFriends()
        .then(result => {
          debugger;
          console.log(result);
          this.friendships2 = result
          console.log(this.friendships2);
        })
        .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }


  //needs to be replaced with real data
  networkUsers = [
    new NetworkUser('09042342', 'Sebastian', 'firstname', 'lastname', 'app@seprodu.com', 100, '100'),
    new NetworkUser('09042342', 'Alex', 'firstname', 'lastname', 'app@seprodu.com', 100, '100'),
    new NetworkUser('09042342', 'Daniel', 'firstname', 'lastname', 'app@seprodu.com', 100, '100'),
  ];

  //needs to be replaced with real data
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

  getNetwork(): NetworkUser[] {
    return this.networkUsers;
  }

  addFriend(user) {

    //get all friends of current user
    this.userService
        .addFriend(user)
        .then(res => {
          console.log(res.status);
          if (res.status === 200){
            console.log('success adding a friend');
          }
          console.log(JSON.stringify(res));
        })
        .catch(this.handleError);

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
