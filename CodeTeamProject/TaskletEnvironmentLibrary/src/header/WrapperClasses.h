/*
 * WrapperClasses.h
 *
 *  Created on: 14.03.2015
 *      Author: Janick
 */

#ifndef WRAPPERCLASSES_H_
#define WRAPPERCLASSES_H_
// platform detection

#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

#define PLATFORM_WINDOWS  1
#define PLATFORM_MAC      2
#define PLATFORM_UNIX     3

#if defined(_WIN32)
#define PLATFORM PLATFORM_WINDOWS
#elif defined(__APPLE__)
#define PLATFORM PLATFORM_MAC
#else
#define PLATFORM PLATFORM_UNIX
#endif

#if PLATFORM == PLATFORM_WINDOWS

#include <winsock2.h>
#pragma comment(lib, "wsock32.lib" )
#include <process.h>
#include  <io.h>

typedef HANDLE pimutex;
typedef HANDLE pisemaphore;

#elif PLATFORM == PLATFORM_MAC || PLATFORM == PLATFORM_UNIX

#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdbool.h>
#include <semaphore.h>

typedef unsigned char byte;
typedef struct sockaddr_in SOCKADDR_IN;
typedef struct sockaddr SOCKADDR;
typedef struct in_addr IN_ADDR;
typedef u_int SOCKET;
typedef pthread_mutex_t *pimutex;
typedef sem_t *pisemaphore;
typedef bool boolean;
#define INVALID_SOCKET (SOCKET)(~0)
#define FALSE 0
#define false 0
#define TRUE 1
#define true 1

#else

#error unknown platform!

#endif

bool InitializeSockets();
SOCKET pi_socket(int af, int type, int protocol);
int pi_bind(SOCKET s, const SOCKADDR *name, int namelen);
int pi_listen(SOCKET s, int backlog);
SOCKET pi_accept(SOCKET s, SOCKADDR *addr, int *addrlen);
int pi_connect(SOCKET s, const SOCKADDR *name, int namelen);
int pi_sendtcp(SOCKET s, const char *buf, int len, int flags);
int pi_receivetcp(SOCKET s, char *buf, int len, int flags);
int pi_closesocket(SOCKET s);
int pi_error();
int pi_inet_aton(SOCKADDR_IN in);
int pi_inet_iaton(IN_ADDR in);

void pi_startthread(void (*start_address)(void*), unsigned stack_size,
		void *arglist);
void pi_sleep(int milliseconds);

pimutex pi_create_mutex(bool bInitialOwner);
void pi_lock_mutex(pimutex lmutex);
void pi_release_mutex(pimutex rmutex);

pisemaphore pi_create_semaphore(long current, long max);
void pi_release_semaphore(pisemaphore semaphore);
void pi_waitfor_semaphore(pisemaphore semaphore);

void pi_start_process(const char *path, char * const argv[]);
int pi_getnumberofcores();

#endif /* WRAPPERCLASSES_H_ */
