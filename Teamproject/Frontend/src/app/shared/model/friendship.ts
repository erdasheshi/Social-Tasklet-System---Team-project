export class Friendship {

    name:string;
    Friendship_Status: string;
    user_1: string;
    user_2: string;
    status: string;

    constructor(userObj) {
        this.name = userObj.name;
        this.Friendship_Status = userObj.Friendship_Status;
        this.user_1 = userObj.user_1;
        this.user_2 = userObj.user_2;
        this.status = userObj.status;

    }
}