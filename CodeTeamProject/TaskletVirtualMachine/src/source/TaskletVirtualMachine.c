/*
 ============================================================================
 Name        : TaskletVirtualMachine.c
 Author      : Dominik
 Version     :
 Copyright   : Your copyright notice
 Description : Hello VM!
 ============================================================================
 */

#include "../header/TaskletVirtualMachine.h"

unsigned long countInstr = 0;

bool done = true;

int main(int argc, char *argv[]) {
	time_t t;
	readConfigFile();
	managementType = mTvmSnapshotRequestAndStopMessage;
	snapShotInstrThreshold = 55363298;
	localInstructionRatio = 150000;
	currentTasklet = initTasklet();
	requestOwnIP();
	tmSendSocket = setupUDPSendSocket();
	setupAddress();
	corrupt = false;
	if (argc > 0) {
		if (strcmp(argv[1], "true") == 0) {
			corrupt = true;
		}
		if (strcmp(argv[1], "false") == 0) {
			corrupt = false;
		}
	}
	corrupt = false;
	vmmport = 33333;
	vm_running = management_running = interpreter_running = true;
	if (connectToVMM()) {
		sendVMUpMessage();
		if (LOGGER) {
			char str[80];
			char pTvm[6];
			strcpy(str, "Evaluation\\tvm_evaluation_");
			sprintf(pTvm, "%d_", initPort);
			strcat(str, pTvm);
			initializeLogOutput(str);
		}
		srand((unsigned) time(&t) * instructionPort);
		pi_startthread(virtualMachine, 0, NULL);
		vmManagement();
	}

	vm_running = false;

	char *ip = u_longToCharIP(myIP);
	sendVMStopMessage(inet_addr(ip), instructionPort);
	printf("VMM with id %d has been terminated...Bye bye", instructionPort);

	return 0;
}

void vmManagement() {
	messageType mt;
	do {
		printf("Waiting for Management Messages...\n");
		mt = receiveProtocolHeader(managementSocket);

		if (mt == mTvmRequestStatusMessage) {
			sendTVMStatusMessage(managementSocket, &localStatus);
		} else if (mt == mTvmTerminationMessage) {
			interpreter_running = vm_running = management_running = false;
			printf("Virtual Machine terminated!");
		} else if (mt == mTvmCancelMessage) {
			managementType = mTvmCancelMessage;
			interpreter_running = false;
		} else if (mt == mTvmSnapshotRequestAndStopMessage) {
			managementType = mTvmSnapshotRequestAndStopMessage;
			interpreter_running = false;
			done = false;
		} else if (mt == mTvmContinueMessage) {
			managementType = mTvmContinueMessage;
			interpreter_running = true;
		} else if (mt == mTvmPauseMessage) {
			managementType = mTvmPauseMessage;
			interpreter_running = false;
		} else {
			//TODO error unkown message type
			printf("Unkown message type received! Received MessageType: %d",
					mt);
		}
	} while (management_running);
}

void virtualMachine(void *id) {

	char *ip = u_longToCharIP(myIP);

	sendVMStartMessage(inet_addr(ip), instructionPort);
	while (vm_running) {

		resetVM();
		printf("*#*Send me more Tasklets! I'm hungry!\n");
		fflush(stdout);
		int reliable = receiveprogramOnTVM();
		printf("*#*Received Tasklet.\n");
		fflush(stdout);
		heartBeatSemaphore = true;
		if (reliable == 1) {
			printf("HeartBeatThread started.\n");
			fflush(stdout);
			pi_startthread(vmTHeartBeatThread, 0, NULL);
		}
		if (reliable == 2) {
			continue;
		}
		sendTaskletStartMessage(myIP, instructionPort,
				currentTasklet->header.id.ip, currentTasklet->header.id.serial,
				currentTasklet->header.id.subserial);

		gettimeofday(&t_begin, NULL);

		if (currentTasklet->tSnapshot->instantiated) {
			loadFromSnapshot(currentTasklet);
			interpret(true);
		} else {
			interpret(false);
		}
		gettimeofday(&t_end, NULL);

		time_spent = ((t_end.tv_sec - t_begin.tv_sec) * 1000.0)
				+ ((t_end.tv_usec - t_begin.tv_usec) / 1000.0);

		if (done) {
			printf("*#*Tasklet Executed.\n");
			fflush(stdout);

			if (currentTasklet->header.id.serial == 0) {
				localBenchmark = (int) time_spent;
			}
			localInstructionRatio = ((countInstr + intermediateInstrCounter)
					/ time_spent);

			printf("Treshold:%i\n", snapShotInstrThreshold);
			fflush(stdout);
//			}

			printf("Done in %i ms\n", time_spent);
			fflush(stdout);

			returnresult(false);
		} else {
			switch (managementType) {
			case mTvmCancelMessage:
				//TODO do something?
				printf("*#*Execution Canceled.\n");
				fflush(stdout);
				break;
			case mTvmSnapshotRequestAndStopMessage:
				interpreter_running = true;
				returnresult(true);
				if (explicitDrop && hotMigrationEnabled) {
					createSnapshot();
					currentTasklet->tSnapshot->intervalSnapshot = false;
					currentTasklet->header.id.evaluationValues.intermediateComp =
							time_spent;
					sendTSnapshotMessage(currentTasklet->header.id.ip,
					snapShotPort, currentTasklet);
					printf(
							"*#*Execution Stopped. Snapshot sent. TVM will be terminted.\n");
					fflush(stdout);
				}
//				vm_running = false;
				break;
			case mTvmContinueMessage:
				done = false;
				printf("*#*Execution Continued.\n");
				fflush(stdout);
//TODO
				break;
			case mTvmPauseMessage:
				printf("*#*Execution Paused.\n");
				fflush(stdout);
//TODO
				break;

			default:
				break;
			}
		}
		heartBeatSemaphore = false;
		sendTaskletStopMessage(myIP, instructionPort,
				currentTasklet->header.id.ip, currentTasklet->header.id.serial,
				currentTasklet->header.id.subserial);
	}
}

