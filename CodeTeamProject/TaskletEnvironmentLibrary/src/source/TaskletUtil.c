/*
 * Util.c
 *
 *  Created on: 05.11.2014
 *      Author: Janick
 */
#include "../header/TaskletUtil.h"

int arrayToInt(char array[4]) {

	char *arrayInverted = malloc(4);
	arrayInverted[0] = array[3];
	arrayInverted[1] = array[2];
	arrayInverted[2] = array[1];
	arrayInverted[3] = array[0];

	int value = 0;
	int i;
	for (i = 0; i < 4; i++) {
		int shift = (4 - 1 - i) * 8;
		value += (arrayInverted[i] & 0x000000FF) << shift;
	}

	return value;
}

void convertEndian(char val[4]) {
	char tmp[4];

	tmp[0] = val[0];
	tmp[1] = val[1];
	tmp[2] = val[2];
	tmp[3] = val[3];

	val[0] = tmp[3];
	val[1] = tmp[2];
	val[2] = tmp[1];
	val[3] = tmp[0];
}

u_long getRemoteIPAddress(SOCKET connectedSocket) {
	int len;
	SOCKADDR_IN sin;
	len = sizeof(sin);

	if (0 != getpeername(connectedSocket, (struct sockaddr *) &sin, &len)) {
		perror("getpeername");
		return 0;
	}

	return pi_inet_aton(sin);

}

char* u_longToCharIP(u_long ip) {
	struct in_addr addr;
	addr.s_addr = ip;
	char *dot_ip = inet_ntoa(addr);

	return dot_ip;
}

void intToArray(int input, char* output) {
	output[0] = (input >> 24) & 0xFF;
	output[1] = (input >> 16) & 0xFF;
	output[2] = (input >> 8) & 0xFF;
	output[3] = input & 0xFF;
}

int floatToInt(float value) {
	int result;
	memcpy(&result, &value, 4);
	return result;
}

float intToFloat(int value) {
	float result;
	memcpy(&result, &value, 4);
	return result;
}

float arrayToFloat(char value[4]) {
	float result;
	memcpy(&result, value, sizeof(float));
//	result = roundf(result * 10000) / 10000;
	return result;
}

void readFilePath(int number) {
	FILE *fptr;
	if (number == 1) {
		fptr = fopen("factory.txt", "r");
	} else if (number == 2) {
		fptr = fopen("vm.txt", "r");
	} else if (number == 3) {
		fptr = fopen("vmCorrupted.txt", "r");
	}

	if (fptr == NULL) {
		printf("Error! opening file");

	}

	fscanf(fptr, "%[^\n]", path);
	fclose(fptr);
}

int boolToInt(bool value) {
	if (value == true)
		return 1;
	else
		return 0;
}

bool isSimilarGUID(guid id1, guid id2) {
	bool similar = true;
	similar = similar && (id1.values[0] == id2.values[0]);
	similar = similar && (id1.values[1] == id2.values[1]);
	similar = similar && (id1.values[2] == id2.values[2]);
	similar = similar && (id1.values[3] == id2.values[3]);

	return similar;

}

int maximum(int a, int b) {
	if (a > b) {
		return a;
	}
	return b;
}

int minimum(int a, int b) {
	if (a < b) {
		return a;
	}
	return b;
}
