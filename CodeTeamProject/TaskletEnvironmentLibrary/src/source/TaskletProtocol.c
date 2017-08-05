/*
 * TaskletProtocol.c
 *
 *  Created on: 31.10.2014
 *      Author: Janick
 */
#include "../header/TaskletProtocol.h"

long bytesReceived;
long bytesSent;

tasklet* initTasklet() {
	tasklet* newTasklet = malloc(sizeof(tasklet));
	newTasklet->header.heapLevels = 0;
	newTasklet->header.intermediateResultsLength = 0;
	newTasklet->header.stacksize = 0;

	newTasklet->taskletcode = NULL;
	newTasklet->qocs = NULL;
	newTasklet->results = NULL;
	newTasklet->constPool = NULL;
	newTasklet->qocParameter = NULL;
	newTasklet->tSnapshot = NULL;

	newTasklet->header.id.evaluationValues.finalComp = 0;
	newTasklet->header.id.evaluationValues.heartBeatCounter = 0;
	newTasklet->header.id.evaluationValues.intermediateComp = 0;
	newTasklet->header.id.evaluationValues.retryCounter = 0;
	newTasklet->header.id.evaluationValues.hotRetryCounter = 0;

	return newTasklet;
}

qocDetails* initQocDetails() {
	qocDetails* newdetails = malloc(sizeof(qocDetails));

	newdetails->qocLocal = NULL;
	newdetails->qocRemote = NULL;
	newdetails->qocReliable = NULL;
	newdetails->qocSpeed = NULL;
	newdetails->qocProxy = NULL;
	newdetails->qocRedundancy = NULL;
	newdetails->qocReplication = NULL;
	newdetails->qocMigration = NULL;

	return newdetails;
}

singleQoc* initSingleQoC() {
	singleQoc* newqoc = malloc(sizeof(singleQoc));
	newqoc->parameters = NULL;
	return newqoc;
}

int calculateHeapSize(int levels, int* levelsizes, char*** space) {
	int i, j, size = 0;

	for (i = 0; i < levels; ++i) {
		for (j = 0; j < levelsizes[i]; ++j) {
			size += readElementLengthFromSnapshot(i, j, space) + 5;
		}
	}

	return size;
}

taskletSnapshot* initTaskletSnapshot() {
	taskletSnapshot* newTss = malloc(sizeof(taskletSnapshot));

	newTss->stack = NULL;
	newTss->heapSpaceEntries = NULL;
	newTss->heapSpace = NULL;
	newTss->intermediateResults = NULL;

	newTss->instantiated = false;
	newTss->numofresults = 0;

	newTss->countInstr = 0;
	newTss->fArg1 = 0.0;
	newTss->fArg2 = 0.0;
	newTss->prgCount = 0;
	newTss->baseAdr = 0;
	newTss->top = 0;
	newTss->tmp = 0;
	newTss->intervalSnapshot = true;

	return newTss;
}

void readConfigFile() {

	FILE *fp;
	char buff[255];

	fp = fopen("config.txt", "r");

	if (fp != NULL) {

		fscanf(fp, "%s", buff);
		fscanf(fp, "%s", buff);

		strcpy(brokerIP, buff);
		printf("BrokerIP %s\n", brokerIP);
		fflush(stdout);

		fscanf(fp, "%s", buff);
		fscanf(fp, "%s", buff);

		strcpy(monitorIP, buff);
		printf("MonitorIP %s\n", monitorIP);
		fflush(stdout);

		fscanf(fp, "%s", buff);
		fscanf(fp, "%d", &initialTVMs);

		if (initialTVMs < 0) {
			printf("initialTVMs < 0\n");
			fflush(stdout);
			initialTVMs = pi_getnumberofcores();
		}
		printf("Initial TVMs %d\n", initialTVMs);
		fflush(stdout);

		fscanf(fp, "%s", buff);
		fscanf(fp, "%d", &timeout);

		printf("Timeout %d\n", timeout);
		fflush(stdout);

		fscanf(fp, "%s", buff);
		fscanf(fp, "%d", &deviceID);

		printf("deviceID %d\n", deviceID);
		fflush(stdout);

		fclose(fp);
	} else {
		strcpy(brokerIP, defaultBrokerIP);
		strcpy(monitorIP, defaultMonitorIP);
		initialTVMs = pi_getnumberofcores();

		printf("Cannot find config file.\n");
		fflush(stdout);

	}

}

void sendTHeartBeatMessage(id taskletID) {

	SOCKET sendSocket = setupUDPSendSocket();

	taskletID.executingIP = myIP;

	idMessage message;

	message.header = createProtocolHeader(tHeartBeatMessage);
	message.taskletID = taskletID;

	SOCKADDR_IN addr;

	memset(&addr, 0, sizeof(SOCKADDR_IN));
	addr.sin_family = AF_INET;
	addr.sin_port = htons(22322);
	addr.sin_addr.s_addr = taskletID.ip;

	sendto(sendSocket, (char*) &message, sizeof(idMessage), 0,
			(SOCKADDR*) &addr, sizeof(SOCKADDR_IN));

}

id receiveTHeartBeatMessage(SOCKET heartBeatSocket) {

	idMessage message;

	SOCKADDR_IN from;
	int fromLength = sizeof(from);
	int bytes = recvfrom(heartBeatSocket, (char*) &message, sizeof(idMessage),
			0, (SOCKADDR*) &from, &fromLength);

	if (bytes < 1) {
		puts("ERROR in receiveTHeartBeatMessage()");
		fflush(stdout);
	}

	return message.taskletID;

}

