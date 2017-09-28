
var constants = require('./../../constants');
// read received ProtocolHeader from tasklet middleware
function readProtocolHeader(header, callback){

	var magic = header.readInt32LE(0);
	var version = header.readInt32LE(4);
	var messageType = header.readInt32LE(8);
	
	if(magic == constants.Magic){
        if(callback) callback(null, messageType);
	}
	
	else
    if(callback) callback(-1, null);
};
// write ProtocolHeader for tasklet middleware
function writeProtocolHeader(messageType, callback){
	
	var buf1 = Buffer.alloc(4);
	var buf2 = Buffer.alloc(4);
	var buf3 = Buffer.alloc(4);
	
	buf1.writeInt32LE(constants.Magic,0);
	buf2.writeInt32LE(constants.Version,0);
	buf3.writeInt32LE(messageType,0);
	
	var totalLength = buf1.length + buf2.length + buf3.length;
	var buffer = Buffer.concat([buf1,buf2,buf3],totalLength);
  
	if(callback) callback(null,buffer);
};

module.exports = {
	readProtocolHeader : function(header, callback){
		return readProtocolHeader(header, callback);
	},
	writeProtocolHeader : function(messageType, callback){
		return writeProtocolHeader(messageType, callback);
	}
};