void resetVM() {
	int i, j;
	isDropped = false;
	if (rand() % 100 < 30)
		isDropped = true;

	if (isDropped) {
		if (rand() % 100 < 50) {
			explicitDrop = true;
			printf(
					"I'm running out of battery and my network connection becomes worse!\n");
			fflush(stdout);
		} else
			explicitDrop = false;
	}
	hotMigrationEnabled = coldMigrationEnabled = false;
	coldMigrationInterval = 0;
	intermediateInstrCounter = 0;
	newProg = false;
	resultsize = 0;
	numofresults = 0;
	stack = NULL;
//	sendVMUpMessage();
//	printf("vmUpMessage sent");
//	fflush(stdout);
	countInstr = 0;
	for (i = 0; i < heapLevels; ++i) {
		for (j = 0; j < heapSpaceEntries[i]; ++j) {
			free(heapSpace[i][j]);
		}
		free(heapSpace[i]);
	}
	free(heapSpace);
	free(heapSpaceEntries);
	heapSpace = NULL;
	heapSpaceEntries = NULL;
	heapLevels = 0;
	interpreter_running = true;
	freeTasklet(currentTasklet);

	results = malloc(1);
	done = true;
//	currentTasklet = initTasklet();
}

void sendSnapshotIntervall(tasklet *taskletToSend) {
	if (currentTasklet->header.id.serial == 0)
		return;
	createSnapshot();
	tasklet *currentSnapshot = copyTasklet(currentTasklet);
	sendTSnapshotMessage(currentSnapshot->header.id.ip, snapShotPort,
			currentSnapshot);
	freeTasklet(currentSnapshot);
}
void createSnapshot() {
	int i, j;
	struct timeval t_currentTime;
	freeSnapshotFromTasklet(currentTasklet);

	currentTasklet->tSnapshot = initTaskletSnapshot();
	currentTasklet->header.heapLevels = heapLevels;
	currentTasklet->header.stacksize = stacksize;
	currentTasklet->header.intermediateResultsLength = resultsize;
	currentTasklet->tSnapshot->instantiated = true;
	currentTasklet->tSnapshot->numofresults = numofresults;

	currentTasklet->tSnapshot->fArg1 = fArg1;
	currentTasklet->tSnapshot->fArg2 = fArg2;
	currentTasklet->tSnapshot->prgCount = prgCount;
	currentTasklet->tSnapshot->baseAdr = baseAdr;
	currentTasklet->tSnapshot->top = top;
	currentTasklet->tSnapshot->tmp = tmp;
	currentTasklet->tSnapshot->countInstr = countInstr
			+ intermediateInstrCounter;

	currentTasklet->tSnapshot->stack = malloc(sizeof(int) * stacksize);
	memcpy(currentTasklet->tSnapshot->stack, stack, sizeof(int) * stacksize);

	currentTasklet->tSnapshot->intermediateResults = malloc(
			sizeof(char) * resultsize);
	memcpy(currentTasklet->tSnapshot->intermediateResults, results,
			sizeof(char) * resultsize);

	currentTasklet->tSnapshot->heapSpaceEntries = malloc(
			sizeof(int) * heapLevels);
	memcpy(currentTasklet->tSnapshot->heapSpaceEntries, heapSpaceEntries,
			sizeof(int) * heapLevels);

	currentTasklet->tSnapshot->heapSpace = malloc(heapLevels * sizeof(char*));
	for (i = 0; i < heapLevels; ++i) {
		currentTasklet->tSnapshot->heapSpace[i] = malloc(
				heapSpaceEntries[i] * sizeof(char*));
		for (j = 0; j < heapSpaceEntries[i]; ++j) {
			currentTasklet->tSnapshot->heapSpace[i][j] = malloc(
					readLengthFromHeap(i, j) + 5);
			memcpy(currentTasklet->tSnapshot->heapSpace[i][j], heapSpace[i][j],
					readLengthFromHeap(i, j) + 5);
		}
	}
}

