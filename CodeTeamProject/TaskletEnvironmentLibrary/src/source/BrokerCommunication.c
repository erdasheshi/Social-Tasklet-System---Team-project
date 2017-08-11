/*
 * BrokerCommunication.c
 *
 *  Created on: 09.09.2014
 *      Author: Janick
 */

#include "../header/BrokerCommunication.h"

void requestOwnIP() {

	SOCKET connectedIPSocket = setupSendSocket(inet_addr(brokerIP), 34123);

	sendBHeartbeatMessage(connectedIPSocket);

	myIP = receiveBIPMessage(connectedIPSocket);

	pi_closesocket(connectedIPSocket);
}

resourceList* requestBroker(requestDetails details) {
	SOCKET connectedSocket = setupSendSocket(inet_addr(brokerIP), traderPort);
	if (connectedSocket < 1) {
		puts("Error in requestBroker");
		fflush(stdout);
		return NULL;
	}

	if (!sendBRequestMessage(connectedSocket, details)) {
		return NULL;
	}
//	while (!sendBRequestMessage(connectedSocket, details)) {
//		pi_sleep(100);
//		if (retries > 5)
//			return NULL;
//		retries++;
//	}

	resourceList* recResources = receiveBResponseMessage(connectedSocket);

	pi_closesocket(connectedSocket);

	return recResources;

}

void sendBHeartbeatMessage(SOCKET connectedIPSocket) {

	protocolHeader pHeader;
	pHeader.magic = MAGIC;
	pHeader.version = protocolVersion;
	pHeader.messageType = bHeartbeatMessage;

	tcpsend(connectedIPSocket, (char*) &pHeader, sizeof(protocolHeader), 0);

	tcpsend(connectedIPSocket, (char*) &deviceID, sizeof(int), 0);
}

messageType receiveBHeartbeatMessage(SOCKET connectedSocket) {

	messageType messageType = receiveProtocolHeader(connectedSocket);

	if (messageType < 0)
		return -1;

	if (messageType != bHeartbeatMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				bHeartbeatMessage);
	}

	return messageType;

}

u_long sendBIPMessage(SOCKET connectedSocket, u_long remoteIP) {

	protocolHeader pHeader = createProtocolHeader(bIPMessage);

	int bytesSent = tcpsend(connectedSocket, (char*) &pHeader,
			sizeof(protocolHeader), 0);
	if (bytesSent < 1) {
		return 0;
	}

	u_long remote_IP = getRemoteIPAddress(connectedSocket);

	bytesSent = tcpsend(connectedSocket, (char*) &remote_IP, sizeof(u_long), 0);
	if (bytesSent < 1) {
		return 0;
	}

	return remoteIP;

}

u_long receiveBIPMessage(SOCKET connectedSocket) {

	messageType messageType = receiveProtocolHeader(connectedSocket);

	if (messageType < 0)
		return -1;

	if (messageType != bIPMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				bIPMessage);
	}

	struct in_addr inad;
	int len = sizeof(inad);

	tcpreceive(connectedSocket, (char*) &inad, len, 0);

	return pi_inet_iaton(inad);
}

bool sendBRequestMessage(SOCKET connectedSocket, requestDetails details) {

	protocolHeader pHeader = createProtocolHeader(bRequestMessage);

	int bytesSent = tcpsend(connectedSocket, (char*) &pHeader,
			sizeof(protocolHeader), 0);
	if (bytesSent < 1) {
		return false;
	}

	bytesSent = tcpsend(connectedSocket, (char*) &details,
			sizeof(requestDetails), 0);
	if (bytesSent < 1) {
		return false;
	}

	return true;

}

requestDetails receiveBRequestMessage(SOCKET connectedSocket) {

	requestDetails details;


	tcpreceive(connectedSocket, (char*) &details, sizeof(requestDetails), 0);


	return details;
}

