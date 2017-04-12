import { Component, OnInit } from '@angular/core';
import { Friendship } from '../shared/model/friendship';
import { UserService } from '../shared/services/user.service'; //API Service
import { NetworkUser } from '../shared/model/networkuser'
import {AddFriendship} from "../shared/model/addFriendship";

const conf = require('../../../config.json');

@Component({
    selector: 'app-network',
    templateUrl: './network.component.html',
    styleUrls: ['./network.component.css'],
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
                 debugger;
                 console.log('Friends' + result);
                 this.friendships = result;
             })
             .catch(this.handleError);

    }


    //needs to be replaced with real data


    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }


    getFriends(): Friendship[] {
        if (this.friendships){
            return this.friendships.filter(friendship => friendship.status === 'accepted' || friendship.status === 'requested');
        }
    }

    getNetwork(): NetworkUser[] {
        return this.networkUsers;
    }

    private updateFriendship(friendships: Friendship[], user, status: string): Friendship[] {
        return friendships.map(friendship => {
            if (friendship.user_2 === user) friendship.status = status;
            return friendship;
        });
    }

    addFriend(user) {
        //get all friends of current user
        var newFriendship = new AddFriendship(user, 'pending');

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
        this.friendships = this.updateFriendship(this.friendships, user, 'pending');
    }

    deleteFriend(user) {
        if (this.friendships){
            this.friendships = this.updateFriendship(this.friendships, user, 'none');
        }
    }

}