void loadFromSnapshot() {
	int i, j;
//	resetVM();
	heapLevels = currentTasklet->header.heapLevels;
	resultsize = currentTasklet->header.intermediateResultsLength;
	stacksize = currentTasklet->header.stacksize;
	numofresults = currentTasklet->tSnapshot->numofresults;

	countInstr = currentTasklet->tSnapshot->countInstr;

//	free(stack);
	stack = malloc(sizeof(int) * stacksize);
	memcpy(stack, currentTasklet->tSnapshot->stack, sizeof(int) * stacksize);

//	free(results);
	results = malloc(sizeof(char) * resultsize);
	memcpy(results, currentTasklet->tSnapshot->intermediateResults,
			sizeof(char) * resultsize);

	heapSpaceEntries = malloc(sizeof(int) * heapLevels);
	memcpy(heapSpaceEntries, currentTasklet->tSnapshot->heapSpaceEntries,
			sizeof(int) * heapLevels);

	heapSpace = malloc(heapLevels * sizeof(char*));
	for (i = 0; i < heapLevels; ++i) {
		heapSpace[i] = malloc(heapSpaceEntries[i] * sizeof(char*));
		for (j = 0; j < heapSpaceEntries[i]; ++j) {
			heapSpace[i][j] = malloc(
					readHeapLengthFromSnapShot(currentTasklet->tSnapshot, i, j)
							+ 5);
			memcpy(heapSpace[i][j], currentTasklet->tSnapshot->heapSpace[i][j],
					readHeapLengthFromSnapShot(currentTasklet->tSnapshot, i, j)
							+ 5);
		}
	}

	fArg1 = currentTasklet->tSnapshot->fArg1;
	fArg2 = currentTasklet->tSnapshot->fArg2;
	prgCount = currentTasklet->tSnapshot->prgCount;
	baseAdr = currentTasklet->tSnapshot->baseAdr;
	top = currentTasklet->tSnapshot->top;
	tmp = currentTasklet->tSnapshot->tmp;

	bytecode = currentTasklet->taskletcode;

	constantPool = currentTasklet->constPool;
	constantPoolSize = currentTasklet->header.lengthOfConstPool;

}

//--------------------------TL0 Interpreter----------------------------------

int base(int l) {
	int b1 = baseAdr;

	while (l > 0) {
		b1 = stack[b1];
		l--;
	}

	return b1;
}

