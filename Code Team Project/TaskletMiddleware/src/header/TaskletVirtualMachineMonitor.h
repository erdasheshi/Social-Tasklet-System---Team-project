/*
 * TaskletVirtualMachineMonitor.h
 *
 *  Created on: 27.08.2014
 *      Author: Dominik
 */

#ifndef TASKLETVIRTUALMACHINEMONITOR_H_
#define TASKLETVIRTUALMACHINEMONITOR_H_

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>
#include <stdint.h>

#include "SocketInterface.h"
#include "TVMMaintanenceProtocol.h"
#include "BrokerCommunication.h"

bool checkerror(long n, char* msg);
bool receiveinstruction();
void addtvm(int, SOCKET, SOCKET);
tvm* findtvm(int);
void spawnTVM();
void spawnCorruptedTVM();
void initialTVMspawn(int, float);
void runUI();
void killTVMOnPort(int);
void deletetvm(tvm*);
void runTVMManagementThread(void *id);
void runOrchThread(void *id);
void printtvms();
bool executeTaskletOnNextTVM(tasklet*);
bool executeTasklet(tasklet*, tvm*);
void updateTvmStatus(tvmStatus);
void pullTvmUpdates();
void killTVM(tvm *tvm);
void releaseTVM(int);
SOCKET tvmSocket;
void runVMMonitor(int, float);

typedef enum vm_request_type {
	new_tasklet = 0, status, terminate

} vm_request_type;
tvm *header;

#endif /* TASKLETVIRTUALMACHINEMONITOR_H_ */
