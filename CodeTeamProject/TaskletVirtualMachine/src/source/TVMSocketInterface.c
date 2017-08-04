/*
 * TVMSocketInterface.c
 *
 *  Created on: 13.08.2014
 *      Author: Dominik
 */

#include "../header/TVMSocketInterface.h"
/**
 * Initializes the two sockets that a TVM needs.
 */
bool initializeSockets() {

	return true;

}

void vmTHeartBeatThread() {
	struct timeval timevalue;
	int timeout = 1000;
//	int hbcount = 0;
	while (heartBeatSemaphore) {

		sendTHeartBeatMessage(currentTasklet->header.id);
		gettimeofday(&timevalue, 0);
		printf("Heartbeat sent in %lu, for Tasklet: %i\n", timevalue.tv_sec,
				currentTasklet->header.id.serial);
		fflush(stdout);
//		if (corrupt && interpreter_running) {
//			if (rand() % 250 <= hbcount)
//				interpreter_running = false;
//			hbcount++;
//		}
		pi_sleep(timeout);

	}

}

/**
 * Connects the Virtual Machine to the local VMM
 * Sockets must be initialized first!
 */
bool connectToVMM() {
	managementSocket = setupSendSocket(inet_addr("127.0.0.1"), vmmport);
	managementPort = getPortNumber(managementSocket);
	initSocket = createSocketOnRandomPort();
	initPort = getPortNumber(initSocket);
	if (sendTVMJoinMessage(managementSocket, initPort)) {
		instructionSocket = listenAndAccept(initSocket, 10000);
		instructionPort = getPortNumber(instructionSocket);
		printf(
				"TVM %d is registered and hungry for tasklets! Mhh Tasklets...\n",
				instructionPort);
		if (corrupt == true)
			printf("I am a corrupted VM, so... I wouldn't trust me!\n");
		fflush(stdout);
		return true;
	} else {
		vm_running = false;
		interpreter_running = false;
		management_running = false;
		return false;
	}
}

int receiveprogramOnTVM() {
	int tmp = 0;
	currentTasklet = receiveTExecuteMessage(instructionSocket);
	tLogMessage(currentTasklet, tExecuteMessage, mp_tvmStartsExecution,
			role_tvm, instructionPort);
	if (currentTasklet->qocParameter->qocMigration != NULL) {
		tmp = arrayToInt(
				&currentTasklet->qocParameter->qocMigration->parameters[1]);
		if (tmp > 0)
			hotMigrationEnabled = true;
//		memcpy(&coldMigrationInterval,
//				&currentTasklet->qocParameter->qocMigration->parameters[4], 4);
		coldMigrationInterval = arrayToInt(
				&currentTasklet->qocParameter->qocMigration->parameters[6]);

		if (coldMigrationInterval > 250) {
			coldMigrationEnabled = true;
			snapShotInstrThreshold = localInstructionRatio
					* coldMigrationInterval;
		}
	}
	if (currentTasklet->header.lengthOfCode == 0)
		return 2;
	if (currentTasklet->qocParameter->qocReliable != NULL) {
		return 1;
	}

	return 0;

}

bool returnresult(bool drop) {

	resultSocket = setupSendSocket(inet_addr("127.0.0.1"), 44444);
	if (drop) {
		tLogMessage(currentTasklet, tExecuteMessage, mp_dropDuringTVM, role_tvm,
				instructionPort);

		if (explicitDrop && hotMigrationEnabled)
			currentTasklet->header.id.serial = -1;
		currentTasklet->header.id.evaluationValues.intermediateComp =
				time_spent;
		currentTasklet->header.lengthOfResults = 0;

	} else {
		if (!corrupt || currentTasklet->header.id.serial == 0) {
			currentTasklet->header.id.evaluationValues.finalComp = time_spent;
			currentTasklet->results = results;
			currentTasklet->header.lengthOfResults = resultsize;

		} else {
			tLogMessage(currentTasklet, tExecuteMessage, mp_dropDuringTVM,
					role_tvm, instructionPort);
			currentTasklet->header.lengthOfResults = 0;
			currentTasklet->header.id.serial = -1;
		}
	}

	sendTResultMessage(resultSocket, currentTasklet, initPort);

	printf("*#*Result Sent: %d.\n", currentTasklet->header.id.serial);
	fflush(stdout);
	pi_closesocket(resultSocket);
	return true;
}

