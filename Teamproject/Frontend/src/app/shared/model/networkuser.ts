export class NetworkUser { //used for get

    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    price: number;
    balance: number;

    constructor(userObj) {
        this.id = userObj._id;
        this.username = userObj.username;
        this.firstname = userObj.firstname;
        this.lastname = userObj.lastname;
        this.email = userObj.email;
        this.price = userObj.price;
        this.balance = userObj.balance; //total coins
    }
}
