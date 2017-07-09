///*
// * TVMSharedMemory.c
// *
// *  Created on: 10.07.2014
// *      Author: Dominik
// */
//
//#include "../header/TVMSharedMemory.h"
//
//char instrNameSM[] = "TVMObjectInstr";
//LPCTSTR regNameSM = "TVMObjectReg";
//char metaNameSM[] = "TVMObjectMeta";
//
//int id;
//bool receiveprogramSM() {
//	LPINT pBuf;
//
//	pBuf = (LPINT) MapViewOfFile(instrSMHandle, FILE_MAP_ALL_ACCESS, 0, 0,
//	BUF_SIZE);
//
//	if (pBuf == NULL) {
//		printf("Could not map view of file.\n");
//		CloseHandle(instrSMHandle);
//		return false;
//	}
//	if (pBuf[0] == 0) {
//		UnmapViewOfFile(pBuf);
//		printf("No Program received!\n");
//		fflush(stdout);
//		return false;
//	} else {
//
//		readProg(pBuf + 1, pBuf[0]);
//		int data[] = { 0 };
//		CopyMemory((PVOID) pBuf, data, sizeof(int));
//		UnmapViewOfFile(pBuf);
//		printf("New Program received!\n");
//		fflush(stdout);
//		return true;
//	}
//	return false;
//
//}
////TODO no copy of instructions!
//void readProgSM(int* ptr, int len) {
//	newProg = true;
//	prog = calloc(len, sizeof(int));
//	int i = 0;
//	while (i < len) {
//		prog[i] = ptr[i];
//		i++;
//	}
//}
//int createSharedMemory() {
//	int id;
//	id = createRegistrySharedMemory();
//	createInstructionSharedMemory(id);
//	createMetaSharedMemory(id);
//	return id;
//}
//
//int createRegistrySharedMemory() {
//	LPINT pBuf = NULL;
//	srand(time(NULL));
//	int tvmId = rand() % TVM_MAX;
//	regSMHandle = OpenFileMapping(FILE_MAP_ALL_ACCESS, false, regNameSM);
//	if (regSMHandle == NULL) {
//
//		regSMHandle = CreateFileMapping(INVALID_HANDLE_VALUE, NULL,
//		PAGE_READWRITE, 0,
//		BUF_SIZE, regNameSM);
//
//		if (regSMHandle == NULL) {
//			printf("Could not create file mapping object (%lu).\n",
//					GetLastError());
//			return -1;
//		}
//
//		pBuf = (LPINT) MapViewOfFile(regSMHandle, FILE_MAP_ALL_ACCESS, 0, 0,
//		BUF_SIZE);
//
//		if (pBuf == NULL) {
//			printf("Could not map view of file.\n");
//			CloseHandle(regSMHandle);
//			return -1;
//		}
//
//		int data[] = { 1, tvmId };
//		CopyMemory((PVOID) pBuf, data, 2 * sizeof(int));
//		UnmapViewOfFile(pBuf);
//		return tvmId;
//	} else {
//		pBuf = (LPINT) MapViewOfFile(regSMHandle, FILE_MAP_ALL_ACCESS, 0, 0,
//		BUF_SIZE);
//
//		if (pBuf == NULL) {
//			printf("Could not map view of file.\n");
//			CloseHandle(regSMHandle);
//			return -1;
//		}
//
//		int data[pBuf[0] + 2];
//		data[0] = pBuf[0] + 1;
//		int i;
//
//		for (i = 1; i <= pBuf[0]; i++) {
//			data[i] = pBuf[i];
//			if (pBuf[i] == tvmId)
//				tvmId = rand() % TVM_MAX;
//		}
//		i++;
//		data[i] = tvmId;
//
//		CopyMemory((PVOID) pBuf, data, (data[0] + 2) * sizeof(int));
//		UnmapViewOfFile(pBuf);
//		CloseHandle(regSMHandle);
//		return tvmId;
//
//	}
//	return -1;
//}
//
//bool createInstructionSharedMemory(int id) {
//	char* instr = malloc(strlen(instrNameSM) + id + 1);
//	sprintf(instr, "%s%i", instrNameSM, id);
//
//	instrSMHandle = CreateFileMapping(INVALID_HANDLE_VALUE, NULL,
//	PAGE_READWRITE, 0,
//	BUF_SIZE, instr);
//
//	if (instrSMHandle == NULL) {
//		printf("Could not create file mapping object (%lu).\n", GetLastError());
//		return false;
//	}
//
//	return true;
//}
//
//void freeSharedMemory() {
//	CloseHandle(instrSMHandle);
//	CloseHandle(metaSMHandle);
//
//}
//
//bool createMetaSharedMemory(int id) {
//	char* meta = malloc(strlen(metaNameSM) + id + 1);
//	sprintf(meta, "%s%i", metaNameSM, id);
//
//	metaSMHandle = CreateFileMapping(INVALID_HANDLE_VALUE, NULL,
//	PAGE_READWRITE, 0,
//	BUF_SIZE, meta);
//
//	if (metaSMHandle == NULL) {
//		printf("Could not create file mapping object (%lu).\n", GetLastError());
//		return false;
//	}
//
//	return true;
//}
//
