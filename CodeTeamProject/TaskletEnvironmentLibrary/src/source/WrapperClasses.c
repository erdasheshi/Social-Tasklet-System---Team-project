/*
 * WrapperClasses.c
 *
 *  Created on: 14.03.2015
 *      Author: Janick
 */

#include "../header/WrapperClasses.h"

bool InitializeSockets() {
#if PLATFORM == PLATFORM_WINDOWS
	WSADATA WsaData;
	return WSAStartup(MAKEWORD(2, 0), &WsaData) == 0;
#else
	return true;
#endif
}

SOCKET pi_socket(int af, int type, int protocol) {

	SOCKET returnSocket = socket(af, type, protocol);
	if (returnSocket < 0) {
		printf("Socket creation error!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif
		return -1;
	}

	return returnSocket;
}

int pi_bind(SOCKET s, const SOCKADDR *name, int namelen) {

	int result = bind(s, name, namelen);

	if (result < 0) {
		printf("Socket binding error!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif
		return -1;

	}

	return result;
}

int pi_listen(SOCKET s, int backlog) {

	int result = listen(s, backlog);

	if (result < 0) {
		printf("Socket listening error!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif
		return -1;

	}

	return result;
}

SOCKET pi_accept(SOCKET s, SOCKADDR *addr, int *addrlen) {

	SOCKET connectedSocket = accept(s, addr, addrlen);

	if (connectedSocket < 0) {
		printf("Socket accepting error!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif
		return -1;

	}

	return connectedSocket;
}

int pi_connect(SOCKET s, const SOCKADDR *name, int namelen) {

	int result = connect(s, name, namelen);

	if (result < 0) {
		printf("Socket connecting error!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif
		return -1;

	}

	return result;
}

int pi_sendtcp(SOCKET s, const char *buf, int len, int flags) {
	int bytesSent = send(s, buf, len, flags);

	if (bytesSent < 0) {
		printf("Error in send!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif

	}
	return bytesSent;

}

int pi_receivetcp(SOCKET s, char *buf, int len, int flags) {
	int bytesReceived = recv(s, buf, len, flags);
	if (bytesReceived < 0) {
		printf("Error in receive!");
#if PLATFORM == PLATFORM_WINDOWS
		printf("Error code: %d\n", WSAGetLastError());
#endif
	}
	return bytesReceived;
}

int pi_closesocket(SOCKET s) {
#if PLATFORM == PLATFORM_WINDOWS
	return closesocket(s);
#else
	return close(s);
#endif
}

int pi_error() {
#if PLATFORM == PLATFORM_WINDOWS
	return WSAGetLastError();
#else
	return -1;
#endif
}

int pi_inet_aton(SOCKADDR_IN in) {
	return pi_inet_iaton(in.sin_addr);
}

int pi_inet_iaton(IN_ADDR in) {

#if PLATFORM == PLATFORM_WINDOWS
	return in.S_un.S_addr;
#else
	return in.s_addr;
#endif
}

void pi_startthread(void (*start_address)(void*), unsigned stack_size,
		void *arglist) {
#if PLATFORM == PLATFORM_WINDOWS
	_beginthread(start_address, stack_size, arglist);
#else
	pthread_t thread;
	pthread_create(&thread, NULL, start_address, arglist);
#endif
}

void pi_sleep(int milliseconds) {
#if PLATFORM == PLATFORM_WINDOWS
	Sleep(milliseconds);
#else
	usleep(milliseconds * 1000);
#endif
}

pimutex pi_create_mutex(bool bInitialOwner) {
#if PLATFORM == PLATFORM_WINDOWS
	return CreateMutex(NULL, bInitialOwner, NULL);
#else
	pimutex mut = malloc(sizeof(pthread_mutex_t));
	pthread_mutex_init(mut, NULL);
	return mut;
#endif
}

void pi_lock_mutex(pimutex lmutex) {
#if PLATFORM == PLATFORM_WINDOWS
	WaitForSingleObject(lmutex, INFINITE);
#else
	pthread_mutex_lock( lmutex );
#endif
}

void pi_release_mutex(pimutex rmutex) {
#if PLATFORM == PLATFORM_WINDOWS
	ReleaseMutex(rmutex);
#else
	pthread_mutex_unlock( rmutex );
#endif
}
pisemaphore pi_create_semaphore(long current, long max) {
#if PLATFORM == PLATFORM_WINDOWS
	return CreateSemaphoreA(NULL, current, max, NULL);
#else
	pisemaphore sema = malloc(sizeof(sem_t));
	sem_init(sema, 0, current);
	return sema;
#endif
}
void pi_release_semaphore(pisemaphore semaphore) {
#if PLATFORM == PLATFORM_WINDOWS
	ReleaseSemaphore(semaphore, 1, NULL);
#else
	sem_post(semaphore);
#endif
}
void pi_waitfor_semaphore(pisemaphore semaphore) {
#if PLATFORM == PLATFORM_WINDOWS
	WaitForSingleObject(semaphore, INFINITE);
#else
	sem_wait(semaphore);
#endif
}

void pi_start_process(const char *path, char * const argv[]) {
#if PLATFORM == PLATFORM_WINDOWS
	(void) system(path);
#else
	execv(path, argv);
#endif
}

int pi_getnumberofcores() {
#if PLATFORM == PLATFORM_WINDOWS
	SYSTEM_INFO sysinfo;
	GetSystemInfo(&sysinfo);
	return sysinfo.dwNumberOfProcessors;
#else
	return sysconf( _SC_NPROCESSORS_ONLN );
#endif

}

