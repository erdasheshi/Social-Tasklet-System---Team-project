export class Friendship {

    user_1: string;
    user_2: string;
    status: string;

    constructor(userObj) {
        this.user_1 = userObj.user_1;
        this.user_2 = userObj.user_2;
        this.status = userObj.status;

    }
}