/*
 * SocketInterface.h
 *
 *  Created on: 04.11.2014
 *      Author: Janick
 */

#ifndef SOCKETINTERFACE_H_
#define SOCKETINTERFACE_H_

#include "TaskletUtil.h"

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

int tcpreceive(SOCKET receivingSocket, char* buffer, int size, int flags);
int tcpsend(SOCKET sendingSocket, const char *buffer, int length, int flags);
SOCKET createSocket(u_short port);
SOCKET createSocketOnRandomPort();
int getPortNumber(SOCKET);
SOCKET setupSendSocket(u_long host, int hostPort);
SOCKET setupUDPSendSocket();
SOCKET listenAndAccept(SOCKET acceptSocket, int backlog);

#endif /* SOCKETINTERFACE_H_ */