tasklet* receiveIRequestMessage(SOCKET receivingSocket, messageType messageType) {

	if (messageType < 0)
		return NULL;

	if (!(messageType == iRequestMessage || messageType == iResendRequestMessage)) {
		printf("Wrong message type. %d instead of %d.", messageType,
				iRequestMessage);
	}

	iRqHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(iRqHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveIRequestMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

	int codeLengthToReceive;
	if (messageType == iRequestMessage) {
		codeLengthToReceive = header.lengthOfCode;
	} else {
		codeLengthToReceive = 0;
	}
	u_long zero = inet_addr("0.0.0.0");
	recTasklet->header = createTaskletHeader(zero, header.port, header.serial,
			header.proxySerial, header.resultHandle, 0, 0, header.sessionID,
			header.trialID, codeLengthToReceive, header.lengthOfQocs,
			header.lengthOfParameters, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	receiveTaskletPayload(receivingSocket, recTasklet);

	return recTasklet;

}

tasklet* receiveIByteCodeRequestMessage(SOCKET receivingSocket,
		messageType messageType) {

	if (messageType < 0)
		return NULL;

	if (messageType != iByteCodeRequestMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				iByteCodeRequestMessage);
	}

	iRqHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(iRqHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveIByteCodeRequestMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

	u_long zero = inet_addr("0.0.0.0");
	recTasklet->header = createTaskletHeader(zero, header.port, header.serial,
			header.proxySerial, header.resultHandle, 0, 0, header.sessionID,
			header.trialID, header.lengthOfCode, header.lengthOfQocs,
			header.lengthOfParameters, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	receiveTaskletPayload(receivingSocket, recTasklet);

	return recTasklet;

}

tasklet* receiveICodeDebugtMessage(SOCKET receivingSocket,
		messageType messageType) {

	if (messageType < 0)
		return NULL;

	if (messageType != iCodeDebugMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				iCodeDebugMessage);
	}

	iRqHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(iRqHeader), 0);
	if (checkError(bytesReceived, "Connection error (iCodeDebugMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

	u_long zero = inet_addr("0.0.0.0");
	recTasklet->header = createTaskletHeader(zero, header.port, header.serial,
			header.proxySerial, header.resultHandle, 0, 0, header.sessionID,
			header.trialID, header.lengthOfCode, header.lengthOfQocs,
			header.lengthOfParameters, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	receiveTaskletPayload(receivingSocket, recTasklet);

	return recTasklet;

}

tasklet* receiveIResultMessage(SOCKET receivingSocket) {

	messageType messageType = receiveProtocolHeader(receivingSocket);

	if (messageType < 0)
		return NULL;

	if (messageType != iResultMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				iResultMessage);
	}

	iResHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(iResHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveIResultMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

//	u_long zero = inet_addr("0.0.0.0"); //TODO: delete this
	recTasklet->header = createTaskletHeader(header.ip, header.port,
			header.serial, header.proxySerial, header.resultHandle, 0,
			header.replicationID, header.sessionID, header.trialID, 0, 0,
			header.resultLength, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	receiveTaskletPayload(receivingSocket, recTasklet);

	return recTasklet;

}

guid* receiveGUIDMessage(SOCKET receivingSocket) {

	messageType messageType = receiveProtocolHeader(receivingSocket);

	if (messageType < 0)
		return NULL;

	if (messageType != guidMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				guidMessage);
	}

	guid* receivedGUID = receiveGUID(receivingSocket);

	return receivedGUID;

}

tasklet* receiveTExecuteMessage(SOCKET receivingSocket) {

	messageType messageType = receiveProtocolHeader(receivingSocket);

	if (messageType < 0)
		return NULL;

	if (messageType != tExecuteMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				tExecuteMessage);
	}

	tExHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(tExHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveTExecuteMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

	recTasklet->header = createTaskletHeader(header.id.ip, header.id.port,
			header.id.serial, header.id.proxySerial, header.id.resultHandle,
			header.id.subserial, header.id.replicationID, header.id.sessionID,
			header.id.trialID, header.lengthOfCode, header.lengthOfQocs, 0,
			header.lengthOfConstPool, header.stacksize, header.heapLevels,
			header.intermediateResultsLength,
			header.id.evaluationValues.intermediateComp,
			header.id.evaluationValues.finalComp,
			header.id.evaluationValues.retryCounter,
			header.id.evaluationValues.heartBeatCounter,
			header.id.evaluationValues.hotRetryCounter);

	receiveTaskletPayload(receivingSocket, recTasklet);
	receiveTaskletSnapshotPayload(receivingSocket, recTasklet);
	return recTasklet;
}

tasklet* receiveTResultMessage(SOCKET receivingSocket, int *tvmId) {

	messageType messageType = receiveProtocolHeader(receivingSocket);

	if (messageType < 0)
		return NULL;

	if (messageType != tResultMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				tResultMessage);
	}

	tResHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(tResHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveTResultMessage).")) {
		return NULL;
	}
	*tvmId = header.tvmId;
	tasklet* recTasklet = initTasklet();

	recTasklet->header = createTaskletHeader(header.id.ip, header.id.port,
			header.id.serial, header.id.proxySerial, header.id.resultHandle,
			header.id.subserial, header.id.replicationID, header.id.sessionID,
			header.id.trialID, 0, 0, header.resultsLength, 0, 0, 0, 0,
			header.id.evaluationValues.intermediateComp,
			header.id.evaluationValues.finalComp,
			header.id.evaluationValues.retryCounter,
			header.id.evaluationValues.heartBeatCounter,
			header.id.evaluationValues.hotRetryCounter);
	recTasklet->header.id.executingIP = getRemoteIPAddress(receivingSocket);
	if (recTasklet->header.id.executingIP == inet_addr("127.0.0.1")) {
		recTasklet->header.id.executingIP = myIP;
	}

	receiveTaskletPayload(receivingSocket, recTasklet);

//	int i;
//	for (i = 0; i < header.resultsLength; i++) {
//		printf("receivetRes: %-4d: \t %-9d\n", i, recTasklet->results[i]);
//		fflush(stdout);
//	}

	return recTasklet;

}

tasklet* receiveTForwardMessage(SOCKET receivingSocket) {

	messageType messageType = receiveProtocolHeader(receivingSocket);

	if (messageType < 0)
		return NULL;

	if (messageType != tForwardMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				tForwardMessage);
		return NULL;
	}

	long bytesReceived = 0;

	tFwHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(tFwHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveTForwardMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

	recTasklet->header = createTaskletHeader(header.id.ip, header.id.port,
			header.id.serial, header.id.proxySerial, header.id.resultHandle,
			header.id.subserial, header.id.replicationID, header.id.sessionID,
			header.id.trialID, header.lengthOfCode, header.lengthOfQocs, 0,
			header.lengthOfConstPool, header.stacksize, header.heapLevels,
			header.intermediateResultsLength,
			header.id.evaluationValues.intermediateComp,
			header.id.evaluationValues.finalComp,
			header.id.evaluationValues.retryCounter,
			header.id.evaluationValues.heartBeatCounter,
			header.id.evaluationValues.hotRetryCounter);

	receiveTaskletPayload(receivingSocket, recTasklet);
	receiveTaskletSnapshotPayload(receivingSocket, recTasklet);
	return recTasklet;

}

tasklet* receiveTSnapshotMessage(SOCKET receivingSocket) {

	messageType messageType = receiveProtocolHeader(receivingSocket);

	if (messageType < 0)
		return NULL;

	if (messageType != tSnapshotMessage) {
		printf("Wrong message type. %d instead of %d.", messageType,
				tSnapshotMessage);
		return NULL;
	}

	long bytesReceived = 0;

	tSnHeader header;
	bytesReceived = tcpreceive(receivingSocket, (char*) &header,
			sizeof(tSnHeader), 0);
	if (checkError(bytesReceived,
			"Connection error (receiveTSnapshotMessage).")) {
		return NULL;
	}

	tasklet* recTasklet = initTasklet();

	recTasklet->header = createTaskletHeader(header.id.ip, header.id.port,
			header.id.serial, header.id.proxySerial, header.id.resultHandle,
			header.id.subserial, header.id.replicationID, header.id.sessionID,
			header.id.trialID, 0, 0, 0, 0, header.stacksize, header.heapLevels,
			header.intermediateResultsLength,
			header.id.evaluationValues.intermediateComp,
			header.id.evaluationValues.finalComp,
			header.id.evaluationValues.retryCounter,
			header.id.evaluationValues.heartBeatCounter,
			header.id.evaluationValues.hotRetryCounter);

//	receiveTaskletPayload(receivingSocket, recTasklet);
	receiveTaskletSnapshotPayload(receivingSocket, recTasklet);

	return recTasklet;

}

void receiveTaskletPayload(SOCKET receivingSocket, tasklet* recTasklet) {

	long bytesReceived = 0;

	recTasklet->taskletcode = malloc(recTasklet->header.lengthOfCode);
	if (recTasklet->header.lengthOfCode > 0) {
		bytesReceived = tcpreceive(receivingSocket,
				(char*) recTasklet->taskletcode,
				recTasklet->header.lengthOfCode, 0);
		checkError(bytesReceived, "Connection error (receiveTaskletPayload).");
	}

	recTasklet->qocs = malloc(recTasklet->header.lengthOfQocs);
	if (recTasklet->header.lengthOfQocs > 0) {
		bytesReceived = tcpreceive(receivingSocket, (char*) recTasklet->qocs,
				recTasklet->header.lengthOfQocs, 0);
		checkError(bytesReceived, "Connection error (receiveTaskletPayload).");
	}

	recTasklet->results = malloc(recTasklet->header.lengthOfResults);
	if (recTasklet->header.lengthOfResults > 0) {
		bytesReceived = tcpreceive(receivingSocket, (char*) recTasklet->results,
				recTasklet->header.lengthOfResults, 0);
		checkError(bytesReceived, "Connection error (receiveTaskletPayload).");
	}

//	int i;
//	for (i = 0; i < recTasklet->header.lengthOfResults; i++) {
//		printf("receive Payload: [%-5d]: %-7d\n", i, recTasklet->results[i]);
//		fflush(stdout);
//	}

	recTasklet->constPool = malloc(recTasklet->header.lengthOfConstPool);
	if (recTasklet->header.lengthOfConstPool > 0) {
		bytesReceived = tcpreceive(receivingSocket,
				(char*) recTasklet->constPool,
				recTasklet->header.lengthOfConstPool, 0);
		checkError(bytesReceived, "Connection error (receiveTaskletPayload).");
	}

	resolveQocArray(recTasklet);

}

void receiveTaskletSnapshotPayload(SOCKET receivingSocket, tasklet* recTastklet) {
	long bytesReceived = 0;

	recTastklet->tSnapshot = initTaskletSnapshot();
	bytesReceived = tcpreceive(receivingSocket, (char*) recTastklet->tSnapshot,
			sizeof(taskletSnapshot), 0);
	checkError(bytesReceived, "Connection error (receiveTSnapshotMessage).");

	recTastklet->tSnapshot->stack = malloc(
			recTastklet->header.stacksize * sizeof(int));
	if (recTastklet->header.stacksize > 0) {
		bytesReceived = tcpreceive(receivingSocket,
				(char*) recTastklet->tSnapshot->stack,
				recTastklet->header.stacksize * sizeof(int), 0);
		checkError(bytesReceived,
				"Connection error (receiveTaskletSnapshotPayload).");
	}

	recTastklet->tSnapshot->heapSpaceEntries = malloc(
			recTastklet->header.heapLevels * sizeof(int));
	if (recTastklet->header.heapLevels > 0) {
		bytesReceived = tcpreceive(receivingSocket,
				(char*) recTastklet->tSnapshot->heapSpaceEntries,
				recTastklet->header.heapLevels * sizeof(int), 0);
		checkError(bytesReceived,
				"Connection error (receiveTaskletSnapshotPayload).");
	}

	recTastklet->tSnapshot->heapSpace = malloc(
			sizeof(char*) * recTastklet->header.heapLevels);

	if (recTastklet->header.heapLevels > 0) {
		int i, j, elementSize;
		char tmp[5];
		for (i = 0; i < recTastklet->header.heapLevels; ++i) {

			recTastklet->tSnapshot->heapSpace[i] = malloc(
					recTastklet->tSnapshot->heapSpaceEntries[i]
							* sizeof(char*));

			for (j = 0; j < recTastklet->tSnapshot->heapSpaceEntries[i]; ++j) {
				bytesReceived = tcpreceive(receivingSocket, tmp,
						sizeof(char) * 5, 0);
				memcpy(&elementSize, &tmp[1], 4);
				recTastklet->tSnapshot->heapSpace[i][j] = malloc(
						(elementSize + 5) * sizeof(char));
				memcpy(recTastklet->tSnapshot->heapSpace[i][j], tmp,
						sizeof(char) * 5);

				bytesReceived = tcpreceive(receivingSocket,
						(char*) &recTastklet->tSnapshot->heapSpace[i][j][5],
						elementSize * sizeof(char), 0);
				checkError(bytesReceived,
						"Connection error (receiveTaskletSnapshotPayload).");
			}
		}

	}

	recTastklet->tSnapshot->intermediateResults = malloc(
			recTastklet->header.intermediateResultsLength * sizeof(char));
	if (recTastklet->header.intermediateResultsLength > 0) {
		bytesReceived = tcpreceive(receivingSocket,
				(char*) recTastklet->tSnapshot->intermediateResults,
				recTastklet->header.intermediateResultsLength * sizeof(char),
				0);
		checkError(bytesReceived,
				"Connection error (receiveTaskletSnapshotPayload).");
	}

//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->numofresults, sizeof(int), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->countInstr, sizeof(int), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->prgCount, sizeof(int), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->baseAdr, sizeof(int), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->top, sizeof(int), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->tmp, sizeof(int), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->fArg1, sizeof(float), 0);
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//	bytesReceived = tcpreceive(receivingSocket,
//			(char*) &recTastklet->tSnapshot->fArg2, sizeof(float), 0);
//
//	checkError(bytesReceived,
//			"Connection error (receiveTaskletSnapshotPayload).");
//
//	recTastklet->tSnapshot->instantiated = true;
}

bool sendIResultMessage(SOCKET sendingSocket, tasklet* tasklet) {

	protocolHeader pHeader = createProtocolHeader(iResultMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	checkError(bytesSent, "Connection error (sendIResultMessage 0).");

	iResHeader header;
	header.ip = tasklet->header.id.ip;
	header.port = tasklet->header.id.port;
	header.serial = tasklet->header.id.serial;
	header.proxySerial = tasklet->header.id.proxySerial;
	header.resultHandle = tasklet->header.id.resultHandle;
	header.subserial = tasklet->header.id.subserial;
	header.replicationID = tasklet->header.id.replicationID;
	header.sessionID = tasklet->header.id.sessionID;
	header.trialID = tasklet->header.id.trialID;
	header.resultLength = tasklet->header.lengthOfResults;
	header.executingHost = tasklet->header.id.executingIP;

	header.intermediateComp =
			tasklet->header.id.evaluationValues.intermediateComp;
	header.finalComp = tasklet->header.id.evaluationValues.finalComp;
	header.retryCounter = tasklet->header.id.evaluationValues.retryCounter;
	header.heartBeatCounter =
			tasklet->header.id.evaluationValues.heartBeatCounter;
	header.hotRetryCounter =
			tasklet->header.id.evaluationValues.hotRetryCounter;
	printf("intermediate: %d, final: %d, retry: %d, hbc: %d, hotretry: %d\n",
			tasklet->header.id.evaluationValues.intermediateComp,
			tasklet->header.id.evaluationValues.finalComp,
			tasklet->header.id.evaluationValues.retryCounter,
			tasklet->header.id.evaluationValues.heartBeatCounter,
			tasklet->header.id.evaluationValues.hotRetryCounter);
	fflush(stdout);
	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(iResHeader), 0);
	checkError(bytesSent, "Connection error (sendIResultMessage 1).");

//
//	int i;
//	for (i = 0; i < header.resultLength; i++) {
//		printf("iRes: %-4d: \t %-9d\n", i, tasklet->results[i]);
//		fflush(stdout);
//	}

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->results,
			tasklet->header.lengthOfResults, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage 2).");

	return true;
}

bool sendIRequestMessage(SOCKET sendingSocket, tasklet* tasklet,
		messageType mType) {

	protocolHeader pHeader = createProtocolHeader(mType);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	checkError(bytesSent, "Connection error (sendIRequestMessage).");

	iRqHeader header;
	header.port = tasklet->header.id.port;
	header.serial = tasklet->header.id.serial;
	header.proxySerial = tasklet->header.id.proxySerial;
	header.lengthOfCode = tasklet->header.lengthOfCode;
	header.lengthOfQocs = tasklet->header.lengthOfQocs;
	header.lengthOfParameters = tasklet->header.lengthOfResults;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(iRqHeader), 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->taskletcode,
			header.lengthOfCode, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");
	bytesSent = tcpsend(sendingSocket, (char*) tasklet->qocs,
			header.lengthOfQocs, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");
	bytesSent = tcpsend(sendingSocket, (char*) tasklet->results,
			header.lengthOfParameters, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");

	return true;
}

bool sendIResendRequestMessage(SOCKET sendingSocket, tasklet* tasklet) {

	protocolHeader pHeader = createProtocolHeader(iResendRequestMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	checkError(bytesSent, "Connection error (sendIResendRequestMessage).");

	iRqHeader header;
	header.port = tasklet->header.id.port;
	header.serial = tasklet->header.id.serial;
	header.proxySerial = tasklet->header.id.proxySerial;
	header.lengthOfQocs = tasklet->header.lengthOfQocs;
	header.lengthOfParameters = tasklet->header.lengthOfResults;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(iRqHeader), 0);
	checkError(bytesSent, "Connection error (sendIResendRequestMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->qocs,
			header.lengthOfQocs, 0);
	checkError(bytesSent, "Connection error (sendIResendRequestMessage).");
	bytesSent = tcpsend(sendingSocket, (char*) tasklet->results,
			header.lengthOfParameters, 0);
	checkError(bytesSent, "Connection error (sendIResendRequestMessage).");

	return true;
}

bool sendIByteCodeRequestMessage(SOCKET sendingSocket, tasklet* tasklet) {

	protocolHeader pHeader = createProtocolHeader(iByteCodeRequestMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	checkError(bytesSent, "Connection error (sendIByteCodeRequestMessage).");

	iRqHeader header;
	header.port = tasklet->header.id.port;
	header.serial = tasklet->header.id.serial;
	header.proxySerial = tasklet->header.id.proxySerial;
	header.lengthOfCode = tasklet->header.lengthOfCode;
	header.lengthOfQocs = tasklet->header.lengthOfQocs; //TODO qocs are not necessary here?
	header.lengthOfParameters = tasklet->header.lengthOfResults;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(iRqHeader), 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->taskletcode,
			header.lengthOfCode, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");
	bytesSent = tcpsend(sendingSocket, (char*) tasklet->qocs,
			header.lengthOfQocs, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");
	bytesSent = tcpsend(sendingSocket, (char*) tasklet->results,
			header.lengthOfParameters, 0);
	checkError(bytesSent, "Connection error (sendIResultMessage).");

	return true;
}

bool sendTExecuteMessage(SOCKET sendingSocket, tasklet* tasklet) {
	protocolHeader pHeader = createProtocolHeader(tExecuteMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	checkError(bytesSent, "Connection error (sendTExecuteMessage).");

	tExHeader header;
	header.id = tasklet->header.id;
	header.lengthOfCode = tasklet->header.lengthOfCode;
	header.lengthOfQocs = tasklet->header.lengthOfQocs;
	header.lengthOfConstPool = tasklet->header.lengthOfConstPool;
	header.stacksize = tasklet->header.stacksize;
	header.heapLevels = tasklet->header.heapLevels;
	header.intermediateResultsLength =
			tasklet->header.intermediateResultsLength;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(tExHeader), 0);
	checkError(bytesSent, "Connection error (sendTExecuteMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->taskletcode,
			header.lengthOfCode, 0);
	checkError(bytesSent, "Connection error (sendTExecuteMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->qocs,
			header.lengthOfQocs, 0);
	checkError(bytesSent, "Connection error (sendTExecuteMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->constPool,
			header.lengthOfConstPool, 0);
	checkError(bytesSent, "Connection error (sendTExecuteMessage).");

	sendTaskletSnapshotPayload(sendingSocket, tasklet, header.stacksize,
			header.heapLevels, header.intermediateResultsLength);

	if (header.stacksize != 0) {
		printf("Hot/Cold Migration ----> Snapshot used for recovery.\n");
		fflush(stdout);
	}
	return true;
}

bool sendTResultMessage(SOCKET sendingSocket, tasklet* taskletToSend, int tvmId) {

	protocolHeader pHeader = createProtocolHeader(tResultMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	checkError(bytesSent, "Connection error (sendTResultMessage).");

	tResHeader header;
	header.id = taskletToSend->header.id;
	header.resultsLength = taskletToSend->header.lengthOfResults;
	header.tvmId = tvmId;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(tResHeader), 0);
	checkError(bytesSent, "Connection error (sendTResultMessage).");

	bytesSent = tcpsend(sendingSocket, (char*) taskletToSend->results,
			header.resultsLength, 0);
	checkError(bytesSent, "Connection error (sendTResultMessage).");

	return true;
}

bool sendTForwardMessage(u_long host, int port, tasklet* tasklet) {

	printf("Forward Tasklet %d/%d.\n", tasklet->header.id.serial,
			tasklet->header.id.subserial);
	fflush(stdout);

	SOCKET sendingSocket = setupSendSocket(host, port);
	if (sendingSocket < 1) {
		puts("Socket error in sendTForwardMessage. \n");
		fflush(stdout);
		return false;
	}

	protocolHeader pHeader = createProtocolHeader(tForwardMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	if (checkError(bytesSent, "Connection error (sendTForwardMessage1).")) {
		return false;
	}

	tFwHeader header;
	header.id = tasklet->header.id;
	header.lengthOfCode = tasklet->header.lengthOfCode;
	header.lengthOfQocs = tasklet->header.lengthOfQocs;
	header.lengthOfConstPool = tasklet->header.lengthOfConstPool;
	header.stacksize = tasklet->header.stacksize;
	header.heapLevels = tasklet->header.heapLevels;
	header.intermediateResultsLength =
			tasklet->header.intermediateResultsLength;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(tFwHeader), 0);
	if (checkError(bytesSent, "Connection error (sendTForwardMessage2).")) {
		return false;
	}

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->taskletcode,
			header.lengthOfCode, 0);
	if (checkError(bytesSent, "Connection error (sendTForwardMessage3).")) {
		return false;
	}

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->qocs,
			header.lengthOfQocs, 0);
	if (checkError(bytesSent, "Connection error (sendTForwardMessage4).")) {
		return false;
	}
	bytesSent = tcpsend(sendingSocket, (char*) tasklet->constPool,
			header.lengthOfConstPool, 0);
	if (checkError(bytesSent, "Connection error (sendTForwardMessage5).")) {
		return false;
	}

	sendTaskletSnapshotPayload(sendingSocket, tasklet, header.stacksize,
			header.heapLevels, header.intermediateResultsLength);

	pi_closesocket(sendingSocket);

	return true;

}

int readElementLengthFromSnapshot(int level, int base, char*** space) {
	int val;
	memcpy(&val, &space[level][base][1], 4);
	return val;
}

bool sendTSnapshotMessage(u_long host, int port, tasklet* tasklet) {

	printf("Snapshot sent to provider. %d/%d.\n", tasklet->header.id.serial,
			tasklet->header.id.subserial);
	fflush(stdout);

	SOCKET sendingSocket = setupSendSocket(host, port);
	if (sendingSocket < 1) {
		puts("Socket error in sendTSnapshotMessage. \n");
		fflush(stdout);
		return false;
	}

	protocolHeader pHeader = createProtocolHeader(tSnapshotMessage);

	bytesSent = tcpsend(sendingSocket, (char*) &pHeader, sizeof(protocolHeader),
			0);
	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage1).")) {
		return false;
	}

	tSnHeader header;
	header.id = tasklet->header.id;
//	header.lengthOfCode = tasklet->header.lengthOfCode;
//	header.lengthOfQocs = tasklet->header.lengthOfQocs;
//	header.lengthOfConstPool = tasklet->header.lengthOfConstPool;
	header.stacksize = tasklet->header.stacksize;
	header.heapLevels = tasklet->header.heapLevels;
	header.intermediateResultsLength =
			tasklet->header.intermediateResultsLength;

	bytesSent = tcpsend(sendingSocket, (char*) &header, sizeof(tSnHeader), 0);
	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage2).")) {
		return false;
	}

