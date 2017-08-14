export class Friendship {
  id: number;
  user1: string;
  user2: string;
  status: string;
  name: string;

  constructor(username: string, userObj) {
    this.id = userObj._id;
    this.name = username === userObj.user_1 ? userObj.user_2 : userObj.user_1;
    this.user1 = userObj.user_1;
    this.user2 = userObj.user_2;
    this.status = userObj.status;
    return this;
  }
}
