/*
 * taskletlist->c
 *
 *  Created on: 04.11.2014
 *      Author: Janick
 */

#include "../header/TaskletList.h"

void initializeTaskletList(taskletList* list) {

	list->mutex = pi_create_mutex(FALSE);

	getMutex(list);

	list->first = NULL;
	list->last = NULL;

	releaseMutex(list);

}

int getSubID() {
	pi_lock_mutex(subIdMutex);
	int subId = currentSubID;
	pi_release_mutex(subIdMutex);
	return subId;
}
void incrementSubID() {
	pi_lock_mutex(subIdMutex);
	currentSubID++;
	pi_release_mutex(subIdMutex);
}

void getMutex(taskletList* list) {
	pi_lock_mutex(list->mutex);
}

void releaseMutex(taskletList* list) {
	pi_release_mutex(list->mutex);
}

bool addTasklet(taskletList* list, tasklet* newTasklet, int number) {

	taskletNode* newNode = malloc(sizeof(taskletNode));

	newNode->tasklet = newTasklet;
	newNode->previous = NULL;
	newNode->next = NULL;

	newNode->lastHeartbeat = clock();
	newNode->buffer = 2000;
	newNode->number = number;

	if (list->first == NULL) { //list is empty
		list->first = newNode;
		list->last = newNode;
	} else {
		list->last->next = newNode;
		newNode->previous = list->last;
		list->last = newNode;
	}

	return true;
}

bool addLocalTasklet(taskletList* list, tasklet* newTasklet, int number) {
	taskletNode* newNode = malloc(sizeof(taskletNode));

	newNode->tasklet = newTasklet;
	newNode->previous = NULL;
	newNode->next = NULL;

	newNode->lastHeartbeat = clock();
	newNode->buffer = 2000;
	newNode->number = number;

	if (list->first == NULL) { //list is empty
		list->first = newNode;
		list->last = newNode;
	} else {
		newNode->next = list->first;
		list->first->previous = newNode;
		list->first = newNode;
	}
//	updateHeartBeat(&taskList, newTasklet->header.id);
	return true;

}

bool deleteTasklet(taskletList* list, id taskletID) {

	taskletNode* current = list->first;

	while (current != NULL) {
		if (isSimilar(&current->tasklet->header.id, &taskletID)) {

			if (current == list->first) {
				list->first = current->next;
			} else {
				current->previous->next = current->next;
			}

			if (current == list->last) {
				list->last = current->previous;
			} else {
				current->next->previous = current->previous;
			}

			freeTasklet(current->tasklet);
			free(current);
			break;
		}
		current = current->next;
	}

	return true;
}

bool decrementTasklet(taskletList* list, id taskletID) {

	taskletNode* current = list->first;

	while (current != NULL) {
		if (isSimilar(&current->tasklet->header.id, &taskletID)
				&& current->tasklet->header.id.executingIP
						== taskletID.executingIP) {

			if (current->number <= 1) {

				if (current == list->first) {
					list->first = current->next;
				} else {
					current->previous->next = current->next;
				}

				if (current == list->last) {
					list->last = current->previous;
				} else {
					current->next->previous = current->previous;
				}

				freeTasklet(current->tasklet);
				free(current);
			} else {
				current->number--;
			}
			break;
		}
		current = current->next;
	}

	return true;

}

tasklet* getTasklet(taskletList* list, id taskletID) {

	taskletNode* current = list->first;

	while (current != NULL) {
		if (isSimilar(&current->tasklet->header.id, &taskletID)) {

			return current->tasklet;
		}

		current = current->next;
	}

	return NULL;
}

void printTaskletList(taskletList* list) {

	printf("Current time: %-10lu\n", currentTime);

	puts("**********************************************************");

	int index = 0;

	getMutex(list);

	taskletNode *current = list->first;
	while (current != NULL) {
		printf("%-5d: ", index++);
		printTasklet(current->tasklet);
		printf("Number: %-2d HB:%-10lu buffer:%-10d expires:%-10lu\n",
				current->number, current->lastHeartbeat, current->buffer,
				current->lastHeartbeat + current->buffer);
		current = current->next;
	}

	releaseMutex(list);

	puts("**********************************************************");
	fflush(stdout);
}

bool updateHeartBeat(taskletList* list, id taskletID) {

	getMutex(list);
	printf("Received Heartbeat for Tasklet: %i\n", taskletID.serial);
	fflush(stdout);
	taskletNode* current = list->first;

	while (current != NULL) {
		if (isSimilar(&current->tasklet->header.id, &taskletID)
				&& current->tasklet->header.id.executingIP
						== taskletID.executingIP) {
			current->tasklet->header.id.evaluationValues.heartBeatCounter++;
			current->lastHeartbeat = clock();
			current->buffer = 2000;
		}
		current = current->next;
	}

	releaseMutex(list);
	return true;
}

