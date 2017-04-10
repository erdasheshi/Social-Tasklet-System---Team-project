import { Component, OnInit } from '@angular/core';
import { Friendship } from './friendship'

var conf = require('../../../config.json');

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})

export class NetworkComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  //requested confirmed


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