//	bytesSent = tcpsend(sendingSocket, (char*) tasklet->taskletcode,
//			header.lengthOfCode, 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage3).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) tasklet->qocs,
//			header.lengthOfQocs, 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage4).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) tasklet->constPool,
//			header.lengthOfConstPool, 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage6).")) {
//		return false;
//	}

	sendTaskletSnapshotPayload(sendingSocket, tasklet, header.stacksize,
			header.heapLevels, header.intermediateResultsLength);

	return true;
}

bool sendTaskletSnapshotPayload(SOCKET sendingSocket, tasklet* tasklet,
		int stacksize, int heapLevels, int intermediateResultsLength) {

	if (tasklet->tSnapshot == NULL)
		tasklet->tSnapshot = initTaskletSnapshot();

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->tSnapshot,
			sizeof(taskletSnapshot), 0);
	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage2).")) {
		return false;
	}

	bytesSent = tcpsend(sendingSocket, (char*) tasklet->tSnapshot->stack,
			stacksize * sizeof(int), 0);
	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage7).")) {
		return false;
	}

	bytesSent = tcpsend(sendingSocket,
			(char*) tasklet->tSnapshot->heapSpaceEntries,
			heapLevels * sizeof(int), 0);
	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage8).")) {
		return false;
	}

	int i, j, elementSize;
	for (i = 0; i < heapLevels; ++i) {
		for (j = 0; j < tasklet->tSnapshot->heapSpaceEntries[i]; ++j) {
			elementSize = readElementLengthFromSnapshot(i, j,
					tasklet->tSnapshot->heapSpace);

			bytesSent = tcpsend(sendingSocket,
					(char*) &tasklet->tSnapshot->heapSpace[i][j][0],
					sizeof(char), 0);
			if (checkError(bytesSent,
					"Connection error (sendTSnapshotMessage9).")) {
				return false;
			}

			bytesSent = tcpsend(sendingSocket, (char*) &elementSize,
					sizeof(int), 0);
			if (checkError(bytesSent,
					"Connection error (sendTSnapshotMessage9).")) {
				return false;
			}

			bytesSent = tcpsend(sendingSocket,
					(char*) &tasklet->tSnapshot->heapSpace[i][j][5],
					elementSize * sizeof(char), 0);
			if (checkError(bytesSent,
					"Connection error (sendTSnapshotMessage9).")) {
				return false;
			}
		}
	}

	bytesSent = tcpsend(sendingSocket,
			(char*) tasklet->tSnapshot->intermediateResults,
			sizeof(char) * intermediateResultsLength, 0);
	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage10).")) {
		return false;
	}

