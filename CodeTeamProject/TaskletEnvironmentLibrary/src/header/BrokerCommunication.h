/*
 * BrokerCommunication.h
 *
 *  Created on: 09.09.2014
 *      Author: Janick
 */

#ifndef BROKERCOMMUNICATION_H_
#define BROKERCOMMUNICATION_H_

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <time.h>

#include "SocketInterface.h"
#include "TaskletProtocol.h"
#include "BrokerList.h"


void sendBHeartbeatMessage(SOCKET connectedIPSocket);
messageType receiveBHeartbeatMessage(SOCKET connectedSocket);

u_long sendBIPMessage(SOCKET connectedSocket, u_long remoteIP);
u_long receiveBIPMessage(SOCKET connectedSocket);

bool sendBRequestMessage(SOCKET connectedSocket, requestDetails details);
requestDetails receiveBRequestMessage(SOCKET connectedSocket);

bool sendBResponseMessage(SOCKET connectedSocket, resourceList* selectedResources);
resourceList* receiveBResponseMessage(SOCKET connectedSocket);

bool sendBenchmarkMessage(float benchmark);
float receiveBenchmarkMessage(SOCKET connectedSocket);

void sendVMUpMessage();
u_long receiveVMUpMessage(SOCKET connectedSocket);

void sendVMDownMessage();
u_long receiveVMDownMessage(SOCKET connectedSocket);


void requestOwnIP();
resourceList* requestBroker(requestDetails details);



#endif /* BROKERCOMMUNICATION_H_ */
