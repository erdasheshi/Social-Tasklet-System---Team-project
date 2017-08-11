/*
 * BrokerList.h
 *
 *  Created on: 21.01.2015
 *      Author: Janick
 */

#ifndef BROKERLIST_H_
#define BROKERLIST_H_

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <time.h>

#include "TaskletMonitorProtocol.h"

pimutex blistMutex;

int totalAvailableVMs;
int bRequestInOut;

typedef struct broker broker;
struct broker {
	u_long ip;
	long lastHeartbeat;
	int availableVMs;
	float benchmark;
	broker *next;
};

typedef struct brokerList brokerList;
struct brokerList {
	broker* first;
};
brokerList bList;

typedef struct requestDetails {
	bool isRemote;
	int requestedNumber;
	int requestedInstances;
	float minimumSpeed;
	u_long requestingIP;
	int cost;
	int privacy;

} requestDetails;

typedef struct brokerResource {
	u_long ip;
	int vms;
} brokerResource;

typedef struct resourceList {
	int length;
	brokerResource *resources;
} resourceList;

void addBroker(broker* brokerToAdd);
bool insertBroker(u_long ip);
resourceList* selectBroker(requestDetails details);
void printBroker(broker* brokerToPrint);
void printBrokerList();
broker* findBroker(broker* brokerToFind);
broker getNextBroker(broker current);
broker* getBrokerByIndex(int index);
broker* getBrokerByIP(u_long brokerIP);
void increaseAvailableVMs(u_long brokerIP);
void decreaseAvailableVMs(u_long brokerIP);
bool deleteBroker(broker* brokerToDelete);
void cleanupBrokerList();
void updateBenchmark(u_long ip, float benchmark);

int numberOfInstances;
int numberOfRA;
#endif /* BROKERLIST_H_ */