//	bytesSent = tcpsend(sendingSocket,
//			(char*) &tasklet->tSnapshot->numofresults, sizeof(int), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage11).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->countInstr,
//			sizeof(int), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage12).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->prgCount,
//			sizeof(int), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage13).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->baseAdr,
//			sizeof(int), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage14).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->top,
//			sizeof(int), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage15).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->tmp,
//			sizeof(int), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage16).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->fArg1,
//			sizeof(float), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage17).")) {
//		return false;
//	}
//
//	bytesSent = tcpsend(sendingSocket, (char*) &tasklet->tSnapshot->fArg2,
//			sizeof(float), 0);
//	if (checkError(bytesSent, "Connection error (sendTSnapshotMessage18).")) {
//		return false;
//	}

	return true;
}

/*
 * returns
 * 		messageType
 * 		-1 if network error
 *		-2 if magic is invalid 	(wrong protocol)
 */
messageType receiveProtocolHeader(SOCKET receivingSocket) {

	long bytesReceived;

	protocolHeader pHeader;
	bytesReceived = tcpreceive(receivingSocket, (char*) &pHeader,
			sizeof(protocolHeader), 0);

	if (checkError(bytesReceived, "Connection error (Receive)."))
		return -1;

	if (pHeader.magic != MAGIC)
		return -2;

	return pHeader.messageType;
}