void interpret(bool cont) {
	if (!cont) {
		countInstr = 0;
		stacksize = 50;

		resultsize = 0;
		stack = NULL;
		stack = calloc(stacksize, sizeof(int));
		memset(stack, 0, stacksize);

		bytecode = currentTasklet->taskletcode;
		constantPool = currentTasklet->constPool;
		constantPoolSize = currentTasklet->header.lengthOfConstPool;

		top = prgCount = stack[0] = stack[1] = stack[2] = stack[3] = 0;
		stack[4] = createHeapLevel();
		baseAdr = 0;
	}
	intermediateInstrCounter = 0;
	do {

		curInst = &bytecode[prgCount];
		prgCount++;
		switch (curInst->f) {
		case clit:
			top++;
			stack[top] = curInst->a;
			break;
		case clod:
			top++;
			stack[top] = stack[base(curInst->l) + curInst->a];
			break;
		case chilod:
			stack[top] = readIntFromHeap(stack[base(curInst->l) + 4],
					curInst->a, stack[top]);
			break;
		case chflod:
			stack[top] = readFloatFromHeap(stack[base(curInst->l) + 4],
					curInst->a, stack[top]);
			break;
		case chclod:
			stack[top] = readCharFromHeap(stack[base(curInst->l) + 4],
					curInst->a, stack[top]);
			break;
		case chblod:
			stack[top] = readBoolFromHeap(stack[base(curInst->l) + 4],
					curInst->a, stack[top]);
			break;
		case csto:
			stack[base(curInst->l) + curInst->a] = stack[top];
			top--;
			break;
		case chisto:
			writeIntIntoHeap(stack[base(curInst->l) + 4], curInst->a,
					stack[top - 1], stack[top]);
			top -= 2;
			break;
		case chfsto:
			writeFloatIntoHeap(stack[base(curInst->l) + 4], curInst->a,
					stack[top - 1], stack[top]);
			top -= 2;
			break;
		case chcsto:
			writeCharIntoHeap(stack[base(curInst->l) + 4], curInst->a,
					stack[top - 1], stack[top]);
			top -= 2;
			break;
		case chbsto:
			writeBoolIntoHeap(stack[base(curInst->l) + 4], curInst->a,
					stack[top - 1], stack[top]);
			top -= 2;
			break;
		case ccal:
			/**
			 * Read the number of parameters from the const pool
			 * create enough space before the return address...
			 * how is it possible to address the parameters?
			 */
			stack[top + 1] = base(curInst->l);
			stack[top + 2] = baseAdr;
			stack[top + 3] = prgCount;
			stack[top + 4] = 0;
			stack[top + 5] = createHeapLevel();
			baseAdr = top + 1;
			prgCount = curInst->a;
			break;
		case cpara:
			stack[baseAdr + 3] = curInst->a;
			break;
		case cint:
			top = top + curInst->a; //TODO change that to a realloc of the stack!
			break;
		case cjmp:
			prgCount = curInst->a;
			break;
		case cjpc:
			if (stack[top] == 0) {
				prgCount = curInst->a;
			}
			top--;
			break;
		case clen:
			top++;
			stack[top] = readLengthFromHeap(stack[base(curInst->l) + 4],
					curInst->a);
			break;
		case cinroot:
			stack[top - 1] = floatToInt(
					(float) pow(stack[top - 1], 1.0 / stack[top]));
			top--;
			break;
		case cfnroot:
			stack[top - 1] = floatToInt(
					(float) pow(intToFloat(stack[top - 1]),
							1.0 / intToFloat(stack[top])));
			top--;
			break;
		case cftan:
			stack[top] = floatToInt(tan(intToFloat(stack[top])));
			break;
		case citan:
			stack[top] = floatToInt(tan(stack[top]));
			break;
		case cfcos:
			stack[top] = floatToInt(cos(intToFloat(stack[top])));
			break;
		case cicos:
			stack[top] = floatToInt(cos(stack[top]));
			break;
		case cfsin:
			stack[top] = floatToInt(sin(intToFloat(stack[top])));
			break;
		case cisin:
			stack[top] = floatToInt(sin(stack[top]));
			break;
		case crnd:
			switch (curInst->a) {
			case dt_float:
				stack[top] = floatToInt(genRandomFloat(intToFloat(stack[top])));
				break;
			case dt_int:
				stack[top] = genRandomInt(stack[top]);
				break;
			}
			break;
		case cdtrnd:
			switch (curInst->a) {
			case dt_float:
				stack[top] = floatToInt(genRandomFloat(intToFloat(INT_MAX)));
				break;
			case dt_int:
				stack[top] = genRandomInt(INT_MAX);
				break;
			case dt_bool:
				stack[top] = (int) genRandomBool();
				break;
			case dt_char:
				stack[top] = (int) genRandomChar();
				break;
			}
			break;
		case cipow:
			stack[top - 1] = floatToInt(
					(float) pow(stack[top - 1], stack[top]));
			top--;
			break;
		case cfpow:
			stack[top - 1] = floatToInt(
					(float) pow(intToFloat(stack[top - 1]),
							intToFloat(stack[top])));
			top--;
			break;
		case clog:
			if (curInst->a == dt_int)
				stack[top] = floatToInt(log(stack[top]));
			else if (curInst->a == dt_float)
				stack[top] = floatToInt(log(intToFloat(stack[top])));
			break;
		case clog2:
			if (curInst->a == dt_int)
				stack[top] = floatToInt(log2(stack[top]));
			else if (curInst->a == dt_float)
				stack[top] = floatToInt(log2(intToFloat(stack[top])));
			break;
		case clog10:
			if (curInst->a == dt_int)
				stack[top] = floatToInt(log10(stack[top]));
			else if (curInst->a == dt_float)
				stack[top] = floatToInt(log10(intToFloat(stack[top])));
			break;
		case cexp:
			if (curInst->a == dt_int)
				stack[top] = floatToInt(exp(stack[top]));
			else if (curInst->a == dt_float)
				stack[top] = floatToInt(exp(intToFloat(stack[top])));
			break;
		case cincr:
			stack[base(curInst->l) + curInst->a]++;
			break;
		case cdecr:
			stack[base(curInst->l) + curInst->a]--;
			break;
		case chincr:
			incrementHeapValue(stack[base(curInst->l) + 4], curInst->a,
					stack[top]);
			top--;
			break;
		case chdecr:
			decrementHeapValue(stack[base(curInst->l) + 4], curInst->a,
					stack[top]);
			top--;
			break;
		case chinit:
			printf("Heap Init here!");
			fillHeapEntryWithData(stack[base(curInst->l) + 4], curInst->a,
					stack[top]);
			top--;
			break;
		case cresheap:
			if (curInst->a == dt_float_array || curInst->a == dt_int_array) {
				createHeapEntryOnLevel(stack[base(curInst->l) + 4],
						4 * stack[top], curInst->a);
			} else if (curInst->a == dt_bool_array
					|| curInst->a == dt_char_array)
				createHeapEntryOnLevel(stack[base(curInst->l) + 4], stack[top],
						curInst->a);
			top--;
			break;
		case carraydc:
			deepCopyWithReallocation(stack[base(stack[top - 1]) + 4],
					stack[top], stack[base(curInst->l) + 4], curInst->a);
			top -= 2;
			break;
//		case cincrhl:
//			createHeapLevel();
//			break;
		case copr:
			switch (curInst->a) {
			case oret:
				tmp = baseAdr - (stack[baseAdr + 3]);
				if (curInst->l == 1)
					stack[tmp] = stack[top];
				top = baseAdr - 1;
				prgCount = stack[top + 3];
				baseAdr = stack[top + 2];
				top = tmp;
				deleteTopLevel();
				break;
			case onot: //TODO not only for expression that have an boolean value?
				break;
			case omod:
				top--;
				stack[top] = stack[top] % stack[top + 1];
				break;
			case oineg:
				stack[top] = -stack[top];
				break;
			case ofneg:
				memcpy(&fArg1, &stack[top], 4);
				fArg1 = -fArg1;
				memcpy(&stack[top], &fArg1, 4);
				break;
			case ocneg:
				stack[top] = -stack[top];
				break;
			case oiplus:
				top--;
				stack[top] = stack[top] + stack[top + 1];
				break;
			case ofplus:
				top--;
				memcpy(&fArg1, &stack[top], 4);
				memcpy(&fArg2, &stack[top + 1], 4);
				fArg1 = fArg1 + fArg2;
				memcpy(&stack[top], &fArg1, 4);
				break;
			case ocplus:
				top--;
				stack[top] = stack[top] + stack[top + 1];
				stack[top] = stack[top] % 255;
				break;
			case oiminus:
				top--;
				stack[top] = stack[top] - stack[top + 1];
				break;
			case ofminus:
				top--;
				memcpy(&fArg1, &stack[top], 4);
				memcpy(&fArg2, &stack[top + 1], 4);
				fArg1 = fArg1 - fArg2;
				memcpy(&stack[top], &fArg1, 4);
				break;
			case ocminus:
				top--;
				stack[top] = stack[top] - stack[top + 1];
				if (stack[top] < 0)
					stack[top] = 256 - stack[top];
				break;
			case oitimes:
				top--;
				stack[top] = stack[top] * stack[top + 1];
				break;
			case oftimes:
				top--;
				memcpy(&fArg1, &stack[top], 4);
				memcpy(&fArg2, &stack[top + 1], 4);
				fArg1 = fArg1 * fArg2;
				memcpy(&stack[top], &fArg1, 4);
				break;
			case octimes:
				top--;
				stack[top] = stack[top] * stack[top + 1];
				stack[top] = stack[top] % 255;
				break;

			case oidiv:
				top--;
				stack[top] = stack[top] / stack[top + 1];
				break;
			case ofdiv:
				top--;
				memcpy(&fArg1, &stack[top], 4);
				memcpy(&fArg2, &stack[top + 1], 4);
				fArg1 = fArg1 / fArg2;
				memcpy(&stack[top], &fArg1, 4);
				break;
			case ocdiv:
				top--;
				stack[top] = stack[top] / stack[top + 1];
				if (stack[top] < 0)
					stack[top] = 256 - stack[top];
				break;
			case oeql:
				top--;
				if (stack[top] == stack[top + 1])
					stack[top] = 1;
				else
					stack[top] = 0;
				break;
			case oneq:
				top--;
				if (stack[top] != stack[top + 1])
					stack[top] = 1;
				else
					stack[top] = 0;
				break;
			case olss:
				top--;
				if (stack[top] < stack[top + 1])
					stack[top] = 1;
				else
					stack[top] = 0;
				break;
			case oleq:
				top--;
				if (stack[top] <= stack[top + 1])
					stack[top] = 1;
				else
					stack[top] = 0;
				break;
			case ogtr:
				top--;
				if (stack[top] > stack[top + 1])
					stack[top] = 1;
				else
					stack[top] = 0;
				break;
			case ogeq:
				top--;
				if (stack[top] >= stack[top + 1])
					stack[top] = 1;
				else
					stack[top] = 0;
				break;
			case oitout:
//				if (stack[top] == 1000) {
//					printf("1000 steps reached....");
//					fflush(stdout);
//				}
				addIntResult(stack[top]);
				top--;
				break;
			case oftout:
				fArg1 = intToFloat(stack[top]);
				addFloatResult(stack[top]);
				top--;
				break;
			case octout:
				addCharResult((char) stack[top]);
				top--;
				break;
			case obtout:
				addBoolResult((char) stack[top]);
				top--;
				break;
			case ohitout:
				addIntArrayResult(stack[base(curInst->l - stack[top - 1]) + 4],
						stack[top]);
				top -= 2;
				break;
			case ohftout:
				addFloatArrayResult(
						stack[base(curInst->l - stack[top - 1]) + 4],
						stack[top]);
				top -= 2;
				break;
			case ohctout:
				addCharArrayResult(stack[base(curInst->l - stack[top - 1]) + 4],
						stack[top]);
				top -= 2;
				break;
			case ohbtout:
				addBoolArrayResult(stack[base(curInst->l - stack[top - 1]) + 4],
						stack[top]);
				top -= 2;
				break;
			}
		}
		if (top + 10 > stacksize) {
			stacksize += 20;
			stack = realloc(stack, stacksize * sizeof(int));
		}

		intermediateInstrCounter++;
		if (intermediateInstrCounter > snapShotInstrThreshold
				&& !currentTasklet->header.id.serial == 0
				&& coldMigrationEnabled) {

			sendSnapshotIntervall(currentTasklet);
			countInstr += intermediateInstrCounter;
			intermediateInstrCounter = 0;
			if (!cont) {
				if (countInstr > 3 * snapShotInstrThreshold) {
					interpreter_running = false;
					done = false;
				}
			}
		}

	} while (prgCount != 0 && interpreter_running);
//	if (isDropped)
//		done = false;
	printf("Number of Instructions: %lu\n",
			countInstr + intermediateInstrCounter);
	if (!corrupt) {
		tLogMessage(currentTasklet, tResultMessage, mp_tvmEndsExecution,
				role_tvm, instructionPort);
		puts("Execution successful!");
	} else {
		puts("Execution aborted! I am a bad virtual machine! \\m/");
	}
	fflush(stdout);

}

