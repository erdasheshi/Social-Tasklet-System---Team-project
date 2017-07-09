/*
 * BrokerList.c
 *
 *  Created on: 21.01.2015
 *      Author: Janick
 */
#include "../header/BrokerList.h"
//
bool insertBroker(u_long ip) {

	bool isNew = false;
	broker* brokerToInsert = getBrokerByIP(ip);

	if (brokerToInsert == NULL) {
		brokerToInsert = malloc(sizeof(broker));
		brokerToInsert->ip = ip;
		brokerToInsert->availableVMs = 0;
		brokerToInsert->benchmark = 999;
		addBroker(brokerToInsert);
		isNew = true;
	}

	brokerToInsert->lastHeartbeat = clock() / CLOCKS_PER_SEC;

	return isNew;
}

/*
 * Add a broker to the head of the list.
 */
void addBroker(broker* brokerToAdd) {

	brokerToAdd->next = bList.first;
	bList.first = brokerToAdd;

}

resourceList* selectBroker(requestDetails details) {

	resourceList* selected = malloc(sizeof(resourceList));
	int resourcesToSelect = maximum(details.requestedInstances, details.requestedNumber);
	selected->resources = malloc(sizeof(brokerResource));
	selected->length = 0;

	if (bList.first == NULL || totalAvailableVMs < 1) {
		return selected;
	}

	int numberSelected = 0;
	int attempts = 0;
	bool alreadySelected = 0;

	broker* currentBroker;
	broker* startBroker;

	bool speed;
	bool remote;
	bool capacity;

	currentBroker = getBrokerByIndex(rand() % numberOfInstances);
	startBroker = currentBroker;

	do {

		alreadySelected = 0;

		int i;
		for (i = 0; i < numberSelected; i++) {
			if (selected->resources[i].ip == currentBroker->ip) {
				attempts++;
				alreadySelected = 1;
			}
		}

		//TODO: Refactor (JE)
		if (alreadySelected) {
			currentBroker = currentBroker->next;
			if (currentBroker == startBroker) {
				break;
			}
			continue;
		}

		speed = currentBroker->benchmark <= details.minimumSpeed;
		remote = !(details.isRemote && (currentBroker->ip == details.requestingIP));
		capacity = currentBroker->availableVMs > 0;

		if (speed && remote && capacity) {

			selected->resources = realloc(selected->resources, sizeof(brokerResource) * (numberSelected + 1));

			selected->resources[numberSelected].ip = currentBroker->ip;
			if (details.requestedNumber > 1) {
				selected->resources[numberSelected].vms = minimum(resourcesToSelect, currentBroker->availableVMs);
			} else {
				selected->resources[numberSelected].vms = 1;
			}
			resourcesToSelect -= selected->resources[numberSelected].vms;
			totalAvailableVMs -= selected->resources[numberSelected].vms;
			currentBroker->availableVMs -= selected->resources[numberSelected].vms;
			numberSelected++;
			attempts = 0;
		}

		currentBroker = currentBroker->next;
		if (currentBroker == NULL) {
			currentBroker = bList.first;
		}
		if (currentBroker == startBroker) {
			break;
		}

		attempts++;

	} while (resourcesToSelect > 0 && attempts < 2000);

	selected->length = numberSelected;

	return selected;
}

/*
 * Get a broker at a given index
 */
broker* getBrokerByIndex(int index) {
	int counter = 0;

	broker *current = bList.first;

	while (current != NULL && counter++ < index) {
		current = current->next;
	}

	return current;
}

void printBroker(broker* brokerToPrint) {

	struct in_addr addr;
	addr.s_addr = brokerToPrint->ip;
	char *ip = inet_ntoa(addr);

	printf("Broker: %-15s \t %-3d \t %-8lu \t %-5f\n", ip, brokerToPrint->availableVMs, brokerToPrint->lastHeartbeat,
			brokerToPrint->benchmark);
	fflush(stdout);

}

broker* findBroker(broker* brokerToFind) {

	broker* current = bList.first;

	while (current != NULL) {
		if (current->ip == brokerToFind->ip) {
			return current;
		}
		current = current->next;
	}
	return current;
}

void increaseAvailableVMs(u_long brokerIP) {

	broker* current = getBrokerByIP(brokerIP);
	if (current != NULL) {
		current->availableVMs++;
		totalAvailableVMs++;
	}

}

void decreaseAvailableVMs(u_long brokerIP) {

	broker* current = getBrokerByIP(brokerIP);
	if (current != NULL) {
		current->availableVMs--;
		totalAvailableVMs--;
	}

}

broker* getBrokerByIP(u_long brokerIP) {

	broker* current = bList.first;

	while (current != NULL) {
		if (brokerIP == current->ip) {
			return current;
		}
		current = current->next;
	}

	return current;;

}

bool deleteBroker(broker* brokerToDelete) {

	if (bList.first == NULL) {
		return false;
	}
	if (bList.first->ip == brokerToDelete->ip) {
		bList.first = bList.first->next;
		totalAvailableVMs -= brokerToDelete->availableVMs;
		sendInstanceStopMessage(brokerToDelete->ip);
		free(brokerToDelete);
		return true;
	}

	broker *previous = bList.first;

	while (previous->next != NULL) {
		if (previous->next->ip == brokerToDelete->ip) {
			previous->next = previous->next->next;
			totalAvailableVMs -= brokerToDelete->availableVMs;
			sendInstanceStopMessage(brokerToDelete->ip);
			free(brokerToDelete);
			return true;
		}
		previous = previous->next;
	}
	return false;
}

void updateBenchmark(u_long ip, float benchmark) {

	broker* current = getBrokerByIP(ip);
	if (current != NULL) {
		current->benchmark = benchmark;
	}
}

void cleanupBrokerList() { //TODO make cleanup without running over broker list again in delete broker method

	long timestamp = clock() / CLOCKS_PER_SEC;
	printf("****** %-4i %-15lu\n", totalAvailableVMs, timestamp);
	fflush(stdout);

	broker *current = bList.first;
	broker *temp;

	while (current != NULL) {

		if (timestamp - current->lastHeartbeat > 10) {
			temp = current->next;
			deleteBroker(current);
			current = temp;
			numberOfInstances--;
		} else {
			current = current->next;
		}

	}

}

void printBrokerList() {

	broker* currentBroker = bList.first;

	while (currentBroker != NULL) {
		printBroker(currentBroker);
		currentBroker = currentBroker->next;
	}

}
