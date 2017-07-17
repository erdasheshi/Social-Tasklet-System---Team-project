///*
// * TVMSemaphoreSnyc.c
// *
// *  Created on: 10.07.2014
// *      Author: Dominik
// */
//
//#include "../header/TVMSemaphoreSync.h"
//
//char* vmInstrName = "TVMSemaphoreVM";
//char* registerSemaName = "TVMSemaphoreReg";
//char* runSignalName = "TVMRunSignal";
//
//bool createRegistrySemaphore() {
//
//	regSemaphore = OpenSemaphore(SEMAPHORE_ALL_ACCESS, false, registerSemaName);
//
//	if (regSemaphore == NULL)
//		regSemaphore = CreateSemaphore(
//		NULL, MAX_SEM_COUNT,
//		MAX_SEM_COUNT, registerSemaName);
//
//	if (regSemaphore == NULL) {
//		printf("CreateSemaphoreRegistry error: %lu\n", GetLastError());
//		return false;
//	}
//	return true;
//}
//
//bool createVMRunSignalSemaphore(int id) {
//	char* name = malloc(strlen(runSignalName) + id + 1);
//	sprintf(name, "%s%i", runSignalName, id);
//
//	printf("%s", name);
//	fflush(stdout);
//
//	vmRunSignal = CreateSemaphore(
//	NULL, INIT_VAL,
//	MAX_SEM_COUNT, name);
//
//	if (vmRunSignal == NULL) {
//		printf("CreateSemaphore error: %lu\n", GetLastError());
//		return false;
//	}
//	return true;
//}
//
//bool createInstructionSemaphore(int id) {
//	char* name = malloc(strlen(vmInstrName) + id + 1);
//	sprintf(name, "%s%i", vmInstrName, id);
//	instrSemaphore = CreateSemaphore(
//	NULL, MAX_SEM_COUNT,
//	MAX_SEM_COUNT, name);
//
//	if (instrSemaphore == NULL) {
//		printf("CreateSemaphore error: %lu\n", GetLastError());
//		return false;
//	}
//	return true;
//}
