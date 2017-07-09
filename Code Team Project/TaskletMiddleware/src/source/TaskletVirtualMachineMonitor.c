/*
 ============================================================================
 Name        : TaskletVirtualMachineMonitor.c
 Author      : 
 Version     :
 Copyright   : Your copyright notice
 Description : Hello World in C, Ansi-style
 ============================================================================
 */

#include "../header/TaskletVirtualMachineMonitor.h"

bool tvmalive = true;
bool ui_running = true;
bool tvmThread_running = true;
bool orchThread_running = true;
int numoftvm = 0;
u_short orchport = 22222;
char *s_tvmport = "33333";
u_short tvmport = 33333;
int updatePullTreshold = 60;
long lastUpdatePull;
int numCores;
tvm *lastuse;
pimutex tvmListMutex;

void runVMMonitor(int numberOfTVM, float corruptionRate) {
	srand((unsigned int) time(NULL));
	numCores = pi_getnumberofcores();
	header = NULL;
	lastuse = NULL;
	tvmListMutex = pi_create_mutex(FALSE);

	tvmSocket = createSocket(tvmport);
	pi_startthread(runTVMManagementThread, 0, NULL);
	initialTVMspawn(numberOfTVM, corruptionRate);
	pi_startthread(runUI, 0, NULL);

}

void runUI(void *id) {
	int i;
	do {
		printf("Ready for new instructions!\n"
				"New TVM: n"
				"\nKill TVM: k"
				"\nShow TVMs: t"
				"\nStatus TVM: s"
				"\n");
		fflush(stdout);
		i = getchar();
		if (i == 'n' || i == 'N') {
			spawnTVM();
		} else if (i == 'k' || i == 'K') {
			printf("Enter TVM ID:");
			fflush(stdout);
			scanf("%d", &i);
			killTVMOnPort(i);
		} else if (i == 't' || i == 'T') {
			printf("Currently %d TVM(s) running\n", numoftvm);
			fflush(stdout);
			printtvms();
		} else if (i == 's' || i == 'S') {
			//TODO pull status or update in some way...
			printf("Enter TVM ID:");
			fflush(stdout);
			scanf("%d", &i);
			tvm *obj = findtvm(i);
			if (obj != NULL)
				printf("TVM %d Status:----", obj->portId);
		}
	} while (ui_running);
}

void runTVMManagementThread(void *id) {

	tvm *tvm;
//	tvmStatus *status;
	SOCKET connectedSocket;

	do {

		connectedSocket = listenAndAccept(tvmSocket, 10000);

		messageType mt = receiveProtocolHeader(connectedSocket);

		if (mt == mTvmJoinMessage) {
			tvm = receiveTVMJoinMessage(connectedSocket, mt);
			pi_sleep(50); //TODO: hack to not be too fast for the TVM to open its port.
			SOCKET instructionSock = setupSendSocket(inet_addr("127.0.0.1"),
					tvm->portId);

			addtvm(tvm->portId, connectedSocket, instructionSock);
			printf("New TVM with port id %d added!\n", tvm->portId);
			fflush(stdout);
		}

		//TODO cancel and termintation messages!

//		else if (mt == mTvmStatusMessage) {
//			status = receiveTVMStatusMessage(connectedSocket, mt);
////			updateTvmStatus(*status);
//		}
	} while (tvmThread_running);
}

void initialTVMspawn(int num, float corruptionRate) {
	float r;
	while (num > 0) {
		r = (float) (rand()) / (float) (RAND_MAX);
		printf("%f", r);
		fflush(stdout);
		if (r <= corruptionRate)
			spawnCorruptedTVM();
		else
			spawnTVM();
		num--;
	}
}

void spawnCorruptedTVM() {
	readFilePath(3);
	printf("Corruption has begun!\n");
	pi_start_process(path, NULL);
}

void spawnTVM() {
	readFilePath(2);
	printf("The world is beautiful!\n");
	pi_start_process(path, NULL);
}

void killTVM(tvm *tvm) {
	sendTVMTerminationMessage(tvm->managementSocket);
	deletetvm(tvm);
	sendVMDownMessage();
}

void killTVMOnPort(int port) {
	killTVM(findtvm(port));
}

bool executeTasklet(tasklet *tasklet, tvm *tvm) {
	return sendTExecuteMessage(tvm->instructionSocket, tasklet);
}

