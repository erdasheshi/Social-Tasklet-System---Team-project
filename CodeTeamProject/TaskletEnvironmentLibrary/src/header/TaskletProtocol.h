/*
 * TaskletProtocol.h
 *
 *  Created on: 30.10.2014
 *      Author: Janick
 */
#ifndef TASKLETPROTOCOL_H_
#define TASKLETPROTOCOL_H_

#include <stdio.h>
#include <stdbool.h>
#include <math.h>
#include <time.h>
#include <sys/time.h>
#include <inttypes.h>

#include "TaskletUtil.h"
#include "TaskletMonitorProtocol.h"

#define MAGIC 12345
#define protocolVersion 1

//#define traderHost "134.155.48.170"
//#define traderHost "134.155.51.181"
//#define traderHost "134.155.56.119"
//#define traderHost "134.155.3.28"
//#define traderHost "54.69.219.153"
//#define traderHost "127.0.0.1"
//#define traderHost "134.155.49.129"

#define defaultBrokerIP "127.0.0.1"
#define defaultMonitorIP "127.0.0.1"

#define traderPort  49129
#define orchestrationPort 54322
#define brokerRequestPort 49129
#define brokerHeartbeatPort 34123
#define brokerTvmManagementPort 63667
#define snapShotPort 33662

char brokerIP[16];
char monitorIP[16];
int initialTVMs;
int timeout;
int deviceID;
u_long myIP;
typedef enum vmm_instruction {
	new_vm_instr = 0, tasklet_result_instr = 1, forward_tasklet = 2

} vmm_instruction;

typedef enum messageType {
	instanceStartMessage = 0,
	instanceStopMessage,
	vmStartMessage,
	vmStopMessage,
	taskletStartMessage,
	taskletStopMessage,
	iRequestMessage,
	iResultMessage,
	iResendRequestMessage,
	iByteCodeRequestMessage,
	iCodeDebugMessage,
	guidMessage,
	tExecuteMessage,
	tResultMessage,
	tForwardMessage,
	mTvmStatusMessage,
	mTvmJoinMessage,
	mTvmRequestStatusMessage,
	mTvmTerminationMessage,
	bHeartbeatMessage,
	bIPMessage,
	bRequestMessage,
	bResponseMessage,
	vmUpMessage,
	vmDownMessage,
	tHeartBeatMessage,
	benchmarkMessage,
	dropTaskletMessageLocal,
	notdefined,
	tSnapshotMessage,
	mTvmCancelMessage,
	mTvmSnapshotRequestAndStopMessage,
	mTvmContinueMessage,
	mTvmPauseMessage

} messageType;

typedef struct instruction {
	int f, l, a;
} instruction;

typedef struct protocolHeader {
	int magic;
	int version;
	messageType messageType;
} protocolHeader;

typedef struct monitorMessage {
	protocolHeader header;
	u_long ip;
	int port;
	u_long host;
	u_int serial;
	u_int subserial;
} monitorMessage;

typedef struct evalSet {
	int intermediateComp;
	int finalComp;
	int retryCounter;
	int heartBeatCounter;
	int hotRetryCounter;
} evalSet;

typedef struct id {
	u_long ip;
	int port;
	int serial;
	u_int proxySerial;
	int resultHandle;
	int subserial;
	int replicationID;
	int sessionID;
	int trialID;
	u_long executingIP;
	evalSet evaluationValues;
} id;

typedef struct idMessage {
	protocolHeader header;
	id taskletID;
} idMessage;

/*
 * Interface request header.
 * Used to send tasklet requests from library to factory.
 */
typedef struct iRqHeader {
	int port;
	int serial;
	u_int proxySerial;
	int resultHandle;
	int sessionID;
	int trialID;
	int lengthOfCode;
	int lengthOfQocs;
	int lengthOfParameters;
} iRqHeader;

/*
 * Interface result header.
 * Used to send results from local broker to library.
 */

typedef struct iResHeader {
	int ip;
	int port;
	int serial;
	int proxySerial;
	int resultHandle;
	int subserial;
	int replicationID;
	int sessionID;
	int trialID;
	int executingHost;
	int resultLength;

	int intermediateComp;
	int finalComp;
	int retryCounter;
	int heartBeatCounter;
	int hotRetryCounter;
} iResHeader;

