export class Device {

  username: string;
  name: string;
  price: number;
  device: string;
  status: string;
  id: string;
  download: string;

  constructor(userObj) {
    this.username = userObj.username;
    this.name = userObj.name;
    this.price = userObj.price;
    this.device = userObj.device;
    this.status = userObj.status;
    this.id = userObj._id;
    this.download = userObj.download;
  }

}