protocolHeader createProtocolHeader(messageType messageType) {
	protocolHeader pHeader;
	pHeader.magic = MAGIC;
	pHeader.version = protocolVersion;
	pHeader.messageType = messageType;
	pHeader.device	= deviceID;

	return pHeader;
}

taskletHeader createTaskletHeader(u_long ip, int port, u_int serial,
		u_int proxySerial, int resultHandle, u_int subserial, int replicationID,
		int sessionID, int trialID, int lengthOfCode, int lengthOfQocs,
		int lengthOfResults, int lengthOfConstPool, int stacksize,
		int heapLevels, int intermediateResultLength, int intermediateComp,
		int finalComp, int retryCounter, int heartBeatCounter,
		int hotRetryCounter) {

	taskletHeader header;

	header.id.ip = ip;
	header.id.port = port;
	header.id.serial = serial;
	header.id.proxySerial = proxySerial;
	header.id.resultHandle = resultHandle;
	header.id.subserial = subserial;
	header.id.replicationID = replicationID;
	header.id.sessionID = sessionID;
	header.id.trialID = trialID;
	header.id.evaluationValues.finalComp = finalComp;
	header.id.evaluationValues.heartBeatCounter = heartBeatCounter;
	header.id.evaluationValues.intermediateComp = intermediateComp;
	header.id.evaluationValues.retryCounter = retryCounter;
	header.id.evaluationValues.hotRetryCounter = hotRetryCounter;

	header.lengthOfCode = lengthOfCode;
	header.lengthOfQocs = lengthOfQocs;
	header.lengthOfResults = lengthOfResults;
	header.lengthOfConstPool = lengthOfConstPool;
	header.stacksize = stacksize;
	header.heapLevels = heapLevels;
	header.intermediateResultsLength = intermediateResultLength;

	return header;
}

