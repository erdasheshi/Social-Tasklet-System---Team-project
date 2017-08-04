/*
 * TVMMaintenanceProtocol.c
 *
 *  Created on: 07.11.2014
 *      Author: Dominik
 */

#include "../header/TVMMaintanenceProtocol.h"

long bytes;
/**
 * Receives a TVM Info Message
 *
 * The header of the message must be received before.
 *
 * Use "ReceiveProtocolHeader" before and pass received message type as parameter.
 */
tvmStatus* receiveTVMStatusMessage(SOCKET socket, messageType mt) {

	tvmStatus* tvmStat = malloc(sizeof(tvmStatus));

	if (mt < 0)
		return NULL;

	if (mt != mTvmStatusMessage) {
		printf("Wrong message type. %d instead of %d.", mt, mTvmStatusMessage);
	}

	bytes = tcpreceive(socket, (char*) &tvmStat, sizeof(tvmStat), 0);
	if (checkError(bytes, "Connection error (Receive).")) {
		return NULL;
	}

	return tvmStat;
}

/**
 * Returns the Port of the TVM that initiates the join
 *
 * The header of the message must be received before.
 *
 * Use "ReceiveProtocolHeader" before and pass received message type as parameter.
 */
tvm* receiveTVMJoinMessage(SOCKET socket, messageType mt) {

	tvm* tvmInstance = malloc(sizeof(tvm));

	if (mt < 0)
		return NULL;

	if (mt != mTvmJoinMessage) {
		printf("Wrong message type. %d instead of %d.", mt, mTvmJoinMessage);
	}

	bytes = tcpreceive(socket, (char*) &tvmInstance->portId, sizeof(int), 0);
	if (checkError(bytes, "Connection error (Receive).")) {
		return NULL;
	}

	tvmInstance->next = NULL;
	tvmInstance->instructionSocket = 0;

	return tvmInstance;
}

/**
 * Sends a Status Message
 */
bool sendTVMStatusMessage(SOCKET socket, tvmStatus *obj) {
	protocolHeader pHeader = createProtocolHeader(mTvmStatusMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	bytes = tcpsend(socket, (char*) obj, sizeof(tvmStatus), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMJoinMessage(SOCKET socket, int p_portId) {
	protocolHeader pHeader = createProtocolHeader(mTvmJoinMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	bytes = tcpsend(socket, (char*) &p_portId, sizeof(int), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMStatusRequestMessage(SOCKET socket) {
	protocolHeader pHeader = createProtocolHeader(mTvmRequestStatusMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMTerminationMessage(SOCKET socket) {
	protocolHeader pHeader = createProtocolHeader(mTvmTerminationMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMCancelMessage(SOCKET socket) {
	protocolHeader pHeader = createProtocolHeader(mTvmCancelMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMSnapshotRequestAndStopMessage(SOCKET socket) {
	protocolHeader pHeader = createProtocolHeader(
			mTvmSnapshotRequestAndStopMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMContinueMessage(SOCKET socket) {
	protocolHeader pHeader = createProtocolHeader(mTvmContinueMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

bool sendTVMPauseMessage(SOCKET socket) {
	protocolHeader pHeader = createProtocolHeader(mTvmPauseMessage);

	bytes = tcpsend(socket, (char*) &pHeader, sizeof(protocolHeader), 0);
	if (checkError(bytes, "Connection error (Send)."))
		return false;

	return true;
}

tvmStatus* createTVMStatus(int p_port) { //TODO add all elements?
	tvmStatus* tvmStat = malloc(sizeof(tvmStatus));

	tvmStat->id = p_port;
	return tvmStat;
}
