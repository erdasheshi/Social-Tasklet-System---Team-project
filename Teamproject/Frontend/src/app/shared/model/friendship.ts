export class Friendship {

  status: string;
  name: string;
  user: string;

  constructor(userObj) {

    this.name = userObj.name;
    this.status = userObj.status;
    this.user = userObj.user;

    return this;
  }
}