float genRandomFloat(float bound) {
	float result = (float) rand() / (float) (RAND_MAX / bound);
	return result;
}

int genRandomInt(int bound) {
	struct timeval timevalue;
	gettimeofday(&timevalue, 0);

	return abs((rand() * initPort * timevalue.tv_usec)) % bound;
//	int val = rand() % bound;
//	printf("random value:%i\n", val);
//	return val;
}
char genRandomChar() {
	return rand() % UCHAR_MAX;
}
bool genRandomBool() {
	int i = rand() % 2;
	if (i == 0)
		return true;
	else
		return false;
}

//----------------------Add Result Methods-----------------------

void addIntResult(int result) {
	results = realloc(results, resultsize + 5 * sizeof(char));
	results[resultsize++] = dt_int;
	char tmp[4];
	intToArray(result, tmp);
	results[resultsize++] = tmp[3];
	results[resultsize++] = tmp[2];
	results[resultsize++] = tmp[1];
	results[resultsize++] = tmp[0];
}
void addFloatResult(int result) {
	results = realloc(results, resultsize + 5 * sizeof(char));
	results[resultsize++] = dt_float;
	char tmp[4];
	intToArray(result, tmp);
	results[resultsize++] = tmp[3];
	results[resultsize++] = tmp[2];
	results[resultsize++] = tmp[1];
	results[resultsize++] = tmp[0];
}