/*
 * Tasklet Execution header.
 * Used to send Tasklets from TVMM to TVM.
 *
 */

typedef struct tExHeader {
	id id;
	int lengthOfCode;
	int lengthOfQocs;
	int lengthOfConstPool;
	int stacksize;
	int heapLevels;
	int intermediateResultsLength;
} tExHeader;

/*
 * Tasklet Result header.
 * Used to send results from VM/broker to broker.
 *
 */

typedef struct tResHeader {
	id id;
	int resultsLength;
	int tvmId;
} tResHeader;

/*
 * Tasklet Forward header.
 * Used to forward results from factory/broker to broker.
 *
 */

typedef struct tFwHeader {
	id id;
	int lengthOfCode;
	int lengthOfQocs;
	int lengthOfConstPool;
	int stacksize;
	int heapLevels;
	int intermediateResultsLength;
} tFwHeader;

/*
 * Tasklet Snapshot Message header.
 * Used to forward Tasklets snapshots to resource consumer for reallocation
 * or to Tasklet providers to continue the computation.
 *
 *
 */

typedef struct tSnHeader {
	id id;
	int stacksize;
	int heapLevels;
	int intermediateResultsLength;
} tSnHeader;

typedef struct taskletHeader {
	id id;
	int lengthOfCode;
	int lengthOfQocs;
	int lengthOfResults;
	int lengthOfConstPool;
	int stacksize;
	int heapLevels;
	int intermediateResultsLength;
} taskletHeader;

typedef enum qocCategory {
	local = 1,
	remote,
	speed,
	reliable,
	proxy,
	redundancy,
	replication,
	migration,
	cost,
	privacy
} qocCategory;

typedef struct singleQoc {
	qocCategory category;
	int length;
	char* parameters;
} singleQoc;

typedef struct qocDetails {
	singleQoc* qocLocal;
	singleQoc* qocRemote;
	singleQoc* qocReliable;
	singleQoc* qocSpeed;
	singleQoc* qocProxy;
	singleQoc* qocRedundancy;
	singleQoc* qocReplication;
	singleQoc* qocMigration;
	singleQoc* qocCost;
	singleQoc* qocPrivacy;
} qocDetails;

//With or without header?
//typedef struct taskletSnapshotHeader {
//bool instantiated;
//int numofresults;
//int countInstr;
//int prgCount;
//int baseAdr;
//int top;
//int tmp;
//float fArg1;
//float fArg2;
//} taskletSnapshotHeader;

typedef struct taskletSnapshot {
	bool instantiated;
	int *stack;
	int *heapSpaceEntries;
	char ***heapSpace;
	char *intermediateResults;
	int numofresults;
	int countInstr;
	int prgCount;
	int baseAdr;
	int top;
	int tmp;
	float fArg1;
	float fArg2;
	bool intervalSnapshot;
} taskletSnapshot;

typedef struct tasklet {
	taskletHeader header;
	instruction *taskletcode;
	char *qocs;
	char *results;
	char *constPool;
	qocDetails* qocParameter;
	taskletSnapshot* tSnapshot;
} tasklet;

/*
 * ########################################################################################################################
 * ######################################## Methods #######################################################################
 * ########################################################################################################################
 */
//Struct Init methods
tasklet* initTasklet();
qocDetails* initQocDetails();
singleQoc* initSingleQoC();
taskletSnapshot* initTaskletSnapshot();
int calculateHeapSize(int levels, int* levelsizes, char*** space);
void readConfigFile();
tasklet* receiveIRequestMessage(SOCKET receivingSocket, messageType messageType);
tasklet* receiveIByteCodeRequestMessage(SOCKET receivingSocket,
		messageType messageType);
tasklet* receiveIResultMessage(SOCKET receivingSocket);
tasklet* receiveTExecuteMessage(SOCKET receivingSocket);
tasklet* receiveTResultMessage(SOCKET receivingSocket, int *tvmId);
tasklet* receiveTForwardMessage(SOCKET receivingSocket);
tasklet* receiveTSnapshotMessage(SOCKET receivingSocket);
void receiveTaskletPayload(SOCKET receivingSocket, tasklet* tasklet);
void receiveTaskletSnapshotPayload(SOCKET receivingSocket, tasklet* tastklet);

