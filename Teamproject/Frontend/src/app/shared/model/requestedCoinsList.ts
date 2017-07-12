export class RequestedCoinsList {

  id: string;
  requestid: number;
  username: string;
  requestedCoins: string;
  approval: number;

  constructor(userObj) {
      this.id = userObj._id;
      this.requestid = userObj.requestid;
      this.username = userObj.username;
      this.requestedCoins = userObj.requestedCoins;
      this.approval = userObj.approval;
  }

}