void releaseTVM(int tvmAdr) {
	pi_lock_mutex(tvmListMutex);

	tvm *current = header;

	while (current != NULL) {
		if (current->portId == tvmAdr) {
			current->tvmStatus.busy = false;
			sendVMUpMessage();
//			printf("vmUpMessage sent");
//			fflush(stdout);
			pi_release_mutex(tvmListMutex);
			return;
		} else
			current = current->next;
	}
	pi_release_mutex(tvmListMutex);
}

bool executeTaskletOnNextTVM(tasklet *taskletToExecute) {
	pi_lock_mutex(tvmListMutex);
	bool result;
	int firstTvmId;
//	tvm *current = lastuse->next;
	lastuse = lastuse->next;

	if (lastuse == NULL) {
		lastuse = header;
	}

	firstTvmId = lastuse->portId;

	while (lastuse->tvmStatus.busy) {
		lastuse = lastuse->next;
		if (lastuse == NULL)
			lastuse = header;
		if (lastuse->portId == firstTvmId) {
			pi_release_mutex(tvmListMutex);
			return false;
		}

	}
	lastuse->tvmStatus.busy = true;
	if (taskletToExecute->qocParameter->qocLocal != NULL) {
		sendVMDownMessage();
	}

	taskletToExecute->header.id.subserial++;
	result = sendTExecuteMessage(lastuse->instructionSocket, taskletToExecute);
	if (result) {
		tLogMessage(taskletToExecute, tExecuteMessage,
				mp_tvmmForwardsTaskletToTVM, role_mw,
				lastuse->instructionSocket);
	}
	pi_release_mutex(tvmListMutex);
	return result;

}

//--------------------VMM List------------------------

void addtvm(int portId, SOCKET _manage, SOCKET _instr) {
	pi_lock_mutex(tvmListMutex);
	tvm *newtvm;

	newtvm = malloc(sizeof(tvm));

	newtvm->portId = portId;
	newtvm->managementSocket = _manage;
	newtvm->instructionSocket = _instr;

	newtvm->tvmStatus.busy = false;

	newtvm->next = header;
	header = newtvm;

	lastuse = header;

	numoftvm++;
	pi_release_mutex(tvmListMutex);
}

//void pullTvmUpdates() {
//	pi_lock_mutex(tvmListMutex);
//	tvm *obj = header;
//	lastUpdatePull = (long) time(NULL);
//	while (obj != NULL) {
//		if (lastUpdatePull - obj->tvmStatus.lastUpdate > updatePullTreshold)
//			sendTVMStatusRequestMessage(obj->managementSocket);
//
//		obj = obj->next;
//	}
//	pi_release_mutex(tvmListMutex);
//}

void printtvms() {
	pi_lock_mutex(tvmListMutex);
	tvm *obj = header;
	int i = 1;
	while (obj != NULL) {
		printf("%d. TVM ID: %d\n", i++, obj->portId);
		obj = obj->next;
	}
	pi_release_mutex(tvmListMutex);
}

void deletetvm(tvm *obj) {
	pi_lock_mutex(tvmListMutex);
	pi_closesocket(obj->instructionSocket);
	pi_closesocket(obj->managementSocket);
	if (header->instructionSocket == obj->instructionSocket) {
		header = obj->next;
		free(obj);
		numoftvm--;
		pi_release_mutex(tvmListMutex);
		return;
	}

	tvm *prev = header;
	while (prev->next != NULL) {
		if (prev->next->instructionSocket == obj->instructionSocket) {
			prev->next = obj->next;
			free(obj);
			numoftvm--;
			pi_release_mutex(tvmListMutex);
			return;
		} else
			prev = prev->next;
	}

	printf("tvm was not deleted!: %d", obj->portId);
	pi_release_mutex(tvmListMutex);
	return;

}

tvm* findtvm(int _id) {
	pi_lock_mutex(tvmListMutex);
	tvm *obj = header;

	while (obj != NULL) {
		if (obj->portId == _id) {
			pi_release_mutex(tvmListMutex);
			return obj;
		} else
			obj = obj->next;
	}

	printf("tvm id not found!: %d", _id);
	pi_release_mutex(tvmListMutex);
	return NULL;
}

//void updateTvmStatus(tvmStatus _stat) {
//	pi_lock_mutex(tvmListMutex);
//	tvm *tvm = findtvm(_stat.id);
//
//	tvm->tvmStatus = _stat; //TODO is that okay?
//	tvm->tvmStatus.lastUpdate = (long) time(NULL);
//	pi_release_mutex(tvmListMutex);
//}