void addBoolResult(char result) {
	results = realloc(results, resultsize + 2 * sizeof(char));
	results[resultsize++] = dt_bool;
	results[resultsize++] = result;
}

void addCharResult(char result) {
	results = realloc(results, resultsize + 2 * sizeof(char));
	results[resultsize++] = dt_char;
	results[resultsize++] = result;
}

void addIntArrayResult(int level, int base) {
	char val[4];
	int byteLength = readLengthFromHeap(level, base);
	results = realloc(results,
			resultsize + byteLength + (sizeof(char)) + sizeof(int));
	results[resultsize++] = dt_int_array;
	intToArray(byteLength / sizeof(int), val);
	results[resultsize++] = val[3];
	results[resultsize++] = val[2];
	results[resultsize++] = val[1];
	results[resultsize++] = val[0];
	memcpy(&results[resultsize],
			&heapSpace[level][base][sizeof(char) + sizeof(int)], byteLength);
	resultsize += byteLength;
}

void addFloatArrayResult(int level, int base) {
	char val[4];
	int byteLength = readLengthFromHeap(level, base);
	results = realloc(results,
			resultsize + byteLength + (sizeof(char)) + sizeof(int));
	results[resultsize++] = dt_float_array;
	intToArray(byteLength / sizeof(int), val);
	results[resultsize++] = val[3];
	results[resultsize++] = val[2];
	results[resultsize++] = val[1];
	results[resultsize++] = val[0];
	memcpy(&results[resultsize],
			&heapSpace[level][base][sizeof(char) + sizeof(int)], byteLength);
	resultsize += byteLength;

}

void addCharArrayResult(int level, int base) {
	char val[4];
	int byteLength = readLengthFromHeap(level, base);
	results = realloc(results,
			resultsize + byteLength + (sizeof(char)) + sizeof(int));
	results[resultsize++] = dt_char_array;
	intToArray(byteLength, val);
	results[resultsize++] = val[3];
	results[resultsize++] = val[2];
	results[resultsize++] = val[1];
	results[resultsize++] = val[0];
	memcpy(&results[resultsize],
			&heapSpace[level][base][sizeof(char) + sizeof(int)], byteLength);
	resultsize += byteLength;
}

void addBoolArrayResult(int level, int base) {
	char val[4];
	int byteLength = readLengthFromHeap(level, base);
	results = realloc(results,
			resultsize + byteLength + (sizeof(char)) + sizeof(int));
	results[resultsize++] = dt_bool_array;
	intToArray(byteLength, val);
	results[resultsize++] = val[3];
	results[resultsize++] = val[2];
	results[resultsize++] = val[1];
	results[resultsize++] = val[0];
	memcpy(&results[resultsize],
			&heapSpace[level][base][sizeof(char) + sizeof(int)], byteLength);
	resultsize += byteLength;
}

