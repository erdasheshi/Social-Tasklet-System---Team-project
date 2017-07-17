/*
 * SocketInterface.c
 *
 *  Created on: 04.11.2014
 *      Author: Janick
 */

#include "../header/SocketInterface.h"

int tcpsend(SOCKET sendingSocket, const char *buffer, int length, int flags) {
	int bytesSent;
	int remainingBytes = length;
	while (remainingBytes > 0) {
		bytesSent = pi_sendtcp(sendingSocket,
				(char*) buffer + length - remainingBytes, remainingBytes,
				flags);

		if (bytesSent < 0) {
			printf(
					"########################################PROBLEM WHILE SENDING");
			fflush(stdout);

			return -1;
		}
		remainingBytes -= bytesSent;
	}
	return length;
}

int tcpreceive(SOCKET receivingSocket, char* buffer, int length, int flags) {
	fflush(stdout);
	int bytesReceived;
	int remainingBytes = length;
	while (remainingBytes > 0) {
		bytesReceived = pi_receivetcp(receivingSocket,
				(char*) buffer + length - remainingBytes, remainingBytes,
				flags);
		if (bytesReceived < 0) {
			printf(
					"########################################PROBLEM WHILE RECEIVING");
			fflush(stdout);
			return -1;
		}
		remainingBytes -= bytesReceived;
	}
	return length;
}

SOCKET createSocket(u_short port) {

	SOCKADDR_IN addr;
	SOCKET acceptSocket = NULL;
	InitializeSockets();
	acceptSocket = pi_socket(AF_INET, SOCK_STREAM, 0);
	if (acceptSocket < 1) {
		return false;
	}

	memset(&addr, 0, sizeof(SOCKADDR_IN));
	addr.sin_family = AF_INET;
	addr.sin_port = htons(port);
	addr.sin_addr.s_addr = INADDR_ANY;
	long rc = pi_bind(acceptSocket, (SOCKADDR*) &addr, sizeof(SOCKADDR_IN));
	if (rc < 0) {
		printf("Could not bind on port %d\n", port);
		return acceptSocket;
	} else {
		printf("Socket bind on port %d\n", port);
	}
	fflush(stdout);
	return acceptSocket;

}

SOCKET createSocketOnRandomPort() {
	SOCKADDR_IN addr;
	SOCKET acceptSocket = NULL;
	InitializeSockets();
	acceptSocket = pi_socket(AF_INET, SOCK_STREAM, 0);
	if (acceptSocket < 1) {
		return false;
	}

	memset(&addr, 0, sizeof(SOCKADDR_IN));
	addr.sin_family = AF_INET;
	addr.sin_port = 0;
	addr.sin_addr.s_addr = INADDR_ANY;
	long rc = pi_bind(acceptSocket, (SOCKADDR*) &addr, sizeof(SOCKADDR_IN));
	if (rc < 0) {
		return acceptSocket;
	} else {
		printf("Socket bind on random port\n");
	}
	fflush(stdout);
	return acceptSocket;
}

int getPortNumber(SOCKET socket) {
	SOCKADDR_IN addr;
	int peeraddrlen = sizeof(addr);
	long rc = getsockname(socket, (SOCKADDR*) &addr, &peeraddrlen);
	if (rc < 0) {
		return socket;
	}

	return ntohs(addr.sin_port);
}

SOCKET setupSendSocket(u_long host, int hostPort) {
	SOCKET sendingSocket;
	SOCKADDR_IN addr;
	InitializeSockets();

	sendingSocket = pi_socket(AF_INET, SOCK_STREAM, 0);

	memset(&addr, 0, sizeof(SOCKADDR_IN));
	addr.sin_family = AF_INET;
	addr.sin_port = htons(hostPort);
	addr.sin_addr.s_addr = host;

	long rc = pi_connect(sendingSocket, (SOCKADDR*) &addr, sizeof(SOCKADDR));
	if (rc < 0) {
		return false;
	} else {
//		printf("Connected to %s on port %d\n", inet_ntoa(addr.sin_addr), hostPort);
	}
	fflush(stdout);
	return sendingSocket;
}

SOCKET setupUDPSendSocket() {

	SOCKET s = pi_socket(AF_INET, SOCK_DGRAM, 0);
	if (s < 0) {
		return 1;
	} else {
//		printf("UDP Socket created!\n");
	}

	return s;

}

SOCKET listenAndAccept(SOCKET acceptSocket, int backlog) {
	long rc;

	SOCKET connectedSocket = NULL;

	rc = pi_listen(acceptSocket, backlog);

	if (rc < 0) {
		return connectedSocket;
	}

	connectedSocket = pi_accept(acceptSocket, NULL, NULL);
	if (connectedSocket < 0) {
		fflush(stdout);
		return connectedSocket;
	}
	return connectedSocket;
}

