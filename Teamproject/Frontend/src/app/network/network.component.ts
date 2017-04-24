import { Component, OnInit } from '@angular/core';
import { Friendship } from '../shared/model/friendship';
import { UserService } from '../shared/services/user.service'; //API Service
import { NetworkUser } from '../shared/model/networkuser'
import {AddFriendship} from "../shared/model/addFriendship";

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

    constructor(private userService: UserService, //API Service
    ) { }

    ngOnInit() {

        //get all users in network
        this.userService
            .getNetwork()
            .then(result => {
                console.log('Network' + result);
                this.networkUsers = result;
            })
            .catch(this.handleError);

        //get all friends of current user
         this.userService
             .getFriends()
             .then(result => {
                 console.log('Friends' + result);
                 debugger;
                 this.friendships = result;
             })
             .catch(this.handleError);

    }


    //needs to be replaced with real data


    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }


    getPendingFriends(): Friendship[] {
        if (this.friendships){
            return this.friendships.filter(friendship => friendship.Friendship_Status === 'pending');
        }
    }

    getFriends(): Friendship[] {
        if (this.friendships){
            return this.friendships.filter(friendship => friendship.Friendship_Status === 'Confirmed');
        }
    }

    getNetwork(): NetworkUser[] {
        return this.networkUsers;
    }

    private updateFriendship(friendships: Friendship[], user, status: string): Friendship[] {
        return friendships.map(friendship => {
            if (friendship.name === user) friendship.status = status;
            return friendship;
        });
    }

    confirmFriend(user) {
        //get all friends of current user
        var newFriendship = new AddFriendship(user, 'Confirmed');

        this.userService
            .addFriend(newFriendship)
            .then(res => {
                console.log(res.status);
                if (res.status === 200) {
                    console.log('success adding a friend');
                }
                console.log(JSON.stringify(res));
            })
            .catch(this.handleError);

        // TODO (hejsfj): Leads to an inconsistency if update fails
        this.friendships = this.updateFriendship(this.friendships, user, 'Confirmed');
    }

    addFriend(user) {
        //get all friends of current user
        var newFriendship = new AddFriendship(user, 'Requested');

        this.userService
            .addFriend(newFriendship)
            .then(res => {
                console.log(res.status);
                if (res.status === 200) {
                    console.log('success adding a friend');
                }
                console.log(JSON.stringify(res));
            })
            .catch(this.handleError);

        // TODO (hejsfj): Leads to an inconsistency if update fails
        this.friendships = this.updateFriendship(this.friendships, user, 'Requested');
    }

    deleteFriend(user) {
        if (this.friendships){
            this.friendships = this.updateFriendship(this.friendships, user, 'none');
        }
    }

}