//---------------Constant Pool Methods-------------------------------

int readIntFromConstPool(int base, int offset) {
	char tmp[4];
	int pos = base + offset * sizeof(int);
	tmp[3] = constantPool[pos++];
	tmp[2] = constantPool[pos++];
	tmp[1] = constantPool[pos++];
	tmp[0] = constantPool[pos];
	if (pos >= constantPoolSize) {
		printf("Contantpool index out of bound error!!!\n");
	}
	return arrayToInt(tmp);
}

int readFloatFromConstPool(int base, int offset) {
	char tmp[4];
	int pos = base + offset * sizeof(int);
	tmp[3] = constantPool[pos++];
	tmp[2] = constantPool[pos++];
	tmp[1] = constantPool[pos++];
	tmp[0] = constantPool[pos];
	if (pos >= constantPoolSize) {
		printf("Contantpool index out of bound error!!!\n");
	}
	return arrayToInt(tmp);
}

int readCharFromConstPool(int base, int offset) {
	int pos = base + offset * sizeof(char);
	if (pos >= constantPoolSize) {
		printf("Contantpool index out of bound error!!!\n");
	}
	return (int) constantPool[pos];

}

int readBoolFromConstPool(int base, int offset) {
	int pos = base + offset * sizeof(char);
	if (pos >= constantPoolSize) {
		printf("Contantpool index out of bound error!!!\n");
	}
	return (int) constantPool[pos];
}

//--------------------HEAP----------------

int createHeapLevel() {
//	printf("New Heap Level %i Created!\n", heapLevels);
	heapLevels++;
	heapSpace = realloc(heapSpace, heapLevels * sizeof(char*));
	heapSpace[heapLevels - 1] = NULL;
	heapSpaceEntries = realloc(heapSpaceEntries, heapLevels * sizeof(int));
	heapSpaceEntries[heapLevels - 1] = 0;
	return heapLevels - 1;
}

void createHeapEntryOnLevel(int level, int initialSizeInByte,
		lang_datatype type) {
	heapSpaceEntries[level]++;
	heapSpace[level] = realloc(heapSpace[level],
			heapSpaceEntries[level] * sizeof(char*));
	heapSpace[level][heapSpaceEntries[level] - 1] = calloc(sizeof(char),
			5 + initialSizeInByte);
	heapSpace[level][heapSpaceEntries[level] - 1][0] = type;
	memcpy(&heapSpace[level][heapSpaceEntries[level] - 1][1],
			&initialSizeInByte, 4);
}

void fillHeapEntryWithData(int level, int base, int data) {
//	printf("Filling data...");
//	fflush(stdout);
	int lengthInConstPool = readLengthFromConstantPool(data);
	heapSpace[level][base] = realloc(heapSpace[level][base],
			lengthInConstPool + sizeof(int) + sizeof(char));

	memcpy(&heapSpace[level][base][5], &constantPool[data], lengthInConstPool);
	memcpy(&heapSpace[level][base][1], &lengthInConstPool, 4);
//
//	printf("Filling data finished.");
//	fflush(stdout);
}

void deleteTopLevel() {
	heapLevels--;
//	printf("Top level %i deleted\n", heapLevels);
	int i = 0;
	while (i < heapSpaceEntries[heapLevels]) {
		free(heapSpace[heapLevels][i]);
		i++;
	}
	free(heapSpace[heapLevels]);
	heapSpaceEntries = realloc(heapSpaceEntries, heapLevels * sizeof(int));

}

void deepCopyWithReallocation(int sourceLevel, int sourceBase, int destLevel,
		int destBase) {
	int sourceLength = readLengthFromHeap(sourceLevel, sourceBase);
	memcpy(&heapSpace[destLevel][destBase][1], &sourceLength, 4);
	heapSpace[destLevel][destBase] = realloc(heapSpace[destLevel][destBase],
			sourceLength + sizeof(int) + sizeof(char));
	memcpy(&heapSpace[destLevel][destBase][5],
			&heapSpace[sourceLevel][sourceBase][5], sourceLength);
}

int readIntFromHeap(int level, int base, int offset) {

	int result;
	if (readLengthFromHeap(level, base) < offset * sizeof(int)) {
		printf("Array out of Bound!\n");
		fflush(stdout);
		printHeap();
		return -1;
	}
	memcpy(&result, &heapSpace[level][base][offset * sizeof(int) + 5], 4);
	return result;

}

