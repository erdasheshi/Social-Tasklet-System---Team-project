/*
 * Util.h
 *
 *  Created on: 05.11.2014
 *      Author: Janick
 */

#ifndef TASKLETUTIL_H_
#define TASKLETUTIL_H_

#include "WrapperClasses.h"

#include <string.h>
#include <math.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <limits.h>

#define EMPTY_IP 0


typedef struct guid {
	int values[4];
} guid;

char path[1000];

u_long getRemoteIPAddress(SOCKET connectedSocket);
int arrayToInt(char array[]);
void convertEndian(char[4]);
void intToArray(int, char*);
int floatToInt(float);
float intToFloat(int);
float arrayToFloat(char[4]);
char* u_longToCharIP(u_long ip);
void readFilePath(int number);
int boolToInt(bool);
bool isSimilarGUID(guid id1, guid id2);
int maximum(int a, int b);
int minimum(int a, int b);

#endif /* SRC_HEADER_UTIL_H_ */
