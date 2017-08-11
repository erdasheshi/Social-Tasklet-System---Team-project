/*
 ============================================================================
 Name        : Orchestration.c
 Author      :
 Version     :
 Copyright   : Your copyright notice
 Description : Hello World in C, Ansi-style
 ============================================================================
 */

#include "../header/Orchestration.h"

SOCKET connectedSocket;
char *factorylocation =
		"START .\\..\\TaskletFactory\\Debug\\TaskletFactory.exe "; //TODO make dynamic!
//void findIPAddress();

void startOrchestration(void* temp) {

#if PLATFORM == PLATFORM_WINDOWS
	char command[] = "NetSh Advfirewall set allprofiles state off";
	system(command);
#endif

	readConfigFile();
	if (LOGGER) {
		initializeLogOutput("Evaluation\\middleware_evaluation");
	}
	char **arguments = temp;

	float corrupt = 0.0;

	corrupt = atof(arguments[1]);
	printf("corruptionrate: %f\n", corrupt);
	setup();
	tmSendSocket = setupUDPSendSocket();
	setupAddress();
	sendInstanceStartMessage(myIP);
	pi_startthread(taskletThread, 0, NULL);
	createMutexForOutPut();
	//runVMMonitor(pi_getnumberofcores(), corrupt);
	runVMMonitor(initialTVMs, corrupt);

	u_long fakeIP = 16777345;

	sendInstanceStartMessage(fakeIP);

	pi_startthread(resultThread, 0, NULL);
	pi_startthread(tHeartBeatThread, 0, NULL);
	pi_startthread(reliableThread, 0, NULL);
	pi_startthread(requestListThread, 0, NULL);
	pi_startthread(tSnapshotThread, 0, NULL);
	pi_sleep(1000); //TODO: Any faster way?
	startBenchmark();
	while (true) {
		pi_sleep(2000);
		requestOwnIP();
//		printTaskletList(&taskList);
	}

}

void setup() {
	InitializeSockets();
	srand(time(NULL));
	srand(rand() * rand());
	initializeTaskletList(&taskList);
	initializeTaskletList(&executionList);
	initializeTaskletList(&requestList);
	requestListSemaphore = pi_create_semaphore(0, LONG_MAX);
	reliableThreadSemaphore = pi_create_semaphore(10, 10);
	resultThreadListMutex = pi_create_mutex(FALSE);
	subIdMutex = pi_create_mutex(FALSE);
	blistMutex = pi_create_mutex(FALSE);
	currentSubID = 1;
	requestOwnIP();
	interruptTimer = 0;

}

void startBenchmark() {
	FILE *fr = fopen("primes.tbc", "r");

	instruction* benchmarkCode = malloc(sizeof(instruction));

	int i = 0;
	do {
		fscanf(fr, "%d %d %d", &benchmarkCode[i].f, &benchmarkCode[i].l,
				&benchmarkCode[i].a);
		i++;
		benchmarkCode = realloc(benchmarkCode, (i + 1) * sizeof(instruction));
	} while (!feof(fr));

	fclose(fr);

	tasklet *benchmarkTasklet = initTasklet();

	int codeLength = i * sizeof(instruction);
	benchmarkTasklet->header = createTaskletHeader(inet_addr("127.0.0.1"),
			54321, 0, 0, 0, 0, 0, 0, 0, codeLength, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0);
	benchmarkTasklet->taskletcode = benchmarkCode;
	benchmarkTasklet->qocParameter = initQocDetails();

	benchmarkTasklet->constPool = malloc(1);
	benchmarkTasklet->results = malloc(1);
	benchmarkTasklet->qocs = malloc(1);

	sendTForwardMessage(inet_addr("127.0.0.1"), 54321, benchmarkTasklet);

	freeTasklet(benchmarkTasklet);
	benchmarkStartClock = clock();

}

