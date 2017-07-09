/*
 * TVMSocketInterface.h
 *
 *  Created on: 13.08.2014
 *      Author: Dominik
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>

//#include "TaskletList.h"
#include "TVMMaintanenceProtocol.h"
#include "SocketInterface.h"

//#define RECVBUF 15
#ifndef TVMSOCKETINTERFACE_H_
#define TVMSOCKETINTERFACE_H_

bool connectToVMM();
bool initializeSockets();
int receiveprogramOnTVM();
bool receiverequest();
void readprog(int*, long);
int startWinsock();
bool returnresult(bool drop);
void intToArray(int, char*);
bool checkerror(long, char*);
void addIntResult(int);
void addFloatResult(int);
int arrayToInt(char*);
bool returnPort();
long rc;

//Hearbeat stuff:
bool heartBeatSemaphore;
void vmTHeartBeatThread();

SOCKET instructionSocket, managementSocket, resultSocket, initSocket;
int instructionPort, managementPort, initPort;
SOCKADDR_IN addr, addr_inf;
int vmmport;
bool vm_running, management_running, interpreter_running;
messageType managementType;

int numofresults;
char *results, *constantPool;
instruction *bytecode;
tvmStatus localStatus;
int constantPoolSize, resultsize;
tasklet *currentTasklet;
bool newProg, hotMigrationEnabled, coldMigrationEnabled;
int coldMigrationInterval, localInstructionRatio, snapShotInstrThreshold;
//Evaluation Variables:
bool corrupt;
struct timeval t_begin, t_end;
int time_spent;
bool isDropped, explicitDrop;

#endif /* TVMSOCKETINTERFACE_H_ */
