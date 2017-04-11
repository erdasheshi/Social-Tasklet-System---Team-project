export class TransactionList {

  id: string;
  consumer: string;
  provider: string;
  computation: string;
  coins: number;
  status: string;
  taskletid: number;

  constructor(userObj) {
      this.id = userObj._id;
      this.consumer = userObj.consumer;
      this.provider = userObj.provider;
      this.computation = userObj.computation;
      this.coins = userObj.coins;
      this.status = userObj.status;
      this.taskletid = userObj.taskletid;
  }

}