void tHeartBeatThread() {

	printf("tHeartBeatThread a (started)\n");
	fflush(stdout);

	SOCKET heartBeatSocket = pi_socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
	if (heartBeatSocket <= 0) {
		printf("failed to create socket\n");
	}

	SOCKADDR_IN address;
	address.sin_family = AF_INET;
	address.sin_addr.s_addr = INADDR_ANY;
	address.sin_port = htons((unsigned short) 22322);
	if (pi_bind(heartBeatSocket, (const SOCKADDR*) &address,
			sizeof(SOCKADDR_IN)) < 0) {
		printf("failed to bind socket\n");
	}

	id taskletID;

	while ( true) {
		taskletID = receiveTHeartBeatMessage(heartBeatSocket);

		updateHeartBeat(&taskList, taskletID);

	}

	printf("tHeartBeatThread b (ended)\n");
	fflush(stdout);
}

void reliableThread() {

	printf("reliableThread a (started)\n");
	fflush(stdout);

	while (true) {

		checkForLostTasklets(&taskList);

		pi_sleep(200);

	}

	printf("reliableThread b (ended)\n");
	fflush(stdout);

}

void deleteAndReinitiateTasklet(tasklet* toDel, taskletList* list) {
	tasklet* tmp = copyTasklet(toDel);
	tmp->header.id.subserial++;
	tmp->header.id.evaluationValues.retryCounter++;
	deleteTasklet(list, toDel->header.id);
	pi_startthread(factoryWorkerThread, 0, (void*) tmp);
}

void checkForLostTasklets(taskletList* list) {

	getMutex(list);

	taskletNode* current = list->first;
	taskletNode* temp;

	currentTime = clock();

//	tasklet* newTasklet = NULL;

	while (current != NULL) {

		//TODO: does realiability make sense for local execution?
		if (current->lastHeartbeat + current->buffer < currentTime) { // && current->tasklet->header.id.executingIP != myIP) {
			printf("*");

			temp = current->next;
			deleteAndReinitiateTasklet(current->tasklet, list);

//			newTasklet = copyTasklet(current->tasklet);
//			newTasklet->header.id.subserial++;
//			temp = current->next;
//			deleteTasklet(list, current->tasklet->header.id);
//			pi_startthread(factoryWorkerThread, 0, (void*) newTasklet);

			current = temp;

		}
		if (current == NULL) {
			break;
		}
		current = current->next;
	}

	releaseMutex(list);

}

void taskletWorkerThread(void *temp) {

	SOCKET *connectedSocket = (SOCKET*) temp;
	tasklet *receivedTasklet = receiveTForwardMessage(*connectedSocket);

	pi_closesocket(*connectedSocket);

	free(connectedSocket);

	if (receivedTasklet == NULL)
		return;

	int numberOfCopies = 1;
	if (receivedTasklet->qocParameter->qocReplication != NULL) {
		numberOfCopies = arrayToInt(
				&receivedTasklet->qocParameter->qocReplication->parameters[1]);
	}
	tasklet* copyToSend;
	int i;
	for (i = 0; i < numberOfCopies; i++) {
		copyToSend = copyTasklet(receivedTasklet);
		updateRedundancyQoC(copyToSend, 1);
		updateReplicationQoC(copyToSend, 1);
		tLogMessage(copyToSend, tForwardMessage,
				mp_orchestrationReceivesTaskletFromOrchestration, role_mw, -1);
		forwardToVM(copyToSend);
		receivedTasklet->header.id.replicationID++;

		freeTasklet(copyToSend);
	}
	freeTasklet(receivedTasklet);

}

void taskletThread() {

	printf("taskletThread a (started)\n");
	fflush(stdout);
	SOCKET acceptSocket = createSocket(54321);
	SOCKET connectedSocket = NULL;

	while (1) {

		connectedSocket = listenAndAccept(acceptSocket, 10000);
		SOCKET* temp = malloc(sizeof(SOCKET));
		*temp = connectedSocket;
		pi_startthread(taskletWorkerThread, 0, (void*) temp);
	}
	printf("taskletThread b (ended)\n");
	fflush(stdout);
	return;
}