bool isSimilar(id* id1, id* id2) {

	bool similar = true;
	similar = similar && (id1->ip == id2->ip);
	similar = similar && id1->port == id2->port;
	similar = similar && id1->serial == id2->serial;
	similar = similar && id1->replicationID == id2->replicationID;

	return similar;
}

void printTasklet(tasklet* taskletToPrint) { //TODO add heap?

	struct in_addr addr;
	addr.s_addr = taskletToPrint->header.id.ip;

	struct in_addr exaddr;
	exaddr.s_addr = taskletToPrint->header.id.executingIP;

	printf("[%s].%-10d ", inet_ntoa(addr), taskletToPrint->header.id.port);
	printf("ID:%-10d replicationID:%-d subID:%-d ",
			taskletToPrint->header.id.serial,
			taskletToPrint->header.id.replicationID,
			taskletToPrint->header.id.subserial);
	printf(" Container: [%s]   ", inet_ntoa(exaddr));
	fflush(stdout);

}

void freeTasklet(tasklet* taskletToDelete) {

	free(taskletToDelete->taskletcode);

	free(taskletToDelete->qocs);

	free(taskletToDelete->results);

	free(taskletToDelete->constPool);

	freeQoC(taskletToDelete);

	freeSnapshotFromTasklet(taskletToDelete);

	free(taskletToDelete);

}

void freeSnapshotFromTasklet(tasklet* toDelete) {

	if (toDelete->tSnapshot == NULL)
		return;

	toDelete->tSnapshot->instantiated = false;
	toDelete->tSnapshot->baseAdr = 0;
	toDelete->tSnapshot->countInstr = 0;
	toDelete->tSnapshot->fArg1 = 0.0;
	toDelete->tSnapshot->fArg2 = 0.0;
	toDelete->tSnapshot->numofresults = 0;
	toDelete->tSnapshot->prgCount = 0;
	toDelete->tSnapshot->tmp = 0;
	toDelete->tSnapshot->top = 0;

	toDelete->header.heapLevels = 0;
	toDelete->header.stacksize = 0;
	toDelete->header.intermediateResultsLength = 0;

	int i, j;

	free(toDelete->tSnapshot->stack);

	for (i = 0; i < toDelete->header.heapLevels; ++i) {
		for (j = 0; j < toDelete->tSnapshot->heapSpaceEntries[i]; ++j) {
			free(toDelete->tSnapshot->heapSpace[i][j]);
		}
		free(toDelete->tSnapshot->heapSpace[i]);
	}

	free(toDelete->tSnapshot->heapSpace);
	free(toDelete->tSnapshot->heapSpaceEntries);
	free(toDelete->tSnapshot->intermediateResults);
	free(toDelete->tSnapshot);

}

void freeQoC(tasklet* taskletToDelete) {

	if (taskletToDelete->qocParameter == NULL)
		return;

	free(taskletToDelete->qocParameter->qocLocal);

	free(taskletToDelete->qocParameter->qocRemote);

	free(taskletToDelete->qocParameter->qocReliable);

	free(taskletToDelete->qocParameter->qocSpeed);

	free(taskletToDelete->qocParameter->qocProxy);

	free(taskletToDelete->qocParameter->qocRedundancy);

	free(taskletToDelete->qocParameter->qocReplication);

	free(taskletToDelete->qocParameter->qocMigration);

	free(taskletToDelete->qocParameter);
}

