/*
 * TaskletMonitorProtocol.h
 *
 *  Created on: 11.11.2014
 *      Author: Janick
 */

#ifndef TASKLETMONITORPROTOCOL_H_
#define TASKLETMONITORPROTOCOL_H_

#include "TaskletProtocol.h"
#include "SocketInterface.h"

SOCKET tmSendSocket;
SOCKADDR_IN taskletMonitorAddr;

void setupAddress();

void sendInstanceStartMessage(u_long ip);
void sendInstanceStopMessage(u_long ip);
void sendVMStartMessage(u_long ip, int port);
void sendVMStopMessage(u_long ip, int port);
void sendTaskletStartMessage(u_long ip, int port, u_long host, int serial,
		int subserial);
void sendTaskletStopMessage(u_long ip, int port, u_long host, int serial,
		int subserial);

#endif /* TASKLETMONITORPROTOCOL_H_ */