void factoryWorkerThread(void *temp) {
	printf("factoryWorkerThread a (started)\n");
	fflush(stdout);
	tasklet *receivedTasklet = (tasklet*) temp;
	if (receivedTasklet == NULL) {
		printf("factoryWorkerThread b (ended)\n");
		fflush(stdout);
		return;
	}

	tLogMessage(receivedTasklet, notdefined,
			mp_orchestrationReceivesTaskletFromFactory, role_mw, -1);

	receivedTasklet->header.id.ip = myIP;

	if (receivedTasklet->qocParameter->qocLocal != NULL) {

		if (receivedTasklet->qocParameter->qocReplication != NULL) {
			int numberOfCopies =
					arrayToInt(
							&receivedTasklet->qocParameter->qocReplication->parameters[1]);
			int i;
			for (i = 0; i < numberOfCopies; i++) {
				tasklet* copy = copyTasklet(receivedTasklet);
				receivedTasklet->header.id.replicationID++;
				updateRedundancyQoC(receivedTasklet, 1);
				updateReplicationQoC(receivedTasklet, 1);
				forwardToMyVM(copy);

			}
		} else {
			forwardToMyVM(receivedTasklet);

		}

	} else {

		forwardToBroker(receivedTasklet);
	}
	printf("factoryWorkerThread b (ended)\n");
	fflush(stdout);
}

void forwardToMyVM(tasklet* receivedTasklet) {

	receivedTasklet->header.id.executingIP = myIP;
	if (receivedTasklet->qocParameter->qocLocal != NULL) {

		if (receivedTasklet->qocParameter->qocReliable != NULL) {
			getMutex(&taskList);

			addTasklet(&taskList, receivedTasklet, 1);

			releaseMutex(&taskList);
		}
	}
	forwardToVM(receivedTasklet);
	free(receivedTasklet);
}

void forwardToVM(tasklet* receivedTasklet) {

	if (!executeTaskletOnNextTVM(receivedTasklet)) {
		if (receivedTasklet->qocParameter->qocLocal != NULL) {
			getMutex(&requestList);

			addLocalTasklet(&requestList, receivedTasklet, 1);
			receivedTasklet->header.id.subserial++;
			tLogMessage(receivedTasklet, tForwardMessage, mp_requestQueueIn,
					role_mw, -1);

			releaseMutex(&requestList);
			pi_release_semaphore(requestListSemaphore);
		}
		tLogMessage(receivedTasklet, tExecuteMessage, mp_dropAtTVMM, role_mw,
				-1);
	}
}

void resultWorkerThread(void *temp) {

//	printf("resultWorkerThread a (started)\n");
//	fflush(stdout);

	SOCKET *connectedSocket = (SOCKET*) temp;
	int tvmAdr = 0;
	struct sockaddr_in addr;
	int socklen = sizeof(addr); // important! Must initialize length, garbage produced otherwise
	getpeername(*connectedSocket, (struct sockaddr*) &addr, &socklen);

	tasklet* resultTasklet = receiveTResultMessage(*connectedSocket, &tvmAdr);

	if (myIP == resultTasklet->header.id.executingIP) {
		if (resultTasklet->header.id.serial != -1) {
			tLogMessage(resultTasklet, tResultMessage,
					mp_orchestrationReceivesResultLocal, role_mw, tvmAdr);
		}
	} else {
		tLogMessage(resultTasklet, tResultMessage,
				mp_orchestrationReceivesResultRemote, role_mw, tvmAdr);

	}

//	printf("Received result: %d (%d)\n", resultTasklet->header.id.serial,
//			resultTasklet->header.id.replicationID);
//	fflush(stdout);

	if (tvmAdr != -1) {
		releaseTVM(tvmAdr);
	}
	pi_closesocket(*connectedSocket);
	if (resultTasklet->header.id.serial == 0) {
		benchmarkEndClock = clock();
		float benchmark = (benchmarkEndClock - benchmarkStartClock)
				/ (float) CLOCKS_PER_SEC;
		sendBenchmarkMessage(benchmark);
	} else if (resultTasklet->header.id.serial != -1) {
		if (!forwardResults(resultTasklet)) {
			tLogMessage(resultTasklet, iResultMessage, mp_dropResult, role_mw,
					-1);
			printf("Result has not been forwarded.\n");
			fflush(stdout);
		} else {
			getMutex(&taskList);
			decrementTasklet(&taskList, resultTasklet->header.id);
			releaseMutex(&taskList);
		}
	}

	freeTasklet(resultTasklet);

//	printf("resultWorkerThread b (ended)\n");
//	fflush(stdout);
}

