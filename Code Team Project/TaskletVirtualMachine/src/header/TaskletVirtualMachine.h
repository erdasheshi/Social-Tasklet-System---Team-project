/*
 * TaskletVirtualMachine.h
 *
 *  Created on: 10.07.2014
 *      Author: Dominik
 */

#ifndef TASKLETVIRTUALMACHINE_H_
#define TASKLETVIRTUALMACHINE_H_

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <sys/time.h>
#include <math.h>
#include <limits.h>

#include "TaskletList.h"
#include "TaskletExecutionEnvironment.h"
#include "TVMSocketInterface.h"

static const bool DEBUG = false;
void resetVM();
void vmManagement();
void virtualMachine(void *id);
void interpret(bool cont);
void initializeVMStatus();
void addIntResult(int);
void addFloatResult(int);
void addBoolResult(char);
void addCharResult(char);
void addIntArrayResult(int, int);
void addFloatArrayResult(int, int);
void addBoolArrayResult(int, int);
void addCharArrayResult(int, int);
int readIntFromConstPool(int, int);
int readFloatFromConstPool(int, int);
int readCharFromConstPool(int, int);
int readBoolFromConstPool(int, int);
void deepCopyWithReallocation(int, int, int, int);
void incrementHeapValue(int, int, int);
void decrementHeapValue(int, int, int);
int readIntFromHeap(int, int, int);
int readFloatFromHeap(int, int, int);
int readCharFromHeap(int, int, int);
int readBoolFromHeap(int, int, int);
void writeIntIntoHeap(int, int, int, int);
void writeFloatIntoHeap(int, int, int, int);
void writeCharIntoHeap(int, int, int, char);
void writeBoolIntoHeap(int, int, int, char);
int readLengthFromConstantPool(int);
int readLengthFromHeap(int, int);
int createHeapLevel();
void deleteTopLevel();
void fillHeapEntryWithData(int, int, int);
void createHeapEntryOnLevel(int, int, lang_datatype);
void resizeStack(int);
void printStack(int);
void printHeap();
void printConstPool();
void printResults();
float genRandomFloat(float);
int genRandomInt(int);
char genRandomChar();
bool genRandomBool();
void createSnapshot();
void loadFromSnapshot();
void sendSnapshotIntervall(tasklet *taskletToSend);


int stacksize, *stack;

char ***heapSpace;
int *heapSpaceEntries, heapLevels;


int localBenchmark;

float fArg1, fArg2;
int prgCount, baseAdr, top, tmp, intermediateInstrCounter;
instruction *curInst;

#endif /* TASKLETVIRTUALMACHINE_H_ */