void resolveQocArray(tasklet* taskletWithQocs) {

	int lengthOfQocs = taskletWithQocs->header.lengthOfQocs;
	char* qocs = taskletWithQocs->qocs;

	taskletWithQocs->qocParameter = initQocDetails();

	int i = 0;

	i = 0;
	while (i < lengthOfQocs) {

		byte type = qocs[i++];

		switch (type) {
		case local:
			taskletWithQocs->qocParameter->qocLocal = initSingleQoC();
			i += 1;
			break;
		case remote:
			taskletWithQocs->qocParameter->qocRemote = initSingleQoC();
			i += 1;
			break;
		case speed:
			taskletWithQocs->qocParameter->qocSpeed = initSingleQoC();
			i += 4;
			taskletWithQocs->qocParameter->qocSpeed->length = 5;
			taskletWithQocs->qocParameter->qocSpeed->parameters = &qocs[i];
			i += taskletWithQocs->qocParameter->qocSpeed->length;
			break;
		case reliable:
			taskletWithQocs->qocParameter->qocReliable = initSingleQoC();
			i += 1;
			break;
		case proxy:
			taskletWithQocs->qocParameter->qocProxy = initSingleQoC();
			i += 4;
			taskletWithQocs->qocParameter->qocProxy->length = 21;
			taskletWithQocs->qocParameter->qocProxy->parameters = &qocs[i];
			i += taskletWithQocs->qocParameter->qocProxy->length;
			break;
		case redundancy:
			taskletWithQocs->qocParameter->qocRedundancy = initSingleQoC();
			i += 4;
			taskletWithQocs->qocParameter->qocRedundancy->length = 5;
			taskletWithQocs->qocParameter->qocRedundancy->parameters = &qocs[i];
			i += taskletWithQocs->qocParameter->qocRedundancy->length;
			break;
		case replication:
			taskletWithQocs->qocParameter->qocReplication = initSingleQoC();
			i += 4;
			taskletWithQocs->qocParameter->qocReplication->length = 5;
			taskletWithQocs->qocParameter->qocReplication->parameters =
					&qocs[i];
			i += taskletWithQocs->qocParameter->qocReplication->length;
			break;
		case migration:
			taskletWithQocs->qocParameter->qocMigration = initSingleQoC();
			i += 4;
			taskletWithQocs->qocParameter->qocMigration->length = 10;
			taskletWithQocs->qocParameter->qocMigration->parameters = &qocs[i];
			i += taskletWithQocs->qocParameter->qocMigration->length;
			break;
		default:
			printf("ERROR. Wrong qoc type detected: %d\n", type);
			fflush(stdout);

			printf("#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+\n");
			printf("Serial: %d\n", taskletWithQocs->header.id.serial);
			printf("SubSerial: %d\n", taskletWithQocs->header.id.subserial);
			printf("Host IP: %s\n",
					u_longToCharIP(taskletWithQocs->header.id.ip));
			printf("Host port: %d\n", taskletWithQocs->header.id.port);
			int i;
			for (i = 0; i < taskletWithQocs->header.lengthOfQocs; i++) {
				printf("[%d]: %d\n", i, taskletWithQocs->qocs[i]);
			}
			printf("#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+\n");
			fflush(stdout);
		}
	}

}

guid* receiveGUID(SOCKET connectedSocket) {

	guid *receivedGUID = malloc(sizeof(guid));

	bytesReceived = tcpreceive(connectedSocket, (char*) receivedGUID,
			sizeof(guid), 0);
	if (checkError(bytesReceived, "Connection error (receiveGUID).")) {
		return NULL;
	}

	return receivedGUID;
}

bool checkError(long rc, char* msg) {
	if (rc < 0) {
		printf("%s: %d\n", msg, pi_error());
		fflush(stdout);
		return true;
	}
	return false;
}

//--------------Logger Stuff-------------------------

void createMutexForOutPut() {
	mtex = pi_create_mutex(FALSE);
}

void initializeLogOutput(char *location) {

	if (LOGGER) {
		struct timeval localtimeval;
		gettimeofday(&localtimeval, 0);
		startTime = localtimeval.tv_sec;
		;
		int n = snprintf(NULL, 0, "%lu", localtimeval.tv_sec);
		char secbuf[n + 1];
		snprintf(secbuf, n + 1, "%lu", localtimeval.tv_sec);
		n = snprintf(NULL, 0, "%lu", localtimeval.tv_usec);
		char msecbuf[n + 1];
		snprintf(msecbuf, n + 1, "%lu", localtimeval.tv_usec);
		char name[strlen(secbuf) + strlen(msecbuf) + strlen(location) + 4];
		strcpy(name, location);
		strcat(name, secbuf);
		strcat(name, msecbuf);
		strcat(name, ".csv");
		if (access(name, 0) != -1) {
			evalFile = fopen(name, "a");
		} else {
			evalFile = fopen(name, "a");
			fprintf(evalFile,
					"Role;Measured Point;Message Type;LocalIP;LocalIP long;TVM IP;TVM IP long;TVM Port;Host IP;Host IP long;Host Port;Application ID;TSerial;ReplicationID;TSubserial;Sec since 1970;microsec;totalTime;Session ID;Trial ID\n");
		}
		createMutexForOutPut();
		printf("initializeLogOutput end");
		fflush(stdout);
	}

}

void tLogMessage(tasklet *tlet, messageType mt, measure_point mp,
		eval_role role, int tvmPort) {
	if (LOGGER) {
		struct timeval locTime;
		gettimeofday(&locTime, 0);
		loggerObject *logObject = malloc(sizeof(loggerObject));
		logObject->hostPort = tlet->header.id.port;
		logObject->hostIP = tlet->header.id.ip;
		logObject->applicationID = tlet->header.id.proxySerial;
		logObject->sessionID = tlet->header.id.sessionID;
		logObject->trialID = tlet->header.id.trialID;
		logObject->tSerial = tlet->header.id.serial;
		logObject->tSubserial = tlet->header.id.subserial;
		logObject->replicationID = tlet->header.id.replicationID;
		logObject->tvmIP = tlet->header.id.executingIP;
		logObject->mt = mt;
		logObject->mp = mp;
		logObject->role = role;
		logObject->tvmPort = tvmPort;
		logObject->sec = locTime.tv_sec;
		logObject->msec = locTime.tv_usec;
		logObject->totalTime = (locTime.tv_sec - startTime) * 1000
				+ locTime.tv_usec / 1000;
		if (mp == mp_notset) {
			logObject->tvmIP = EMPTY_IP;
			logObject->hostIP = EMPTY_IP;
		}
		if (logObject->tSerial != 0) {
			pi_startthread(loggerWorkerThread, 0, (void*) logObject);
		}
	}

}

void loggerWorkerThread(void *temp) {
//	printf("loggerWorkerThread a (started)\n");
//	fflush(stdout);
//	pi_lock_mutex(mtex);
//
//	loggerObject *logObject = (loggerObject*) temp;
//	int length = 0;
//	length += fprintf(evalFile, "%i;%i;%i;%s;%lu;", logObject->role, logObject->mp, logObject->mt, u_longToCharIP(myIP),
//			myIP);
//
//	length += fprintf(evalFile, "%s;%lu;%i;", u_longToCharIP(logObject->tvmIP), logObject->tvmIP, logObject->tvmPort);
//
//	length += fprintf(evalFile, "%s;%lu;%i;%i;%i;%i;%i;%lu;%lu;%lu;%i;%i\n", u_longToCharIP(logObject->hostIP),
//			logObject->hostIP, logObject->hostPort, logObject->applicationID, logObject->tSerial,
//			logObject->replicationID, logObject->tSubserial, logObject->sec, logObject->msec, logObject->totalTime,
//			logObject->sessionID, logObject->trialID);
//	fflush(evalFile);
//	pi_release_mutex(mtex);
//	printf("loggerWorkerThread b (ended)\n");
//	fflush(stdout);
}