void resultThread() {

	printf("resultThread a (started)\n");
	fflush(stdout);

	SOCKET acceptSocket = createSocket(44444);
	SOCKET connectedSocket = NULL;

	while (1) {
		connectedSocket = listenAndAccept(acceptSocket, 10000);
		SOCKET* temp = malloc(sizeof(SOCKET));
		*temp = connectedSocket;

		pi_startthread(resultWorkerThread, 0, (void*) temp);
	}
	printf("resultThread b (ended)\n");
	fflush(stdout);
}

bool forwardResults(tasklet* resultTasklet) {

	u_long host;
	int port;
	SOCKET sendingSocket;

	if (resultTasklet->header.id.ip == myIP) {

		if (resultTasklet->header.lengthOfResults == 0) {
			getMutex(&taskList);

			tasklet* tmp = getTasklet(&taskList, resultTasklet->header.id);

			if (tmp != NULL) {

				tmp->header.id.evaluationValues.intermediateComp +=
						resultTasklet->header.id.evaluationValues.intermediateComp;

				releaseMutex(&taskList);
				return false;
			}
		} else {
			getMutex(&taskList);

			tasklet* tmp = getTasklet(&taskList, resultTasklet->header.id);
			if (tmp != NULL) {
				resultTasklet->header.id.evaluationValues.intermediateComp =
						tmp->header.id.evaluationValues.intermediateComp;
				resultTasklet->header.id.evaluationValues.heartBeatCounter =
						tmp->header.id.evaluationValues.heartBeatCounter;
				resultTasklet->header.id.evaluationValues.retryCounter =
						tmp->header.id.evaluationValues.retryCounter;
				resultTasklet->header.id.evaluationValues.hotRetryCounter =
						tmp->header.id.evaluationValues.hotRetryCounter;
			}
			releaseMutex(&taskList);
		}

		SOCKET socketToApp = NULL;
		resultThreadInformation *info;
		int i;
		for (i = 0; i < RESULT_THREADS; i++) {
			info = resultThreads[i];
			if (info == NULL) {
				continue;
			}
			if (info->appIdentifier == resultTasklet->header.id.proxySerial) {
				socketToApp = info->appSocket;
				break;
			}
		}

		if (socketToApp == NULL) {
			tLogMessage(resultTasklet, iResultMessage, mp_dropResult, role_mw,
					-1);
			printf("#\n");
			return true;
		}

		pi_lock_mutex(info->mutex);
		if (!sendIResultMessage(socketToApp, resultTasklet)) {
			pi_release_mutex(info->mutex);
			return false;
		} else {
			tLogMessage(resultTasklet, iResultMessage,
					mp_orchestrationForwardsResultToApp, role_mw, -1);
			pi_release_mutex(info->mutex);
			return true;
		}

	} else {
		host = resultTasklet->header.id.ip;
		port = 44444;
		sendingSocket = setupSendSocket(host, port);
		if (sendingSocket < 1) {
			return false;
		}

		if (sendTResultMessage(sendingSocket, resultTasklet, -1)) {
			tLogMessage(resultTasklet, tResultMessage,
					mp_orchestrationForwardsResultToOrchestration, role_mw, -1);
		}

	}

	pi_closesocket(sendingSocket);

	return true;

}