bool sendBResponseMessage(SOCKET connectedSocket,
		resourceList* selectedResources) {

	protocolHeader pHeader = createProtocolHeader(bResponseMessage);

	int bytesSent = tcpsend(connectedSocket, (char*) &pHeader,
			sizeof(protocolHeader), 0);
	if (bytesSent < 1) {
		return false;
	}

	if (selectedResources == NULL) {
		int z = 0;
		bytesSent = tcpsend(connectedSocket, (char*) &z, sizeof(int), 0);
		return true;
	}

	bytesSent = tcpsend(connectedSocket, (char*) &selectedResources->length,
			sizeof(int), 0);

	bytesSent = tcpsend(connectedSocket, (char*) selectedResources->resources,
			selectedResources->length * sizeof(brokerResource), 0);
	if (bytesSent < 1) {
		return false;
	}

	return true;
}

resourceList* receiveBResponseMessage(SOCKET connectedSocket) {

	messageType messageType = receiveProtocolHeader(connectedSocket);

	if (messageType < 0)
		puts("ERROR while receiving bResponseMessage");

	if (messageType != bResponseMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				bResponseMessage);
	}

	resourceList *recResources = malloc(sizeof(resourceList));

	tcpreceive(connectedSocket, (char*) &recResources->length, sizeof(int), 0);

	if (recResources->length == 0) {
		free(recResources);
		return NULL;
	}

	recResources->resources = malloc(
			recResources->length * sizeof(brokerResource));

	tcpreceive(connectedSocket, (char*) recResources->resources,
			recResources->length * sizeof(brokerResource), 0);

	return recResources;
}

void sendVMUpMessage() {
	SOCKET connectedSocket;
	do {
		connectedSocket = setupSendSocket(inet_addr(brokerIP),
		brokerTvmManagementPort);
	} while (connectedSocket < 1);

	protocolHeader pHeader = createProtocolHeader(vmUpMessage);

	tcpsend(connectedSocket, (char*) &pHeader, sizeof(protocolHeader), 0);
	tcpsend(connectedSocket, (char*) &myIP, sizeof(u_long), 0);
//	printf("my ip was %s\n", u_longToCharIP(myIP));
//	fflush(stdout);
	pi_closesocket(connectedSocket);

}

u_long receiveVMUpMessage(SOCKET connectedSocket) {
	u_long host;

	tcpreceive(connectedSocket, (char*) &host, sizeof(u_long), 0);

	return host;

}

void sendVMDownMessage() {

	SOCKET connectedSocket;
	do {
		connectedSocket = setupSendSocket(inet_addr(brokerIP),
		brokerTvmManagementPort);
	} while (connectedSocket < 1);

	protocolHeader pHeader = createProtocolHeader(vmDownMessage);

	tcpsend(connectedSocket, (char*) &pHeader, sizeof(protocolHeader), 0);
	tcpsend(connectedSocket, (char*) &myIP, sizeof(u_long), 0);

	pi_closesocket(connectedSocket);
}

u_long receiveVMDownMessage(SOCKET connectedSocket) {
	u_long host;

	tcpreceive(connectedSocket, (char*) &host, sizeof(u_long), 0);

	return host;

}

bool sendBenchmarkMessage(float benchmark) {

	SOCKET connectedSocket;
	connectedSocket = setupSendSocket(inet_addr(brokerIP), 34123);

	protocolHeader pHeader = createProtocolHeader(benchmarkMessage);

	int bytesSent = tcpsend(connectedSocket, (char*) &pHeader,
			sizeof(protocolHeader), 0);
	if (bytesSent < 1) {
		return false;
	}

	bytesSent = tcpsend(connectedSocket, (char*) &benchmark, sizeof(float), 0);
	if (bytesSent < 1) {
		return false;
	}

	return true;
}

float receiveBenchmarkMessage(SOCKET connectedSocket) {

	float benchmark = 0;

	tcpreceive(connectedSocket, (char*) &benchmark, sizeof(float), 0);

	return benchmark;
}

