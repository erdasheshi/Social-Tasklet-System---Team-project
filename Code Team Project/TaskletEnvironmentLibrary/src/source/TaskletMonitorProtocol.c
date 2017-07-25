/*
 * TaskletMonitorProtocol.c
 *
 *  Created on: 11.11.2014
 *      Author: Janick
 */

#include "../header/TaskletMonitorProtocol.h"
static const bool monitorFlag = false;
void setupAddress() {
	if (monitorFlag) {
		taskletMonitorAddr.sin_family = AF_INET;
		taskletMonitorAddr.sin_port = htons(55555);
		taskletMonitorAddr.sin_addr.s_addr = inet_addr(monitorIP);
	}

}

void sendInstanceStartMessage(u_long ip) {
	if (monitorFlag) {
		monitorMessage message;

		message.header = createProtocolHeader(instanceStartMessage);
		message.ip = ip;

		sendto(tmSendSocket, (char*) &message, 32, 0,
				(SOCKADDR*) &taskletMonitorAddr, sizeof(SOCKADDR_IN));
	}

}

void sendInstanceStopMessage(u_long ip) {
	if (monitorFlag) {
		monitorMessage message;

		message.header = createProtocolHeader(instanceStopMessage);
		message.ip = ip;

		sendto(tmSendSocket, (char*) &message, 32, 0,
				(SOCKADDR*) &taskletMonitorAddr, sizeof(SOCKADDR_IN));
	}
}

void sendVMStartMessage(u_long ip, int port) {
	if (monitorFlag) {
		monitorMessage message;

		message.header = createProtocolHeader(vmStartMessage);
		message.ip = ip;
		message.port = port;

		sendto(tmSendSocket, (char*) &message, 32, 0,
				(SOCKADDR*) &taskletMonitorAddr, sizeof(SOCKADDR_IN));
	}
}

void sendVMStopMessage(u_long ip, int port) {
	if (monitorFlag) {
		monitorMessage message;

		message.header = createProtocolHeader(vmStopMessage);
		message.ip = ip;
		message.port = port;

		sendto(tmSendSocket, (char*) &message, 32, 0,
				(SOCKADDR*) &taskletMonitorAddr, sizeof(SOCKADDR_IN));
	}

}

void sendTaskletStartMessage(u_long ip, int port, u_long host, int serial,
		int subserial) {
	if (monitorFlag) {
		monitorMessage message;

		message.header = createProtocolHeader(taskletStartMessage);
		message.ip = ip;
		message.port = port;
		message.host = host;
		message.serial = serial;
		message.subserial = subserial;

		sendto(tmSendSocket, (char*) &message, 32, 0,
				(SOCKADDR*) &taskletMonitorAddr, sizeof(SOCKADDR_IN));
	}
}

void sendTaskletStopMessage(u_long ip, int port, u_long host, int serial,
		int subserial) {
	if (monitorFlag) {
		monitorMessage message;

		message.header = createProtocolHeader(taskletStopMessage);
		message.ip = ip;
		message.port = port;
		message.host = host;
		message.serial = serial;
		message.subserial = subserial;

		sendto(tmSendSocket, (char*) &message, 32, 0,
				(SOCKADDR*) &taskletMonitorAddr, sizeof(SOCKADDR_IN));
	}
}
