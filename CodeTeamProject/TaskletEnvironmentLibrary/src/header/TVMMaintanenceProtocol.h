/*
 * TVMMaintanenceProtocol.h
 *
 *  Created on: 07.11.2014
 *      Author: Dominik
 */

#include "TaskletProtocol.h"

#ifndef TVMMAINTANENCEPROTOCOL_H_
#define TVMMAINTANENCEPROTOCOL_H_

typedef struct tvmStatus {
	int id;
	bool busy;
} tvmStatus;

typedef struct tvm {
	int portId;
	SOCKET instructionSocket;
	SOCKET managementSocket;
	tvmStatus tvmStatus;
	struct tvm *next;
} tvm;

tvmStatus* receiveTVMStatusMessage(SOCKET, messageType);
tvm* receiveTVMJoinMessage(SOCKET, messageType);

bool sendTVMStatusMessage(SOCKET, tvmStatus*);
bool sendTVMJoinMessage(SOCKET, int);
bool sendTVMStatusRequestMessage(SOCKET);
bool sendTVMTerminationMessage(SOCKET);

bool sendTVMCancelMessage(SOCKET socket);
bool sendTVMSnapshotRequestAndStopMessage(SOCKET socket);
bool sendTVMContinueMessage(SOCKET socket);
bool sendTVMPauseMessage(SOCKET socket);

tvmStatus* createTVMStatus(int);

#endif /* TVMMAINTANENCEPROTOCOL_H_ */