requestDetails readDetails(tasklet *taskletWithDetails) {

	requestDetails details;
	if (taskletWithDetails->qocParameter->qocSpeed != NULL) {
		details.minimumSpeed = arrayToFloat(
				&taskletWithDetails->qocParameter->qocSpeed->parameters[1]);
	} else {
		details.minimumSpeed = 5000.0;
	}

	if (taskletWithDetails->qocParameter->qocRemote != NULL) {
		details.isRemote = true;
	} else {
		details.isRemote = false;
	}

	if (taskletWithDetails->qocParameter->qocRedundancy != NULL) {
		details.requestedInstances =
				arrayToInt(
						&taskletWithDetails->qocParameter->qocRedundancy->parameters[1]);
	} else {
		details.requestedInstances = 1;
	}

	if (taskletWithDetails->qocParameter->qocReplication != NULL) {
		details.requestedNumber =
				arrayToInt(
						&taskletWithDetails->qocParameter->qocReplication->parameters[1]);
	} else {
		details.requestedNumber = 1;
	}
	return details;

}

bool forwardToBroker(tasklet* taskletToForward) {

	requestDetails details = readDetails(taskletToForward);

	int numberOfTasklets = maximum(details.requestedInstances,
			details.requestedNumber);

	tLogMessage(taskletToForward, notdefined, mp_beforeBrokerRequest, role_mw,
			-1);
	printf("Last words\n");
	fflush(stdout);
	resourceList* assignedBroker = requestBroker(details);

	tLogMessage(taskletToForward, notdefined, mp_afterBrokerRequest, role_mw,
			-1);

	if (assignedBroker == NULL) {
		assignedBroker = malloc(sizeof(resourceList));
		assignedBroker->length = 0;
		assignedBroker->resources = NULL;
	}

	int i;
	for (i = 0; i < assignedBroker->length; i++) {
		printf("%-2d: %-10s %-3d ", i,
				u_longToCharIP(assignedBroker->resources[i].ip),
				assignedBroker->resources[i].vms);
	}

	int instance;
	int taskletsSent = 0;

	if (assignedBroker->length > 0) {
		printf("\n");
		fflush(stdout);

		resetInterruptTimer();
		for (instance = 0; taskletsSent < numberOfTasklets; instance++) {

			if (assignedBroker->resources[instance].vms <= 0)
				continue;
			if (instance >= assignedBroker->length)
				break;

			//if replication, update qocs
			if (taskletToForward->qocParameter->qocReplication != NULL) {
				updateReplicationQoC(taskletToForward,
						assignedBroker->resources[instance].vms);
			}
			//if redundancy, update qocs TODO: check
			if (taskletToForward->qocParameter->qocRedundancy != NULL) {
				updateRedundancyQoC(taskletToForward, 1);
			}

			sendTForwardMessage(assignedBroker->resources[instance].ip, 54321,
					taskletToForward);
			tLogMessage(taskletToForward, tForwardMessage,
					mp_orchestrationForwardsTaskletToOrchestration, role_mw,
					-1);

			taskletsSent += assignedBroker->resources[instance].vms;
			if (taskletToForward->qocParameter->qocReliable != NULL) {

				taskletToForward->header.id.executingIP =
						assignedBroker->resources[instance].ip; //TODO: move one line up? (JE)

				getMutex(&taskList);

				for (i = 0; i < assignedBroker->resources[instance].vms; i++) {
					tasklet* copy = copyTasklet(taskletToForward);

					updateRedundancyQoC(copy, 1);

					updateReplicationQoC(copy, 1);

					addTasklet(&taskList, copy, 1);

					taskletToForward->header.id.replicationID++;

				}

				releaseMutex(&taskList);

			} else {

				taskletToForward->header.id.replicationID +=
						assignedBroker->resources[instance].vms;

			}
			//taskletToForward->header.id.replicationID += assignedBroker->resources[instance].vms;
		}
	} else {
		printf("BADING!!!!!!!!2\n");
		fflush(stdout);
		increaseInterruptTimer();
	}
	printf("BADING!!!!!!!!3\n");
	fflush(stdout);
	if (taskletsSent < numberOfTasklets) {
		if (taskletToForward->qocParameter->qocReliable != NULL) {
			updateRedundancyQoC(taskletToForward,
					numberOfTasklets - taskletsSent);
			updateReplicationQoC(taskletToForward,
					numberOfTasklets - taskletsSent);

			getMutex(&requestList);

			addTasklet(&requestList, taskletToForward,
					numberOfTasklets - taskletsSent);

			releaseMutex(&requestList);
			taskletToForward->header.id.subserial++;
			tLogMessage(taskletToForward, tForwardMessage, mp_requestQueueIn,
					role_mw, -1);
			pi_release_semaphore(requestListSemaphore);
		} else {
			int i;
			for (i = 0; i < numberOfTasklets - taskletsSent; i++) {
				tLogMessage(taskletToForward, tForwardMessage,
						mp_dropWhileForwarding, role_mw, -1);
				taskletToForward->header.id.replicationID++;
			}

			freeTasklet(taskletToForward);
		}
	} else {
		printf("BADING!!!!!!!!4\n");
		fflush(stdout);
		freeTasklet(taskletToForward);
	}

	free(assignedBroker->resources);
	free(assignedBroker);

	return true;
}

