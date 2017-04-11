import { Component, OnInit } from '@angular/core';
import { Friendship } from './friendship';
import { UserService } from '../shared/services/user.service'; //API Service
import { NetworkUser } from '../shared/model/networkuser'

const conf = require('../../../config.json');

@Component({
    selector: 'app-network',
    templateUrl: './network.component.html',
    styleUrls: ['./network.component.css'],
    providers: [UserService] //API Service
})

export class NetworkComponent implements OnInit {

    networkUsers: NetworkUser[];
    friendships2: Friendship[];

    constructor(private userService: UserService, //API Service
    ) { }

    ngOnInit() {

        //get all users in network
        this.userService
            .getNetwork()
            .then(result => {
                debugger;
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
                this.friendships2 = result;
            })
            .catch(this.handleError);

    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }

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

    private updateFriendship(friendships: Friendship[], user, status: string): Friendship[] {
        return friendships.map(friendship => {
            if (friendship.user2 === user) friendship.status = status;
            return friendship;
        });
    }

    addFriend(user) {
        //get all friends of current user
        this.userService
            .addFriend(user)
            .then(res => {
                console.log(res.status);
                if (res.status === 200) {
                    console.log('success adding a friend');
                }
                console.log(JSON.stringify(res));
            })
            .catch(this.handleError);

        // TODO (hejsfj): Leads to an inconsistency if update fails
        this.friendships = this.updateFriendship(this.friendships, user, 'accepted');
    }

    deleteFriend(user) {
        this.friendships = this.updateFriendship(this.friendships, user, 'none');
    }

}