int readFloatFromHeap(int level, int base, int offset) {
	int result;
	if (readLengthFromHeap(level, base) < offset * sizeof(int)) {
		printf("Array out of Bound!");
		return -1;
	}
	memcpy(&result, &heapSpace[level][base][offset * sizeof(int) + 5], 4);
	return result;
}
int readCharFromHeap(int level, int base, int offset) {
	int result;
	if (readLengthFromHeap(level, base) < offset) {
		printf("Array out of Bound!");
		return -1;
	}
	memcpy(&result, &heapSpace[level][base][offset * sizeof(char) + 5], 1);
	return result;
}
int readBoolFromHeap(int level, int base, int offset) {
	int result;
	if (readLengthFromHeap(level, base) < offset) {
		printf("Array out of Bound!");
		return -1;
	}
	memcpy(&result, &heapSpace[level][base][offset * sizeof(char) + 5], 1);
	return result;
}

void writeIntIntoHeap(int level, int base, int offset, int value) {
	if (heapSpace[level][base][0] != dt_int_array) {
		printf("Wrong data type... Base Data type is not Integer");
		return;
	}
	if (readLengthFromHeap(level, base) < offset * sizeof(int)) {
		printf("Array out of Bound!");
		return;
	}

	memcpy(&heapSpace[level][base][offset * sizeof(int) + 5], &value, 4);

}

void incrementHeapValue(int level, int base, int offset) {
	int tmp;
	offset = offset * sizeof(int) + 5;
	memcpy(&tmp, &heapSpace[level][base][offset], 4);
	tmp++;
	memcpy(&heapSpace[level][base][offset], &tmp, 4);
}

void decrementHeapValue(int level, int base, int offset) {
	int tmp;
	offset = offset * sizeof(int) + 5;
	memcpy(&tmp, &heapSpace[level][base][offset], 4);
	tmp--;
	memcpy(&heapSpace[level][base][offset], &tmp, 4);
}

void writeFloatIntoHeap(int level, int base, int offset, int value) {
//	printf("asdasdasd\n");
//	fflush(stdout);
//	char **tmp = heapSpace[level];
//	printf("asdasdasd\n");
//	fflush(stdout);
//	char *test = heapSpace[level][base];
//	printf("asdasdasd\n");
//	fflush(stdout);
	if (heapSpace[level][base][0] != dt_float_array) {
		printf("Wrong data type... Base Data type is not float");
		return;
	}
	if (readLengthFromHeap(level, base) < offset * sizeof(int)) {
		printf("Array out of Bound!");
		return;
	}
	memcpy(&heapSpace[level][base][offset * sizeof(int) + 5], &value, 4);

}

void writeCharIntoHeap(int level, int base, int offset, char value) {
	if (heapSpace[level][base][0] != dt_char_array) {
		printf("Wrong data type... Base Data type is not char");
		return;
	}
	if (readLengthFromHeap(level, base) < offset) {
		printf("Array out of Bound!");
		return;
	}
	memcpy(&heapSpace[level][base][offset * sizeof(char) + 5], &value, 1);
}

void writeBoolIntoHeap(int level, int base, int offset, char value) {
	if (heapSpace[level][base][0] != dt_bool_array) {
		printf("Wrong data type... Base Data type is not bool");
		return;
	}
	if (readLengthFromHeap(level, base) < offset) {
		printf("Array out of Bound!");
		return;
	}
	memcpy(&heapSpace[level][base][offset * sizeof(char) + 5], &value, 1);
}

int readLengthFromHeap(int level, int base) {
	int val;
	memcpy(&val, &heapSpace[level][base][1], 4);
	return val;
}

int readLengthFromConstantPool(int base) {
	char val[4];
	int adr = base - (sizeof(lang_datatype) + sizeof(int));
	memcpy(&val, &constantPool[adr], 4);

	return arrayToInt(val);
}

void printStack(int t) {
	printf("---Stack Print:::::::\n");
	int sz = stacksize;
	sz--;
	while (sz >= 0) {
		if (t == sz) {
			printf("----");
			fflush(stdout);
		}
		printf("Position %i:	%i\n", sz, stack[sz]);
		fflush(stdout);
		sz--;
	}
}

void printConstPool() {
	int i = 0;
	printf("Const Pool Start!!!!!!!!\n");
	while (i < constantPoolSize) {
		printf("Heap %i: %i\n", i, constantPool[i]);
		i++;
	}
	printf("Const Pool End!!!!!!!!");
}

void printHeap() {
	int i = 0, j, l, tmp;
	printf("Heap Start!!!!!!\n");
	while (i < heapLevels) {
		j = 0;
		printf("Heap Level %i:\n", i);
		while (j < heapSpaceEntries[i]) {
			l = 0;
			printf("	Heap Level Entry %i:\n", j);
			tmp = readLengthFromHeap(i, j) + sizeof(int) + sizeof(char);
			while (l < tmp) {
				printf("		Heap Level Entry Element %i: %i\n", l,
						heapSpace[i][j][l]);
				l++;
			}
			j++;
		}
		i++;
	}
	fflush(stdout);
}

void printResults() {
	int i = 0;
	printf("Results Start!!!!!!!!\n");
	while (i < resultsize) {
		printf("Results %i: %i\n", i, results[i]);
		i++;
	}
	printf("Results End!!!!!!!!");
}