void updateReplicationQoC(tasklet* taskletToChange, int newValue) {

	if (taskletToChange->qocParameter->qocReplication != NULL) {

		char temp[4];
		intToArray(newValue, temp);

		taskletToChange->qocParameter->qocReplication->parameters[1] = temp[3];
		taskletToChange->qocParameter->qocReplication->parameters[2] = temp[2];
		taskletToChange->qocParameter->qocReplication->parameters[3] = temp[1];
		taskletToChange->qocParameter->qocReplication->parameters[4] = temp[0];
	}
}

void updateRedundancyQoC(tasklet* taskletToChange, int newValue) {

	if (taskletToChange->qocParameter->qocRedundancy != NULL) {

		char temp[4];
		intToArray(newValue, temp);

		taskletToChange->qocParameter->qocRedundancy->parameters[1] = temp[3];
		taskletToChange->qocParameter->qocRedundancy->parameters[2] = temp[2];
		taskletToChange->qocParameter->qocRedundancy->parameters[3] = temp[1];
		taskletToChange->qocParameter->qocRedundancy->parameters[4] = temp[0];
	}

}

int readHeapLengthFromSnapShot(taskletSnapshot *tss, int level, int base) {
	int val;
	memcpy(&val, &tss->heapSpace[level][base][1], 4);
	return val;
}

taskletSnapshot* copyTaskletSnapshot(taskletSnapshot *from, int heaplevels,
		int stacksize, int intermediateResultsLength) {

	taskletSnapshot* to = initTaskletSnapshot();
	to->baseAdr = from->baseAdr;
	to->countInstr = from->countInstr;
	to->fArg1 = from->fArg1;
	to->fArg2 = from->fArg2;
	to->instantiated = from->instantiated;
	to->numofresults = from->numofresults;
	to->prgCount = from->prgCount;
	to->tmp = from->tmp;
	to->top = from->top;
	to->intervalSnapshot = from->intervalSnapshot;

	to->stack = malloc(stacksize * sizeof(int));
	memcpy(to->stack, from->stack, stacksize * sizeof(int));

	to->intermediateResults = malloc(intermediateResultsLength * sizeof(char));
	memcpy(to->intermediateResults, from->intermediateResults,
			intermediateResultsLength * sizeof(char));

	to->heapSpaceEntries = malloc(heaplevels * sizeof(int));
	memcpy(to->heapSpaceEntries, from->heapSpaceEntries,
			heaplevels * sizeof(int));

	int i, j;

	to->heapSpace = malloc(heaplevels * sizeof(char*));

	for (i = 0; i < heaplevels; ++i) {
		to->heapSpace[i] = malloc(to->heapSpaceEntries[i] * sizeof(char*));
		for (j = 0; j < to->heapSpaceEntries[i]; ++j) {
			to->heapSpace[i][j] = malloc(
					readHeapLengthFromSnapShot(from, i, j) + 5);
			memcpy(to->heapSpace[i][j], from->heapSpace[i][j],
					readHeapLengthFromSnapShot(from, i, j) + 5);
		}
	}

	return to;
}

tasklet* copyTasklet(tasklet* originalTasklet) {
	tasklet* newTasklet = initTasklet();

	newTasklet->header = originalTasklet->header;

	newTasklet->taskletcode = malloc(originalTasklet->header.lengthOfCode);
	memcpy(newTasklet->taskletcode, originalTasklet->taskletcode,
			originalTasklet->header.lengthOfCode);

	newTasklet->qocs = malloc(originalTasklet->header.lengthOfQocs);
	memcpy(newTasklet->qocs, originalTasklet->qocs,
			originalTasklet->header.lengthOfQocs);

	newTasklet->results = malloc(originalTasklet->header.lengthOfResults);
	memcpy(newTasklet->results, originalTasklet->results,
			originalTasklet->header.lengthOfResults);

	newTasklet->constPool = malloc(originalTasklet->header.lengthOfConstPool);
	memcpy(newTasklet->constPool, originalTasklet->constPool,
			originalTasklet->header.lengthOfConstPool);

	resolveQocArray(newTasklet);

	if (originalTasklet->tSnapshot != NULL)
		if (originalTasklet->tSnapshot->instantiated == true)
			newTasklet->tSnapshot = copyTaskletSnapshot(
					originalTasklet->tSnapshot,
					originalTasklet->header.heapLevels,
					originalTasklet->header.stacksize,
					originalTasklet->header.intermediateResultsLength);

//	printf("New Tasklet created: %-2d\n", newTasklet->header.id.serial);
//	fflush(stdout);

	return newTasklet;
}

void increaseInterruptTimer() {
	pi_lock_mutex(interruptTimerMutex);

	if (interruptTimer > 250)
		return;
	interruptTimer += 25;
	pi_release_mutex(interruptTimerMutex);
}

void resetInterruptTimer() {
	pi_lock_mutex(interruptTimerMutex);
	interruptTimer = 0;
	pi_release_mutex(interruptTimerMutex);
}

int readInterruptTimer() {
	int tmp;
	pi_lock_mutex(interruptTimerMutex);
	tmp = interruptTimer;
	pi_release_mutex(interruptTimerMutex);
	return tmp;
}