bool sendIResultMessage(SOCKET sendingSocket, tasklet* tasklet);
bool sendIRequestMessage(SOCKET sendingSocket, tasklet* tasklet,
		messageType mType);
bool sendIByteCodeRequestMessage(SOCKET sendingSocket, tasklet* tasklet);
bool sendTExecuteMessage(SOCKET sendingSocket, tasklet* tasklet);
bool sendTResultMessage(SOCKET sendingSocket, tasklet* tasklet, int tvmId);
bool sendTForwardMessage(u_long host, int port, tasklet* tasklet);
bool sendTSnapshotMessage(u_long host, int port, tasklet* tasklet);
bool sendTaskletSnapshotPayload(SOCKET sendingSocket, tasklet* tasklet,
		int stacksize, int heapLevels, int intermediateResultsLength);
int readElementLengthFromSnapshot(int level, int base, char*** space);
void sendTHeartBeatMessage(id taskletID);
id receiveTHeartBeatMessage(SOCKET heartBeatSocket);

messageType receiveProtocolHeader(SOCKET receivingSocket);
taskletHeader createTaskletHeader(u_long ip, int port, u_int serial,
		u_int proxySerial, int resultHandle, u_int subserial, int replicationID,
		int sessionID, int trialID, int lengthOfCode, int lengthOfQocs,
		int lengthOfResults, int lengthOfConstPool, int stacksize,
		int heaplevels, int intermediateResultLength, int intermediateComp,
		int finalComp, int retryCounter, int heartBeatCounter,
		int hotRetryCounter);

protocolHeader createProtocolHeader(messageType messageType);
bool isSimilar(id* id1, id* id2);
void printTasklet(tasklet* taskletToPrint);
void freeTasklet(tasklet* taskletToDelete);
void freeQoC(tasklet* taskletToDelete);
void freeSnapshotFromTasklet(tasklet* toDelete);

void resolveQocArray(tasklet* taskletWithQocs);

guid* receiveGUID(SOCKET connectedSocket);
guid* receiveGUIDMessage(SOCKET connectedSocket);

bool checkError(long, char*);

//---------------Logger Stuff---------------------------
typedef enum eval_roles {
	role_app, role_mw, role_tvm, role_notset
} eval_role;

typedef enum measure_points {
	mp_appSendsTasklet = 0,
	mp_factoryReceivesTasklet,
	mp_factoryForwardsTasklet,
	mp_orchestrationReceivesTaskletFromFactory,
	mp_beforeBrokerRequest,
	mp_afterBrokerRequest,
	mp_orchestrationForwardsTaskletToOrchestration,
	mp_orchestrationReceivesTaskletFromOrchestration,
	mp_tvmmForwardsTaskletToTVM,
	mp_tvmStartsExecution,
	mp_tvmEndsExecution,
	mp_orchestrationReceivesResultLocal,
	mp_orchestrationForwardsResultToOrchestration,
	mp_orchestrationReceivesResultRemote,
	mp_orchestrationForwardsResultToApp,
	mp_appReceivesResult,
	mp_dropWhileForwarding,
	mp_dropAtTVMM,
	mp_dropDuringTVM,
	mp_dropResult,
	mp_requestQueueIn,
	mp_requestQueueOut,
	mp_dropAtFactory,
	mp_notset
} measure_point;

typedef struct loggerObject {
	u_long tvmIP, hostIP;
	messageType mt;
	measure_point mp;
	eval_role role;
	int tvmPort, hostPort, tSerial, tSubserial, replicationID, sessionID,
			trialID, applicationID;
	long sec, msec, totalTime;
} loggerObject;

void initializeLogOutput(char*);
void createMutexForOutPut();
void tLogMessage(tasklet *tlet, messageType mt, measure_point mp,
		eval_role role, int tvmPort);
void loggerWorkerThread(void *temp);
pimutex mtex;
long startTime;
static const bool LOGGER = false;
FILE *evalFile;

#endif /* TASKLETPROTOCOL_H_ */

