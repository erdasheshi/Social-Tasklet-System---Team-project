/*
 * TaskletList.h
 *
 *  Created on: 04.11.2014
 *      Author: Janick
 */

#ifndef TASKLETLIST_H_
#define TASKLETLIST_H_

#include "TaskletProtocol.h"
#include "BrokerCommunication.h"

typedef struct taskletNode taskletNode;
struct taskletNode {

	tasklet* tasklet;
	taskletNode *previous;
	taskletNode *next;
	clock_t lastHeartbeat;
	int buffer;
	int number;
	u_long executingIP;
};

typedef struct taskletList {
	pimutex mutex;
	taskletNode *first;
	taskletNode *last;

} taskletList;

int currentSubID;
pimutex subIdMutex;
taskletList taskList;
taskletList executionList;
taskletList requestList;
pisemaphore requestListSemaphore;
pimutex interruptTimerMutex;

int interruptTimer;

clock_t currentTime;

int getSubID();
void incrementSubID();

void getMutex(taskletList* list);
void releaseMutex(taskletList* list);
void initializeTaskletList(taskletList* list);
bool addTasklet(taskletList* list, tasklet* newTasklet, int number);
bool addLocalTasklet(taskletList* list, tasklet* newTasklet, int number);
bool deleteTasklet(taskletList* list, id taskletID);
bool decrementTasklet(taskletList* list, id taskletID);
tasklet* getTasklet(taskletList* list, id taskletID);
void printTaskletList(taskletList* list);
bool updateHeartBeat(taskletList* list, id taskletID);
requestDetails readDetails(tasklet *taskletWithDetails);
bool forwardToBroker(tasklet* taskletToForward);
void updateReplicationQoC(tasklet* taskletToChange, int newValue);
void updateRedundancyQoC(tasklet* taskletToChange, int newValue);
int readHeapLengthFromSnapShot(taskletSnapshot *tss, int level, int base);
taskletSnapshot* copyTaskletSnapshot(taskletSnapshot *from, int heaplevels,
		int stacksize, int intermediateResultsLength);
tasklet* copyTasklet(tasklet* originalTasklet);
void increaseInterruptTimer();
void resetInterruptTimer();
int readInterruptTimer();
#endif /* TASKLETLIST_H_ */
