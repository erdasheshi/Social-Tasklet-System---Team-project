
var constants = require('./../../constants');

function readProtocolHeader(header){

	console.log(header);
	var protocolHeader = {"Magic": header.readInt32LE(0), "Version": header.readInt32LE(4), "MessageType": header.readInt32LE(8), "DeviceID": header.readInt32LE(12)};

	if(protocolHeader.Magic == constants.Magic){
		return protocolHeader;
	}
	else
		return -1;
};

function writeProtocolHeader(header){
	
	var buf1 = Buffer.alloc(4);
	var buf2 = Buffer.alloc(4);
	var buf3 = Buffer.alloc(4);
    var buf4 = Buffer.alloc(4);
	
	buf1.writeInt32LE(constants.Magic,0);
	buf2.writeInt32LE(constants.Version,0);
	buf3.writeInt32LE(header.MessageType,0);
    buf4.writeInt32LE(header.DeviceID,0);

	var totalLength = buf1.length + buf2.length + buf3.length+ buf4.length;
	var buffer = Buffer.concat([buf1,buf2,buf3,buf4],totalLength);
	
	return buffer;
};

module.exports = {
	readProtocolHeader : function(header){
		return readProtocolHeader(header);
	},
	writeProtocolHeader : function(header){
		return writeProtocolHeader(header);
	}
};