/*
 * IPResponder.h
 *
 *  Created on: 09.01.2015
 *      Author: Janick
 */

#ifndef IPRESPONDER_H_
#define IPRESPONDER_H_

#include "BrokerCommunication.h"

void heartBeatThread();
void updateThread();
void bRequestThread();
void tvmThread();



#endif /* IPRESPONDER_H_ */
