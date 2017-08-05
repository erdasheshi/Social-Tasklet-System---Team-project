/*
 * Orchestration.h
 *
 *  Created on: 22.08.2014
 *      Author: Janick
 */

#ifndef ORCHESTRATION_H_
#define ORCHESTRATION_H_

#define RESULT_THREADS 1000

#include <sys/unistd.h>
#include <stdio.h>
#include <time.h>
#include <BrokerCommunication.h>
#include <BrokerList.h>
#include <limits.h>
#include <stdbool.h>
#include <stdlib.h>
#include <SocketInterface.h>
#include <TaskletMonitorProtocol.h>
#include <TaskletProtocol.h>
#include <TaskletUtil.h>
#include <windef.h>
#include <winsock2.h>
#include <WrapperClasses.h>

#include "TaskletList.h"
#include "TaskletVirtualMachineMonitor.h"

void startOrchestration(void* temp);
void setup();
void taskletWorkerThread(void *temp);
void taskletThread();
void factoryWorkerThread(void *connectedSocket);

void forwardToVM(tasklet* receivedTasklet);
void forwardToMyVM(tasklet* receivedTasklet);

void resultWorkerThread(void *temp);
void resultThread();
void tHeartBeatThread();
void reliableThread();
void deleteAndReinitiateTasklet(tasklet* tasklet, taskletList* list);
void checkForLostTasklets(taskletList* list);

bool forwardResults(tasklet* resultTasklet);

void requestListWorkerThread(void *temp);
void requestListThread();

void tSnapshotThread();
void tSnapshotWorkerThread(void *temp);

void startBenchmark();

clock_t benchmarkStartClock;
clock_t benchmarkEndClock;

pisemaphore reliableThreadSemaphore;

pimutex resultThreadListMutex;
typedef struct resultThreadInformation {
	int appIdentifier;
	u_long ip;
	int resultPort;
	SOCKET appSocket;
	pimutex mutex;
} resultThreadInformation;

resultThreadInformation* resultThreads[RESULT_THREADS];

#endif /* ORCHESTRATION_H_ */