//_____________OLD EVAL STUFF___________________________________
//	length += sprintf(&str[length], "%i;%i;%i;%s;", logObject->role,
//			logObject->mp, logObject->mt, u_longToCharIP(myIP));
//
//	length += sprintf(&str[length], "%s;%i;", u_longToCharIP(logObject->tvmIP),
//			logObject->tvmPort);
//
//	length += sprintf(&str[length], "%s;%i;%i;%i;%i;%i;%lu;%lu;%i\n",
//			u_longToCharIP(logObject->hostIP), logObject->hostPort,
//			logObject->tSerial, logObject->tSubserial, logObject->isSend,
//			logObject->isLocal, logObject->sec, logObject->msec,
//			logObject->runID);
//	str[length++] = '\0';

//	length = sprintf(str, "%i;%i;%i;%s;%s;%i;%s;%i;%i;%i;%i;%i;%lu;%lu;%i\n",
//			logObject->role, logObject->mp, logObject->mt, u_longToCharIP(myIP),
//			u_longToCharIP(logObject->tvmIP), logObject->tvmPort,
//			u_longToCharIP(logObject->hostIP), logObject->hostPort,
//			logObject->tSerial, logObject->tSubserial, logObject->isSend,
//			logObject->isLocal, logObject->sec, logObject->msec,
//			logObject->runID);
//	free(logObject);
//	if (dumpsize - currentdumpsize <= length) {
//		resizedump();
//	}
//	printf(
//			"Written in dump: Complete size: %i, currentsize: %i, length of string: %i, strlen: %i\n",
//			dumpsize, currentdumpsize, length, strlen(str));
//	fflush(stdout);
//	memcpy(&evaldump[currentdumpsize], str, length);
//	printf("DONE\n");
//	fflush(stdout);
//	currentdumpsize += length;

//void resizedump() {
//	printf("resize from %i to %i\n", dumpsize, dumpsize + 5000);
//	fflush(stdout);
//	dumpsize += 5000;
//	evaldump = realloc(evaldump, dumpsize * sizeof(char));
//
//}
//
//void dumpThread() {
//	struct timeval current;
//	while (true) {
//		pi_sleep(10000);
//		pi_lock_mutex(mtex);
//		gettimeofday(&current, 0);
//		long i = 0;
//		i = (current.tv_sec - evalinterval.tv_sec);
//		printf("Timediff: %lu, \n", i);
//		fflush(stdout);
//		if ((current.tv_sec - evalinterval.tv_sec > dumptime)
//				&& (currentdumpsize > 0)) {
//
//			writeDumpInFile();
//		}
//
//		pi_release_mutex(mtex);
//	}
//}
//
//void exchangeDumper() {
//
//}
//
//void writeDumpInFile() {
////	if (dumpsize <= currentdumpsize) {
////		evaldump = realloc(evaldump, dumpsize + 1);
////	}
////	evaldump[currentdumpsize] = '\0';
//	int i = 0;
//	printf("Dumping started!!!!!!!!!!!!\n");
//	fflush(stdout);
////	while (i < currentdumpsize)
////		i += fprintf(evalFile, "%s", &evaldump[i]);
//
//	i = fputs(evaldump, evalFile);
//	fflush(evalFile);
//	printf("%i written into file!!!!!!!!!!!!\n", i);
//	fflush(stdout);
//	currentdumpsize = 0;
//	dumpsize = 5000;
//	evaldump = realloc(evaldump, dumpsize * sizeof(char));
//	memset(&evaldump[0], 0, dumpsize);
//}

//measure_point identifyMeasurePoint(messageType mt, bool isSend, bool isLocal,
//bool before) {
//
//	switch (mt) {
//	case iRequestMessage:
//		if (identifyRole(mp_notset, iRequestMessage, isSend, isLocal)
//				== role_app) {
//			if (before)
//				return before_app_send;
//			else
//				return after_app_send;
//		}
//		break;
//	case tForwardMessage:
//
//		break;
//	case tExecuteMessage:
//
//		break;
//	case tResultMessage:
//
//		break;
//	case iResultMessage:
//
//		break;
//	default:
//		break;
//	}
//
//	return after_app_receive_result;
//}
//
//eval_role identifyRole(measure_point mp, messageType mt, bool isSend,
//bool isLocal) {
//	if (mp == mp_notset) {
//		switch (mt) {
//		case iRequestMessage:
//			if (isSend)
//				return role_app;
//			else
//				return role_fac;
//			break;
//		case tForwardMessage:
//			if (isSend) {
//				if (isLocal)
//					return role_fac;
//				else
//					return role_orch;
//			} else
//				return role_orch;
//			break;
//		case tExecuteMessage:
//			if (isSend)
//				return role_orch;
//			else
//				return role_tvm;
//			break;
//		case tResultMessage:
//			if (isSend) {
//				if (isLocal)
//					return role_tvm;
//				else
//					return role_orch;
//			} else
//				return role_orch;
//			break;
//		case iResultMessage:
//			if (isSend)
//				return role_orch;
//			else
//				return role_app;
//			break;
//		case dropTaskletMessageLocal:
//			return role_tvm;
//			break;
//		default:
//			return role_notset;
//			break;
//		}
//	} else {
//		if (mp == before_app_send || mp == after_app_send
//				|| mp == before_app_receive_result
//				|| mp == after_app_receive_result)
//			return role_app;
//		else if (mp == before_fac_send || mp == before_fac_receive
//				|| mp == before_fac_process || mp == after_fac_send
//				|| mp == after_fac_receive || mp == after_fac_process)
//			return role_fac;
//		else if (mp == before_orc_receive_local
//				|| mp == before_orc_receive_remote
//				|| mp == before_orc_receive_local_result
//				|| mp == before_orc_receive_remote_result
//				|| mp == before_orc_send_local || mp == before_orc_send_remote
//				|| mp == before_orc_send_local_result
//				|| mp == before_orc_send_remote_result ||
//
//				mp == after_orc_receive_local || mp == after_orc_receive_remote
//				|| mp == after_orc_receive_local_result
//				|| mp == after_orc_receive_remote_result
//				|| mp == after_orc_send_local || mp == after_orc_send_remote
//				|| mp == after_orc_send_local_result
//				|| mp == after_orc_send_remote_result
//				|| mp == before_orc_request || mp == after_orc_request)
//			return role_orch;
//		else if (mp == before_tvm_interpret || mp == before_tvm_receive
//				|| mp == before_tvm_send_result || mp == after_tvm_interpret
//				|| mp == after_tvm_receive || mp == after_tvm_send_result
//				|| mp == tvm_drop)
//			return role_tvm;
//		else
//			return role_notset;
//	}
//}

