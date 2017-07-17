/*
 ============================================================================
 Name        : IPResponder.c
 Author      : 
 Version     :
 Copyright   : Your copyright notice
 Description : Hello World in C, Ansi-style
 ============================================================================
 */

#include <stdio.h>
#include <stdlib.h>

#include "../header/IPResponder.h"

void heartBeatThread() {
	SOCKET heartBeatSocket = createSocket(brokerHeartbeatPort);
	SOCKET connectedSocket;

	while (true) {
		connectedSocket = listenAndAccept(heartBeatSocket, 10000);
		messageType mType = receiveProtocolHeader(connectedSocket);

		if (mType < 0) {
			puts("Error while receiving protocol header.");
			continue;
		}
		if (mType == bHeartbeatMessage) {
			u_long remoteIP = getRemoteIPAddress(connectedSocket);
//			if(strcmp(u_longToCharIP(remoteIP),"127.0.0.1")==0)
//				remoteIP = inet_addr("134.155.51.5");
			pi_lock_mutex(blistMutex);
			if (insertBroker(remoteIP)) {
				numberOfInstances++;
			}
			pi_release_mutex(blistMutex);
			sendBIPMessage(connectedSocket, remoteIP);
		} else if (mType == benchmarkMessage) {
			float benchmark = receiveBenchmarkMessage(connectedSocket);
			u_long host = getRemoteIPAddress(connectedSocket);
			pi_lock_mutex(blistMutex);
			updateBenchmark(host, benchmark);
			decreaseAvailableVMs(host);
			pi_release_mutex(blistMutex);
		} else
			puts("Wrong message Type in Heart Beat Thread received.");

		pi_closesocket(connectedSocket);
	}
}

void bRequestThread() {
	int numberOfReq = 0;
	SOCKET bRequestSocket = createSocket(brokerRequestPort);
	SOCKET connectedSocket;

	while (true) {

		connectedSocket = listenAndAccept(bRequestSocket, 10000);
		messageType mType = receiveProtocolHeader(connectedSocket);

		if (mType < 0) {
			puts("Error while receiving protocol header.");
			continue;
		}
		if (mType == bRequestMessage) {
			numberOfReq++;
			requestDetails details = receiveBRequestMessage(connectedSocket);

			pi_lock_mutex(blistMutex);
			details.requestingIP = getRemoteIPAddress(connectedSocket);

			resourceList *selectedBrokers = selectBroker(details);

			sendBResponseMessage(connectedSocket, selectedBrokers);
			if (selectedBrokers != NULL) {

				free(selectedBrokers->resources);
				free(selectedBrokers);
			}
			pi_release_mutex(blistMutex);
//			printf("Number of Requests: %i\n", numberOfReq);
//			fflush(stdout);
		} else
			puts("Wrong message Type in bRequest Thread received.");

		pi_closesocket(connectedSocket);
	}
}

void tvmThread() {
	SOCKET tvmSocket = createSocket(brokerTvmManagementPort);
	SOCKET connectedSocket;

	while (true) {
		connectedSocket = listenAndAccept(tvmSocket, 10000);
		messageType mType = receiveProtocolHeader(connectedSocket);

		if (mType < 0) {
			puts("Error while receiving protocol header.");
			continue;
		}
		if (mType == vmUpMessage) {
			u_long recHost = receiveVMUpMessage(connectedSocket);
			pi_lock_mutex(blistMutex);
			increaseAvailableVMs(recHost);
			pi_release_mutex(blistMutex);

		} else if (mType == vmDownMessage) {
			pi_lock_mutex(blistMutex);
			u_long host = receiveVMDownMessage(connectedSocket);
			decreaseAvailableVMs(host);
			pi_release_mutex(blistMutex);
		} else
			puts("Wrong message Type in TVM Thread received.");

		pi_closesocket(connectedSocket);

	}
}

int main(void) {

	readConfigFile();
	InitializeSockets();

	time_t t;

	time(&t);
	srand((unsigned int) t);
	numberOfRA = 0;
	blistMutex = pi_create_mutex(FALSE);
	bList.first = NULL;

	totalAvailableVMs = 0;
	numberOfInstances = 0;
	bRequestInOut = 0;

	tmSendSocket = setupUDPSendSocket();
	setupAddress();

	pi_startthread(heartBeatThread, 0, NULL);
	pi_startthread(bRequestThread, 0, NULL);
	pi_startthread(tvmThread, 0, NULL);

	updateThread();

	return EXIT_SUCCESS;
}

void updateThread() {

	while (true) {
		pi_lock_mutex(blistMutex);
		cleanupBrokerList();
		printBrokerList(); //TODO: Remove
		pi_release_mutex(blistMutex);
		Sleep(2000);
	}
}