void requestListWorkerThread(void *temp) {

	printf("requestListWorkerThread a (started)\n");
	fflush(stdout);
	tasklet *currentTasklet = (tasklet*) temp;
	if (currentTasklet->qocParameter->qocLocal != NULL) {
		forwardToMyVM(currentTasklet);
	} else {
		forwardToBroker(currentTasklet);
	}
	pi_release_semaphore(reliableThreadSemaphore);
	printf("requestListWorkerThread b (ended)\n");
	fflush(stdout);
}

void requestListThread() {
	printf("requestListThread a (started)\n");
	fflush(stdout);
	tasklet *temporaryTasklet;
	int interTimer;
	while (true) {
		pi_waitfor_semaphore(requestListSemaphore);
		getMutex(&requestList);

		temporaryTasklet = copyTasklet(requestList.first->tasklet);
		deleteTasklet(&requestList, requestList.first->tasklet->header.id);

		releaseMutex(&requestList);
		pi_waitfor_semaphore(reliableThreadSemaphore);
		interTimer = readInterruptTimer();
		pi_sleep(interTimer);
		tLogMessage(temporaryTasklet, notdefined, mp_requestQueueOut, role_mw,
				-1);
		temporaryTasklet->header.id.subserial++;
		pi_startthread(requestListWorkerThread, 0, (void*) temporaryTasklet);
		printf("requestListThread b (ended)\n");
		fflush(stdout);
	}
}

void tSnapshotWorkerThread(void *temp) {

	SOCKET *connectedSocket = (SOCKET*) temp;
	tasklet *receivedTasklet = receiveTSnapshotMessage(*connectedSocket);

	pi_closesocket(*connectedSocket);

	free(connectedSocket);

	if (receivedTasklet == NULL)
		return;

	getMutex(&taskList);

	tasklet* tmp = getTasklet(&taskList, receivedTasklet->header.id);
	if (tmp != NULL) {

		freeSnapshotFromTasklet(tmp);

		tmp->tSnapshot = copyTaskletSnapshot(receivedTasklet->tSnapshot,
				receivedTasklet->header.heapLevels,
				receivedTasklet->header.stacksize,
				receivedTasklet->header.intermediateResultsLength);

		tmp->header.heapLevels = receivedTasklet->header.heapLevels;
		tmp->header.intermediateResultsLength =
				receivedTasklet->header.intermediateResultsLength;
		tmp->header.stacksize = receivedTasklet->header.stacksize;
		printf("Cold Migration ----> Snapshot stored.\n");
		fflush(stdout);
		if (!receivedTasklet->tSnapshot->intervalSnapshot) {
			tmp->header.id.evaluationValues.intermediateComp +=
					receivedTasklet->header.id.evaluationValues.intermediateComp;
			tmp->header.id.evaluationValues.hotRetryCounter++;
			deleteAndReinitiateTasklet(tmp, &taskList);
			printf("Hot Migration ----> TExecution reinitiated.\n");
			fflush(stdout);
		}
	}

	releaseMutex(&taskList);

	freeTasklet(receivedTasklet);
}

void tSnapshotThread() {

	printf("tSnapshotThread started\n");
	fflush(stdout);
	SOCKET acceptSocket = createSocket(snapShotPort);
	SOCKET connectedSocket = NULL;

	while (1) {

		connectedSocket = listenAndAccept(acceptSocket, 10000);
		SOCKET* temp = malloc(sizeof(SOCKET));
		*temp = connectedSocket;
		pi_startthread(tSnapshotWorkerThread, 0, (void*) temp);
	}
	printf("taskletThread b (ended)\n");
	fflush(stdout);
	return;
}
