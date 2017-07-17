#include "../header/TaskletFactory.h"

//----------Run Environment------
bool running = true;
//------Sockets---------

u_short factoryPort = 12345;
u_short brokerPort = orchestrationPort;
FILE *errorlog;

int main(int argc, char *argv[]) {

	interpreterMutex = pi_create_mutex(false);
	initializeCompiler();

	int i;
	for (i = 0; i < RESULT_THREADS; i++) {
		resultThreads[i] = NULL;
	}

	errorlog = fopen("errorlog.txt", "a");
	// char *startparam[argc];
	// startparam[0] = argc;
	// if (argc > 0) {
	//  int i;
	//  for (i = 1; argc >= i; i++) {
	//   startparam[i] = argv[i - 1];
	//  }
	// }
	argv[0] = malloc(sizeof(char));
	argv[0][0] = argc;
	pi_startthread(startOrchestration, 0, (void*) argv);
	run();
	return EXIT_SUCCESS;
}

void initializeCompiler() {
	bytecodeCache = NULL;
	L = 0;
	linecounter = 1;
	prev_int_value = 0;
	int_value = 0;
	sym = -1;
	symtbl = NULL;
	topscope = NULL;
	bottom = NULL;
	undef = NULL;
	paramp = 0;
	bytecode = NULL;
	da_parameters = NULL;
	sourcecode = NULL;
	currentlevel = -1;
	constantPool = NULL;
}

void run() {

	SOCKET acceptSocket = createSocket(factoryPort);

	while (1) {
		SOCKET* temp = malloc(sizeof(SOCKET));
		*temp = listenAndAccept(acceptSocket, 1000);
		printf("New Application connected!\n");
		fflush(stdout);
		pi_startthread(newFactoryInstance, 0, (void*) temp);

	}
}

void newFactoryInstance(void* temp) {
	bool alreadyConnected = false;
	int appIdentifier = -1;
	SOCKET *connectedSocket = (SOCKET*) temp;
	while (true) {

		if (!receiveprogram(*connectedSocket)) {
			//close connections
			pi_lock_mutex(resultThreadListMutex);
			resultThreadInformation *info;

			/*
			 * If app closes socket, free result socket.
			 */
			int i;
			for (i = 0; i < RESULT_THREADS; i++) {

				if (resultThreads[i] != NULL) {
					info = resultThreads[i];

					if (appIdentifier == info->appIdentifier) {
						//pi_closesocket(info->appSocket);
						free(info);
						resultThreads[i] = NULL;
						break;

					}
				}
			}

			pi_release_mutex(resultThreadListMutex);
			break;
		}
		//		printf("Program received!\n");
		//		fflush(stdout);
		if (incomingTasklet == NULL) {
			//			printf("Incoming Tasklet is NULL!");
			//			fflush(stdout);
			pi_release_mutex(interpreterMutex);
			continue;
		}

		if (!alreadyConnected) {
			//Open result connection to application
			u_long host = inet_addr("127.0.0.1");
			int port = incomingTasklet->header.id.port;
			SOCKET socketToApp = setupSendSocket(host, port);
			pi_lock_mutex(resultThreadListMutex);
			resultThreadInformation* newInfo = malloc(
					sizeof(resultThreadInformation));
			newInfo->appIdentifier = incomingTasklet->header.id.proxySerial;
			newInfo->ip = incomingTasklet->header.id.ip;
			newInfo->appSocket = socketToApp;
			newInfo->resultPort = incomingTasklet->header.id.port;
			newInfo->mutex = pi_create_mutex(FALSE);
			int i;
			for (i = 0; i < RESULT_THREADS; i++) {
				if (resultThreads[i] == NULL) {
					resultThreads[i] = newInfo;
					pi_release_mutex(resultThreadListMutex);
					break;
				}
			}
			pi_release_mutex(resultThreadListMutex);
			appIdentifier = incomingTasklet->header.id.proxySerial;
			alreadyConnected = true;

		}

//		printf("Program compiled!\n");
//		fflush(stdout);
		if ((!datatype_error || !compiler_error)) {
			//			printf("Im going to send this: %d\n",
			//					incomingTasklet->header.id.serial);
			fflush(stdout);
			sendtobroker();
		} else {
			tLogMessage(incomingTasklet, notdefined, mp_dropAtFactory, role_mw,
					-1);
		}
		pi_release_mutex(interpreterMutex);

	}
	printf("Application disconnected!\n");
	fflush(stdout);
	pi_release_mutex(interpreterMutex);
}

void hardReset() {
//	printf("Hard reset started!");
//	fflush(stdout);
	linecounter = 1;
	codepointer = 0;
	datatype_error = false;
	compiler_error = false;
	bytecode = NULL;
//	bytecode = malloc(1);
	parameterInformation = NULL;
//	parameterInformation = malloc(1);
	numberOfParameters = 0;
//	bytecode = malloc(1);
	L = 0;
	numofresults = 0;
	free(da_parameters);
	da_parameters = NULL;
	paramp = 0;
	free(constantPool);
	constantPool = NULL;
//	constantPool = malloc(1);
	constantPoolSize = 0;
	currentlevel = -1;
//	printf("Hard reset finished!");
//	fflush(stdout);
}

void printCode() {
//	fprintf(errorlog, "--------------Code starts--------------\n\n\n");
//
//	fputs(sourcecode, errorlog);
//	fflush(errorlog);
//
//	fprintf(errorlog, "--------------Code  Ends--------------\n\n\n");
}

bool receiveprogram(SOCKET connectedSocket) {

	if (connectedSocket < 0)
		return false;

	messageType mt = receiveProtocolHeader(connectedSocket);
	if (mt < 0)
		return false;
	pi_lock_mutex(interpreterMutex);
	hardReset();
//	printf("Received message Type : %d\n", mt);
//	fflush(stdout);

	switch (mt) {
	case iRequestMessage:
		newTaskletRequest(connectedSocket);
		tLogMessage(incomingTasklet, iRequestMessage, mp_factoryReceivesTasklet,
				role_mw, -1);
		program();

		if ((!datatype_error || !compiler_error)) {
			updateByteCodeCacheEntry();
		}
		break;
	case iResendRequestMessage:
		if (getByteCodeCacheEntry()) {

			reuseTaskletCodeWithNewParameter(connectedSocket);
			tLogMessage(incomingTasklet, iResendRequestMessage,
					mp_factoryReceivesTasklet, role_mw, -1);
		}
		break;
	case iByteCodeRequestMessage: // todo create bytecode and send it back zu receiver... create new messagetype...

		break;
	case iCodeDebugMessage: //todo create error message from code and send it back to the receiver... create new message type...
		//TODO IDE development request
		break;
	default:
		//TODO unkown message received..
//		close(connectedSocket);
		return false;
	}
	return true;
}

void updateByteCodeCacheEntry() { //TODO change proxy to id from application!
	bytecodeEntry *obj;
	obj = bytecodeCache;

	if (obj == NULL) {
		obj = (bytecodeEntry*) malloc(sizeof(bytecodeEntry));
		obj->appPort = incomingTasklet->header.id.proxySerial;
		obj->bcLength = L;
		obj->bytecode = bytecode;
		obj->next = NULL;
		obj->parameterInfoLength = numberOfParameters;
		obj->parameterInformation = parameterInformation;
		printf("new object added to cache list%i\n",
				incomingTasklet->header.id.proxySerial);
		bytecodeCache = obj;
		return;
	}

	while (obj->appPort != incomingTasklet->header.id.proxySerial) {
		if (obj->next == NULL) {
			obj->next = (bytecodeEntry*) malloc(sizeof(bytecodeEntry));
			obj = obj->next;
			obj->appPort = incomingTasklet->header.id.proxySerial;
			obj->bcLength = L;
			obj->bytecode = bytecode;
			obj->next = NULL;
			obj->parameterInfoLength = numberOfParameters;
			obj->parameterInformation = parameterInformation;
			printf("new object added to cache list%i\n",
					incomingTasklet->header.id.proxySerial);
			return;
		}
		obj = obj->next;
	}

	obj->bcLength = L;
	obj->bytecode = bytecode;
	obj->parameterInfoLength = numberOfParameters;
	obj->parameterInformation = parameterInformation;
}

bool getByteCodeCacheEntry() {
	bytecodeEntry *obj;
	obj = bytecodeCache;

	while (obj != NULL) {
		if (obj->appPort == incomingTasklet->header.id.proxySerial)
			break;
		obj = obj->next;
	}
	if (obj == NULL) {
		error(61);
		hardReset();
		return false;
	}
	bytecode = obj->bytecode;
	L = obj->bcLength;
	parameterInformation = obj->parameterInformation;
	numberOfParameters = obj->parameterInfoLength;
	return true;
}

void reuseTaskletCodeWithNewParameter(SOCKET connectedSocket) {
	incomingTasklet = receiveIRequestMessage(connectedSocket,
			iResendRequestMessage);

	if (incomingTasklet == NULL)
		return;

	da_parameters = incomingTasklet->results;

	reparameterizeByteCode();
}

void newTaskletRequest(SOCKET connectedSocket) {
	incomingTasklet = receiveIRequestMessage(connectedSocket, iRequestMessage);

	if (incomingTasklet == NULL)
		return;

	sourcecode = (char*) incomingTasklet->taskletcode;

	da_parameters = incomingTasklet->results;

	codelength = incomingTasklet->header.lengthOfCode;
}

void sendtobroker() {

	free(outgoingTasklet);
	outgoingTasklet = initTasklet();
	outgoingTasklet->header = incomingTasklet->header;
	outgoingTasklet->header.lengthOfCode = L * sizeof(instruction);
	outgoingTasklet->header.lengthOfResults = numofresults;
	outgoingTasklet->header.lengthOfConstPool = constantPoolSize;
	outgoingTasklet->header.id.executingIP = EMPTY_IP;
	outgoingTasklet->header.id.ip = EMPTY_IP;

	outgoingTasklet->qocs = incomingTasklet->qocs;
	outgoingTasklet->taskletcode = bytecode;
	outgoingTasklet->constPool = constantPool;
	outgoingTasklet->results = malloc(sizeof(char) * numofresults);

	tasklet* factoryTasklet = copyTasklet(outgoingTasklet);
	tLogMessage(factoryTasklet, notdefined, mp_factoryForwardsTasklet, role_mw,
			-1);
	pi_startthread(factoryWorkerThread, 0, (void*) factoryTasklet);
}

//--------------------CodeGen-------------------------

void gen(int x, int y, int z) {
	//TODO allocate memory in bigger steps for performance
	bytecode = realloc(bytecode, sizeof(instruction) * (L + 1));
//	printf("Instruction %i: %i    %i    %i\n", L, x, y, z);
//	fflush(stdout);
	bytecode[L].f = x;
	bytecode[L].l = y;
	bytecode[L].a = z;
	L++;

}

int label() {
	return L;
}

void fixup(int x) {
	bytecode[x].a = L;
}

void resetParameter(int line, int value) {
	bytecode[line].a = value;
}

//----------------------ConstPool--------------------------

int createConstantPoolEntry(int lengthInByte, lang_datatype type) {
	int hsold = constantPoolSize;
	constantPoolSize += (lengthInByte + sizeof(int) + sizeof(lang_datatype));
	constantPool = realloc(constantPool, constantPoolSize * sizeof(char));
	memcpy(&constantPool[hsold], &lengthInByte, sizeof(int));
	memcpy(&constantPool[hsold + sizeof(int)], &type, sizeof(lang_datatype));

	return constantPoolSize - lengthInByte;
}

void overwriteConstantPoolEntry(int offset, char *data, int size) {
	int maxsize = readLengthFromConstantPool(offset);
	if (maxsize < size)
		size = maxsize;
	memcpy(&constantPool[offset], data, size);
}

void writeSingleConstantPoolEntry(int offset, int adr, char *data, int size) {
	memcpy(&constantPool[offset + adr], data, size);
}

int readLengthFromConstantPool(int base) {
	char val[4];
	int adr = base - (sizeof(lang_datatype) + sizeof(int));
	memcpy(&val, &constantPool[adr], 4);
	return arrayToInt(val);
}

//--------------------Vartable------------------------

object* addobject(char name[MAX_ID], objkind kind, lang_datatype type, int val,
		int lev, int adr, int size, object *dynIndex) {

	object *obj = topscope->next;
//checks multiple definitions in the same scope
	while (obj != NULL) {
		if (strcmp(obj->name, name) == 0) {
			error(24);
		}
		obj = obj->next;
	}
	obj = (object*) malloc(sizeof(object));

	strcpy(obj->name, name);
	obj->kind = kind;
	obj->type = type;
	obj->val = val;
	obj->lev = lev;
	obj->adr = adr;
	obj->size = size;
	obj->numParams = 0;
	obj->parameters = NULL;
	obj->dynIndex = dynIndex;
	topscope->last->next = obj;
	topscope->last = obj;
	obj->next = NULL;
	return obj;
}

void addParameterToProcedure(object *obj, int param) {
	obj->numParams++;
	obj->parameters = realloc(obj->parameters, obj->numParams * sizeof(int));
	obj->parameters[obj->numParams - 1] = param;
}

void createNewScope() {
	object *header;
	currentlevel++;
	header = (object*) malloc(sizeof(object));
	header->kind = kheader;
	header->down = topscope;
	header->last = header;
	header->next = NULL;
	topscope = header;
//	gen(cincrhl, 0, 0);
}

object* find(char _id[MAX_ID]) {
	object *hd, *obj;
	hd = topscope;

	while (hd != NULL) {
		obj = hd->next;
		while (obj != NULL) {
			if (strcmp(_id, obj->name) == 0)
				return obj;
			else
				obj = obj->next;
		}
		hd = hd->down;
	}
	printf("search for: %s\n", _id);
	error(12);
	return undef;
}

//---------------------Parser-------------------------

void program() {
	get_token();
	block(true, 0);
}
void block(bool newScope, int prm) {
	int adr = 5, heapAdr = 0, L0, params = 0;
	object *tmp;

	if (newScope)
		createNewScope();

	L0 = label();
	gen(cjmp, 0, 0);

	while (checknext(const_sym))
		const_def();

	while (checknext(datatype_sym)) {
		do {
			array_index();
			next(ident_sym);
			addVariable(&adr, &heapAdr);
		} while (checknext(comma_sym));
		next(semicolon_sym);
	}

	while (checknext(procedure_sym)) {
		params = 0;
		next(datatype_sym);
		next(ident_sym);
		tmp = addobject(prev_id, kproc, current_dt, 0, currentlevel, label(), 0,
		NULL);
		createNewScope();
		next(lparen_sym);
		if (checknext(datatype_sym)) {
			next(ident_sym);
			array_index();
			addParameter(params, tmp);
			params++;
			while (checknext(comma_sym)) {
				next(datatype_sym);
				next(ident_sym);
				array_index();
				addParameter(params, tmp);
				params++;
			}
		}
		tmp->numParams = params;
		updateParameterAddressesInTopScope(params);
		next(rparen_sym);
		next(lcbracket_sym);
		block(false, params);
		next(rcbracket_sym);
	}

	fixup(L0);
	gen(cint, 0, adr);
	gen(cpara, 0, prm);
	reserveHeapEntries();
	statement();
//	gen(cdecrhl, 0, 0);
	gen(copr, 0, oret); //TODO check if that could be a problem? when a "return" is the last statement of a block, there are two oret instructions behind each other
	topscope = topscope->down;
	currentlevel--;

}

void reserveHeapEntries() {
	object *obj = topscope;
	while (obj != NULL) {
		if (obj->kind != kvar) {
			obj = obj->next;
			continue;
		}
		if (obj->dynIndex == NULL) {
			gen(clit, 0, obj->size);
		} else {
			gen(clod, currentlevel - obj->dynIndex->lev, obj->dynIndex->adr);
		}
		switch (obj->type) {
		case dt_int_array:
			gen(cresheap, currentlevel - obj->lev, dt_int_array);
			break;
		case dt_float_array:
			gen(cresheap, currentlevel - obj->lev, dt_float_array);
			break;
		case dt_char_array:
			gen(cresheap, currentlevel - obj->lev, dt_char_array);
			break;
		case dt_bool_array:
			gen(cresheap, currentlevel - obj->lev, dt_bool_array);
			break;
		default:
			break;
		}

		obj = obj->next;
	}
}

void updateParameterAddressesInTopScope(int numberOfParams) {

	object *obj = topscope->next;

	while (obj != NULL) {
		obj->adr = obj->adr - numberOfParams;
		obj = obj->next;
	}

}
void addVariable(int *adr, int *heapAdr) {
	switch (current_dt) {
	case dt_int:
		if (array_dt) {
			if (dynamic_array)
				addobject(prev_id, kvar, dt_int_array, 0, currentlevel,
						*heapAdr, 0, dynIndex);
			else
				addobject(prev_id, kvar, dt_int_array, 0, currentlevel,
						*heapAdr, index_number, NULL);
			++(*heapAdr);
		} else {
			addobject(prev_id, kvar, dt_int, 0, currentlevel, *adr, 0, NULL);
			++(*adr);
		}

		break;
	case dt_float:
		if (array_dt) {
			if (dynamic_array)
				addobject(prev_id, kvar, dt_float_array, 0, currentlevel,
						*heapAdr, 0, dynIndex);
			else
				addobject(prev_id, kvar, dt_float_array, 0, currentlevel,
						*heapAdr, index_number, NULL);
			++(*heapAdr);
		} else {
			addobject(prev_id, kvar, dt_float, 0, currentlevel, *adr, 0, NULL);
			++(*adr);
		}
		break;
	case dt_char:
		if (array_dt) {
			if (dynamic_array)
				addobject(prev_id, kvar, dt_char_array, 0, currentlevel,
						*heapAdr, 0, dynIndex);
			else
				addobject(prev_id, kvar, dt_char_array, 0, currentlevel,
						*heapAdr, index_number, NULL);
			++(*heapAdr);
		} else {
			addobject(prev_id, kvar, dt_char, 0, currentlevel, *adr, 0, NULL);
			++(*adr);
		}
		break;
	case dt_bool:
		if (array_dt) {
			if (dynamic_array)
				addobject(prev_id, kvar, dt_bool_array, 0, currentlevel,
						*heapAdr, 0, dynIndex);
			else
				addobject(prev_id, kvar, dt_bool_array, 0, currentlevel,
						*heapAdr, index_number, NULL);
			++(*heapAdr);
		} else {
			addobject(prev_id, kvar, dt_bool, 0, currentlevel, *adr, 0, NULL);
			++(*adr);
		}
		break;
	default:
		error(39);
		break;
	}
}

void addParameter(int pos, object *proc) { //TODO check for array... look at addVariable
	int constPoolAdr;

	switch (current_dt) {
	case dt_int:
		if (array_dt) {
			constPoolAdr = createConstantPoolEntry(index_number * sizeof(int),
					dt_int_array);
			addobject(prev_id, kparameter, dt_int_array, constPoolAdr,
					currentlevel, pos, 0, NULL);
			addParameterToProcedure(proc, dt_int_array);
		} else {
			addobject(prev_id, kparameter, dt_int, 0, currentlevel, pos, 0,
			NULL);
			addParameterToProcedure(proc, dt_int);
		}
		break;
	case dt_float:
		if (array_dt) {
			constPoolAdr = createConstantPoolEntry(index_number * sizeof(int),
					dt_float_array);
			addobject(prev_id, kparameter, dt_float_array, constPoolAdr,
					currentlevel, pos, 0, NULL);
			addParameterToProcedure(proc, dt_float_array);
		} else {
			addobject(prev_id, kparameter, dt_float, 0, currentlevel, pos, 0,
			NULL);
			addParameterToProcedure(proc, dt_float);
		}
		break;
	case dt_char:
		if (array_dt) {
			constPoolAdr = createConstantPoolEntry(index_number * sizeof(char),
					dt_char_array);
			addobject(prev_id, kparameter, dt_char_array, constPoolAdr,
					currentlevel, pos, 0, NULL);
			addParameterToProcedure(proc, dt_char_array);
		} else {
			addobject(prev_id, kparameter, dt_char, 0, currentlevel, pos, 0,
			NULL);
			addParameterToProcedure(proc, dt_char);
		}
		break;
	case dt_bool:
		if (array_dt) {
			constPoolAdr = createConstantPoolEntry(index_number * sizeof(bool),
					dt_bool_array);
			addobject(prev_id, kparameter, dt_bool_array, constPoolAdr,
					currentlevel, pos, 0, NULL);
			addParameterToProcedure(proc, dt_bool_array);
		} else {
			addobject(prev_id, kparameter, dt_bool, 0, currentlevel + 1, pos, 0,
			NULL);
			addParameterToProcedure(proc, dt_bool);
		}
		break;
	default:
		error(39);
		break;
	}
}

void statement() {

	while (simple_statement() || loop_statement() || conditional_statement())
		if (lookahead == EOF)
			return;

//	while (true) {
//		if (simple_statement()) {
//			if (lookahead == EOF)
//				return;
//		} else if (loop_statement()) {
//			if (lookahead == EOF)
//				return;
//		} else if (conditional_statement()) {
//			if (lookahead == EOF)
//				return;
//		}
//	}

}

bool conditional_statement() {
	int L0, L1;
	if (checknext(if_sym)) {
		next(lparen_sym);
		condition();
		next(rparen_sym);
		L0 = label();
		gen(cjpc, 0, 0);
		next(lcbracket_sym);
		statement();
		next(rcbracket_sym);
		L1 = label();
		gen(cjmp, 0, 0);
		fixup(L0);
		if (checknext(else_sym)) {
			next(lcbracket_sym);
			statement();
			next(rcbracket_sym);
		}
		fixup(L1);
		return true;
	}
	return false;
}

bool loop_statement() {
	int L0, L1;
	if (checknext(while_sym)) {
		L0 = label();
		next(lparen_sym);
		condition();
		next(rparen_sym);
		L1 = label();
		gen(cjpc, 0, 0);
		next(lcbracket_sym);
		statement();
		next(rcbracket_sym);
		gen(cjmp, 0, L0);
		fixup(L1);
		return true;
	}
	return false;
}

bool simple_statement() {
	int indexNumberLocal;
	object *obj;
	char val[4];
	if (checknext(ident_sym)) {
		obj = find(prev_id);
		if (checknext(lbracket_sym)) {
			expression(); //todo check also, if the object type is an array datatype!
			if (current_dt != dt_int)
				error(42);
			next(rbracket_sym);
		}
		if (checknext(becomes_sym)) {
			if (checknext(lcbracket_sym)) {
				if (obj->type == dt_bool_array || obj->type == dt_char_array
						|| obj->type == dt_int_array
						|| obj->type == dt_float_array) {

					switch (obj->type) {
					case dt_int_array:
						indexNumberLocal = 0;
						obj->val = createConstantPoolEntry(
								obj->size * sizeof(int), dt_int_array);
						do {
							next(int_sym);
							intToArray(prev_int_value, val);
							convertEndian(val);
							writeSingleConstantPoolEntry(obj->val,
									indexNumberLocal * sizeof(int), val, 4);
							indexNumberLocal++;
						} while (checknext(comma_sym));
						break;
					case dt_float_array:
						indexNumberLocal = 0;
						obj->val = createConstantPoolEntry(
								obj->size * sizeof(int), dt_float_array);
						do {
							next(float_sym);
							intToArray(floatToInt(prev_float_value), val);
							convertEndian(val);
							writeSingleConstantPoolEntry(obj->val,
									indexNumberLocal * sizeof(int), val, 4);
							indexNumberLocal++;
						} while (checknext(comma_sym));
						break;
					case dt_char_array:
						indexNumberLocal = 0;
						obj->val = createConstantPoolEntry(
								obj->size * sizeof(char), dt_char_array);
						do {
							next(char_sym);
							writeSingleConstantPoolEntry(obj->val,
									indexNumberLocal * sizeof(char),
									&prev_char_value, 1);
							indexNumberLocal++;
						} while (checknext(comma_sym));
						break;
					case dt_bool_array:
						indexNumberLocal = 0;
						obj->val = createConstantPoolEntry(
								obj->size * sizeof(char), dt_bool_array);
						do {
							next(bool_sym);
							writeSingleConstantPoolEntry(obj->val,
									indexNumberLocal * sizeof(char),
									(char*) &prev_bool_value, 1);
							indexNumberLocal++;
						} while (checknext(comma_sym));
						break;
					default: //can never occur, because of if statement
						error(43);
						break;
					}

					gen(clit, 0, obj->val);
					gen(chinit, currentlevel - obj->lev, obj->adr);
					next(rcbracket_sym);
				} else {
					error(43);
				}
			} else if (checknext(string_sym)) {
				if (obj->type != dt_char_array)
					error(44);
				obj->val = createConstantPoolEntry(obj->size * sizeof(char),
						dt_char_array);
				overwriteConstantPoolEntry(obj->val, string_value,
						prev_ident_index - 1);
				gen(clit, 0, obj->val);
				gen(chinit, currentlevel - obj->lev, obj->adr);

			} else {
				expression();
				switch (obj->type) {
				case dt_void:
					error(45);
					break;
				case dt_bool_array:
					gen(chbsto, currentlevel - obj->lev, obj->adr);
					break;
				case dt_char_array:
					gen(chcsto, currentlevel - obj->lev, obj->adr);
					break;
				case dt_int_array:
					gen(chisto, currentlevel - obj->lev, obj->adr);
					break;
				case dt_float_array:
					gen(chfsto, currentlevel - obj->lev, obj->adr);
					break;
				default:
					gen(csto, currentlevel - obj->lev, obj->adr);
					break;
				}

			}

		} else if (checknext(lparen_sym)) {
			procedureCall(obj);
		} else if (checknext(incr_sym)) {
			if (obj->type == dt_int)
				gen(cincr, (int) (currentlevel - obj->lev), obj->adr);
			else if (obj->type == dt_int_array) {
				gen(chincr, (int) (currentlevel - obj->lev), obj->adr);
			} else
				error(59);
		} else if (checknext(decr_sym)) {
			if (obj->type == dt_int)
				gen(cdecr, (int) (currentlevel - obj->lev), obj->adr);
			else if (obj->type == dt_int_array) {
				gen(chdecr, (int) (currentlevel - obj->lev), obj->adr);
			} else
				error(59);
		} else if (checknext(arraycpy_sym)) {
			next(ident_sym);
			object *destination = find(prev_id);
			if (obj->type != destination->type)
				error(63);
			gen(clit, 0, currentlevel - obj->lev);
			gen(clit, 0, obj->adr);
			gen(carraydc, currentlevel - destination->lev, destination->adr);
		}

		else
			error(46);

	} else if (checknext(return_sym)) {
		expression();
//		gen(cdecrhl, 0, 0);
		gen(copr, 1, oret);
	} else if (checknext(taskletin_sym)) {
		next(ident_sym);
		obj = find(prev_id);
		switch (obj->type) {
		case dt_int:
			gen(clit, 0, popNextIntParameter(true));
			gen(csto, (int) (currentlevel - obj->lev), obj->adr);
			break;
		case dt_float:
			gen(clit, 0, popNextFloatParameter(true));
			gen(csto, (int) (currentlevel - obj->lev), obj->adr);
			break;
		case dt_char:
			gen(clit, 0, popNextCharParameter(true));
			gen(csto, (int) (currentlevel - obj->lev), obj->adr);
			break;
		case dt_bool:
			gen(clit, 0, popNextBoolParameter(true));
			gen(csto, (int) (currentlevel - obj->lev), obj->adr);
			break;
		case dt_int_array:
			gen(clit, 0, popNextIntArrayParameter(true));
			gen(chinit, currentlevel - obj->lev, obj->adr);
			break;
		case dt_float_array:
			gen(clit, 0, popNextFloatArrayParameter(true));
			gen(chinit, currentlevel - obj->lev, obj->adr);
			break;
		case dt_char_array:
			gen(clit, 0, popNextCharArrayParameter(true));
			gen(chinit, currentlevel - obj->lev, obj->adr);
			break;
		case dt_bool_array:
			gen(clit, 0, popNextBoolArrayParameter(true));
			gen(chinit, currentlevel - obj->lev, obj->adr);
			break;
		default:
			error(48);
			break;
		}
	} else if (checknext(taskletout_sym)) {
		expression();
		numofresults++;
		switch (current_dt) {
		case dt_int:
			gen(copr, 0, oitout);
			break;
		case dt_float:
			gen(copr, 0, oftout);
			break;
		case dt_char:
			gen(copr, 0, octout);
			break;
		case dt_bool:
			gen(copr, 0, obtout);
			break;
		case dt_int_array:
			gen(copr, currentlevel, ohitout);
			break;
		case dt_float_array:
			gen(copr, currentlevel, ohftout);
			break;
		case dt_char_array:
			gen(copr, currentlevel, ohctout);
			break;
		case dt_bool_array:
			gen(copr, currentlevel, ohbtout);
			break;
		default:
			printf("CurrentDatatype: %i", current_dt);
			error(48);
			break;
		}
	} else
		return false;

	next(semicolon_sym);
	return true;
}

void condition() {
	symbol relational_op;
//	symbol logical_op;
	if (checknext(not_sym)) {
		expression();
		gen(copr, 0, onot);
		return;
	} else {
		expression();
		relational_op = sym;
		if (checknext(eql_sym) || checknext(neq_sym) || checknext(lss_sym)
				|| checknext(leq_sym) || checknext(gtr_sym)
				|| checknext(geq_sym)) {
			expression();
			switch (relational_op) {
			case eql_sym:
				gen(copr, 0, oeql);
				return;
			case neq_sym:
				gen(copr, 0, oneq);
				return;
			case lss_sym:
				gen(copr, 0, olss);
				return;
			case geq_sym:
				gen(copr, 0, ogeq);
				return;
			case gtr_sym:
				gen(copr, 0, ogtr);
				return;
			case leq_sym:
				gen(copr, 0, oleq);
				return;
			default:
				error(19);
				return;
			}
		} else
			error(19);
		return;
	}

//	else {
//		condition();
//		logical_op = sym;
//		if (checknext(logand_sym) || checknext(logor_sym)) {
//			condition();
//			// codegen here for evaluation of cond. logop cond....
//			if (logical_op == logor_sym)
//				gen(copr, 0, ologor);
//			else if (logical_op == logand_sym)
//				gen(copr, 0, ologand);
//			else
//				error(1); // right error message?
//		} else
//			error(1); // right error message!
//
//	}

}
void expression() {
	int addop = sym;
	lang_datatype dt;

	if (checknext(plus_sym) || checknext(minus_sym)) {
		term();
		if (addop == minus_sym) {
			if (current_dt == dt_int || current_dt == dt_int_array)
				gen(copr, 0, oineg);
			else if (current_dt == dt_float || current_dt == dt_float_array)
				gen(copr, 0, ofneg);
			else if (current_dt == dt_char || current_dt == dt_char_array)
				gen(copr, 0, ocneg);
		}
	} else
		term();
	dt = current_dt;
	addop = sym;
	while (checknext(plus_sym) || checknext(minus_sym)) {
		term();
		if (dt != current_dt)
			error(31);
		if (addop == plus_sym) {
			if (current_dt == dt_int || current_dt == dt_int_array)
				gen(copr, 0, oiplus);
			else if (current_dt == dt_float || current_dt == dt_float_array)
				gen(copr, 0, ofplus);
			else if (current_dt == dt_char || current_dt == dt_char_array)
				gen(copr, 0, ocplus);
		} else {
			if (current_dt == dt_int || current_dt == dt_int_array)
				gen(copr, 0, oiminus);
			else if (current_dt == dt_float || current_dt == dt_float_array)
				gen(copr, 0, ofminus);
			else if (current_dt == dt_char || current_dt == dt_char_array)
				gen(copr, 0, ocminus);
			addop = sym;
		}
	}
}

void term() {
	int mulop;
	lang_datatype dt;
	factor();
	dt = current_dt;

	mulop = sym;
	while (checknext(times_sym) || checknext(div_sym) || checknext(modulo_sym)) {

		factor();
		if (dt != current_dt)
			error(30);
		if (mulop == times_sym) { //TODO make switch statement?!
			if (current_dt == dt_int || current_dt == dt_int_array)
				gen(copr, 0, oitimes);
			else if (current_dt == dt_float || current_dt == dt_float_array)
				gen(copr, 0, oftimes);
			else if (current_dt == dt_char || current_dt == dt_char_array)
				gen(copr, 0, octimes);
		} else if (mulop == div_sym) {
			if (current_dt == dt_int || current_dt == dt_int_array)
				gen(copr, 0, oidiv);
			else if (current_dt == dt_float || current_dt == dt_float_array)
				gen(copr, 0, ofdiv);
			else if (current_dt == dt_char || current_dt == dt_char_array)
				gen(copr, 0, ocdiv);
		} else if (mulop == modulo_sym) {
			if (current_dt == dt_int)
				gen(copr, 0, omod);
			else
				error(49);
		} else
			error(50);

		mulop = sym;
	}
}

void factor() {
	object *obj;
	if (checknext(ident_sym)) {
		obj = find(prev_id);

		switch (obj->kind) {
		case kconst:
			gen(clit, 0, obj->val);
			current_dt = obj->type;
			if (obj->type == dt_bool_array || obj->type == dt_float_array
					|| obj->type == dt_int_array || obj->type == dt_char_array
					|| obj->type == dt_void)
				error(47);

			break;
		case kvar:
			switch (obj->type) { //TODO redundant code... refactoring necessary!
			case dt_int:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_int;
				break;
			case dt_float:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_float;
				break;
			case dt_char:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_char;
				break;
			case dt_bool:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_bool;
				break;
			case dt_void:
				error(45);
				break;
			case dt_bool_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chblod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_bool;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_bool_array;
				}
				break;
			case dt_char_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chclod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_char;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_char_array;
				}
				break;
			case dt_int_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chilod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_int;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_int_array;
				}

				break;
			case dt_float_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chflod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_float;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_float_array;
				}
				break;
			}

			break;
		case kparameter: //TODO is this separation important? kvar == kparam?
			switch (obj->type) {
			case dt_int:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_int;
				break;
			case dt_float:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_float;
				break;
			case dt_char:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_char;
				break;
			case dt_bool:
				gen(clod, currentlevel - obj->lev, obj->adr);
				current_dt = dt_bool;
				break;
			case dt_void:
				error(45);
				break;
			case dt_bool_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chblod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_bool;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_bool_array;
				}
				break;
			case dt_char_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chclod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_char;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_char_array;
				}
				break;
			case dt_int_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chilod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_int;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_int_array;
				}

				break;
			case dt_float_array:
				if (checknext(lbracket_sym)) {
					expression();
					if (current_dt != dt_int)
						error(42);
					gen(chflod, currentlevel - obj->lev, obj->adr);
					next(rbracket_sym);
					current_dt = dt_float;
				} else {
					gen(clit, 0, obj->lev);
					gen(clit, 0, obj->adr);
					current_dt = dt_float_array;
				}
				break;
			}

			break;
		case kproc:
			next(lparen_sym);
			procedureCall(obj);
			break;
		case kheader:
			error(51);
			break;
		}
		return;
	} else if (checknext(lparen_sym)) {
		expression();
		next(rparen_sym);
		return;
	} else if (checknext(length_sym)) {
		next(lparen_sym);
		if (checknext(ident_sym)) {
			obj = find(prev_id);
			gen(clen, currentlevel - obj->lev, obj->adr);
		}
		current_dt = dt_int;
		next(rparen_sym);
	} else if (checknext(random_sym)) {
		next(lparen_sym);
		if (checknext(datatype_sym)) {
			gen(cdtrnd, 0, current_dt);
		} else {
			expression();
			if (current_dt != dt_int && current_dt != dt_float)
				error(52);
			gen(crnd, 0, current_dt);
		}
		next(rparen_sym);

	} else if (checknext(sqrt_sym)) {
		next(lparen_sym);

		expression();
		switch (current_dt) {
		case dt_int:
			gen(clit, 0, 2);
			gen(cinroot, 0, 0);
			current_dt = dt_float;
			break;
		case dt_float:
			gen(clit, 0, floatToInt(2.0f));
			gen(cfnroot, 0, 0);
			break;
		default:
			error(53);
			break;
		}
		next(rparen_sym);
	} else if (checknext(sin_sym)) {
		next(lparen_sym);
		expression();
		switch (current_dt) {
		case dt_int:
			gen(cisin, 0, 0);
			current_dt = dt_float;
			break;
		case dt_float:
			gen(cfsin, 0, 0);
			break;
		default:
			error(53);
			break;
		}
		next(rparen_sym);
	} else if (checknext(cos_sym)) {
		next(lparen_sym);
		expression();
		switch (current_dt) {
		case dt_int:
			gen(cicos, 0, 0);
			current_dt = dt_float;
			break;
		case dt_float:
			gen(cfcos, 0, 0);
			break;
		default:
			error(53);
			break;
		}
		next(rparen_sym);
	} else if (checknext(tan_sym)) {
		next(lparen_sym);
		expression();
		switch (current_dt) {
		case dt_int:
			gen(citan, 0, 0);
			current_dt = dt_float;
			break;
		case dt_float:
			gen(cftan, 0, 0);
			break;
		default:
			error(53);
			break;
		}
		next(rparen_sym);
	} else if (checknext(nroot_sym)) {
		lang_datatype exprDt;
		next(lparen_sym);
		expression();
		exprDt = current_dt;
		next(comma_sym);
		expression();
		switch (exprDt) {
		case dt_int:
			gen(cinroot, 0, 0);
			current_dt = dt_float;
			break;
		case dt_float:
			gen(cfnroot, 0, 0);
			current_dt = dt_float;
			break;
		default:
			error(54);
			break;
		}
		next(rparen_sym);
	} else if (checknext(pow_sym)) {
		lang_datatype exprDt;
		next(lparen_sym);
		expression();
		exprDt = current_dt;
		next(comma_sym);
		expression();
		switch (exprDt) {
		case dt_int:
			gen(cipow, 0, 0);
			break;
		case dt_float:
			gen(cfpow, 0, 0);
			current_dt = dt_float;
			break;
		default:
			error(55);
			break;
		}
		next(rparen_sym);
	} else if (checknext(log_sym)) {
		next(lparen_sym);
		expression();
		if (current_dt != dt_int && current_dt != dt_float)
			error(64);
		gen(clog, 0, current_dt);
		current_dt = dt_float;
		next(rparen_sym);
	} else if (checknext(log2_sym)) {
		next(lparen_sym);
		expression();
		if (current_dt != dt_int && current_dt != dt_float)
			error(64);
		gen(clog2, 0, current_dt);
		current_dt = dt_float;
		next(rparen_sym);
	} else if (checknext(log10_sym)) {
		next(lparen_sym);
		expression();
		if (current_dt != dt_int && current_dt != dt_float)
			error(64);
		gen(clog10, 0, current_dt);
		current_dt = dt_float;
		next(rparen_sym);
	} else if (checknext(exp_sym)) {
		next(lparen_sym);
		expression();
		if (current_dt != dt_int && current_dt != dt_float)
			error(64);
		gen(cexp, 0, current_dt);
		current_dt = dt_float;
		next(rparen_sym);
	} else if (value()) {

	} else {
		error(56);
	}
}

void procedureCall(object *obj) {
	int paramCount = 0;

	if (obj->numParams > 0) {
		do {
			if (putProcedureParameterOnStack() != obj->parameters[paramCount])
				error(57);
			paramCount++;
		} while (checknext(comma_sym));
	}

	if (paramCount != obj->numParams) {
		error(41);
	}
	next(rparen_sym);

	if (obj->type == dt_bool_array || obj->type == dt_float_array
			|| obj->type == dt_int_array || obj->type == dt_char_array)
		error(47);
	gen(ccal, currentlevel - obj->lev, obj->adr);
	current_dt = obj->type;
}

lang_datatype putProcedureParameterOnStack() {
	expression();
	return current_dt;
}

bool value() {
	if (checknext(char_sym)) {
		gen(clit, 0, (int) prev_char_value);
		current_dt = dt_char;
		return true;
	} else if (checknext(float_sym)) {
		gen(clit, 0, floatToInt(prev_float_value));
		current_dt = dt_float;
		return true;
	} else if (checknext(int_sym)) {
		gen(clit, 0, prev_int_value);
		current_dt = dt_int;
		return true;
	} else if (checknext(bool_sym)) {
		gen(clit, 0, (int) prev_bool_value);
		current_dt = dt_bool;
		return true;
	}
	return false;

}

void array_index() {
	object *obj;
	dynIndex = NULL;
	dynamic_array = false;
	if (checknext(lbracket_sym)) {
		if (checknext(int_sym)) {
			index_number = prev_int_value;
		} else if (checknext(ident_sym)) {
			obj = find(prev_id);
			if (obj->kind == kconst && obj->type == dt_int)
				index_number = obj->val;
			else if ((obj->kind == kvar && obj->type == dt_int)
					|| (obj->kind == kparameter && obj->type == dt_int)) {
				dynamic_array = true;
				dynIndex = obj;
			}
		} else
			error(62);
		next(rbracket_sym);
		array_dt = true;
		return;
	}
	array_dt = false;
}

int popNextIntParameter(bool marker) {
	if (da_parameters[paramp++] == dt_int) {
		char val[4];
		val[0] = da_parameters[paramp++];
		val[1] = da_parameters[paramp++];
		val[2] = da_parameters[paramp++];
		val[3] = da_parameters[paramp++];
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_int);
		}

		return arrayToInt(val);
	}
	error(40);
	datatype_error = true;
	return 0;
}
int popNextFloatParameter(bool marker) {
	if (da_parameters[paramp++] == dt_float) {
		char val[4];
		val[0] = da_parameters[paramp++];
		val[1] = da_parameters[paramp++];
		val[2] = da_parameters[paramp++];
		val[3] = da_parameters[paramp++];
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_float);
		}
		return floatToInt(arrayToFloat(val));
	}
	error(40);
	datatype_error = true;
	return 0;
}
int popNextBoolParameter(bool marker) {
	if (da_parameters[paramp++] == dt_bool) {
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_bool);
		}
		return (int) da_parameters[paramp++];
	}
	error(40);
	datatype_error = true;
	return 0;
}
int popNextCharParameter(bool marker) {
	if (da_parameters[paramp++] == dt_char) {
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_char);
		}
		return (int) da_parameters[paramp++];
	}
	error(40);
	datatype_error = true;
	return 0;
}

int popNextIntArrayParameter(bool marker) { //TODO arrays as tasklet parameters! for resend the parameters need to be set to the new value...the heap must be recreated
	if (da_parameters[paramp++] == dt_int_array) {
		char val[4];
		val[0] = da_parameters[paramp++];
		val[1] = da_parameters[paramp++];
		val[2] = da_parameters[paramp++];
		val[3] = da_parameters[paramp++];
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_int_array);
		}
		int length = arrayToInt(val);
		int hsadr = createConstantPoolEntry(length * sizeof(int), dt_int_array);
		overwriteConstantPoolEntry(hsadr, &da_parameters[paramp],
				length * sizeof(int));
		paramp = paramp + length * sizeof(int);
		return hsadr;
	}
	error(40);
	datatype_error = true;
	return 0;
}
int popNextFloatArrayParameter(bool marker) {
	if (da_parameters[paramp++] == dt_float_array) {
		char val[4];
		val[0] = da_parameters[paramp++];
		val[1] = da_parameters[paramp++];
		val[2] = da_parameters[paramp++];
		val[3] = da_parameters[paramp++];
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_float_array);
		}
		int length = arrayToInt(val);
		int hsadr = createConstantPoolEntry(length * sizeof(int),
				dt_float_array);
		overwriteConstantPoolEntry(hsadr, &da_parameters[paramp],
				length * sizeof(int));
		paramp = paramp + length * sizeof(int);
		return hsadr;
	}
	error(40);
	datatype_error = true;
	return 0;
}
int popNextBoolArrayParameter(bool marker) {
	if (da_parameters[paramp++] == dt_bool_array) {
		char val[4];
		val[0] = da_parameters[paramp++];
		val[1] = da_parameters[paramp++];
		val[2] = da_parameters[paramp++];
		val[3] = da_parameters[paramp++];
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_bool_array);
		}
		int length = arrayToInt(val);
		int hsadr = createConstantPoolEntry(length * sizeof(char),
				dt_bool_array);
		overwriteConstantPoolEntry(hsadr, &da_parameters[paramp],
				length * sizeof(char));
		paramp = paramp + length * sizeof(char);
		return hsadr;
	}
	error(40);
	datatype_error = true;
	return 0;
}
int popNextCharArrayParameter(bool marker) {
	if (da_parameters[paramp++] == dt_char_array) {
		char val[4];
		val[0] = da_parameters[paramp++];
		val[1] = da_parameters[paramp++];
		val[2] = da_parameters[paramp++];
		val[3] = da_parameters[paramp++];
		if (marker) {
			numberOfParameters++;
			markCurrentInstructionAsParameter(dt_char_array);
		}
		int length = arrayToInt(val);
		int hsadr = createConstantPoolEntry(length * sizeof(char),
				dt_char_array);
		overwriteConstantPoolEntry(hsadr, &da_parameters[paramp],
				length * sizeof(char));
		paramp = paramp + length * sizeof(char);
		return hsadr;
	}
	error(40);
	datatype_error = true;
	return 0;
}

void reparameterizeByteCode() {
	int i = 0;

	int inform = 0, va = 0;
	while (i < numberOfParameters) {
		switch (parameterInformation[i]) {
		case dt_int:
			inform = parameterInformation[i + 1];
			va = popNextIntParameter(false);
			resetParameter(inform, va);
			break;
		case dt_float:
			resetParameter(parameterInformation[i + 1],
					popNextFloatParameter(false));
			break;
		case dt_char:
			resetParameter(parameterInformation[i + 1],
					popNextCharParameter(false));
			break;
		case dt_bool:
			resetParameter(parameterInformation[i + 1],
					popNextBoolParameter(false));
			break;
		case dt_int_array:
			resetParameter(parameterInformation[i + 1],
					popNextIntArrayParameter(false));
			break;
		case dt_float_array:
			resetParameter(parameterInformation[i + 1],
					popNextFloatArrayParameter(false));
			break;
		case dt_char_array:
			resetParameter(parameterInformation[i + 1],
					popNextCharArrayParameter(false));
			break;
		case dt_bool_array:
			resetParameter(parameterInformation[i + 1],
					popNextBoolArrayParameter(false));
			break;
		default:
			break;
		}
		i += 2;
	}
}

void markCurrentInstructionAsParameter(lang_datatype type) {
	numberOfParameters++;
	parameterInformation = realloc(parameterInformation,
			numberOfParameters * sizeof(int));
	parameterInformation[numberOfParameters - 2] = type;
	parameterInformation[numberOfParameters - 1] = L;
}

void const_def() {
	char name[MAX_ID];
	printf("Entering ConstDef\n");
	fflush(stdout);
	lang_datatype type;
	do {
		next(datatype_sym);
		type = current_dt;
		next(ident_sym);
		strcpy(name, prev_id);
		next(becomes_sym);
		const_value(name, type);
	} while (checknext(comma_sym));
	next(semicolon_sym);
}

void const_value(char name[MAX_ID], lang_datatype type) {
	if (checknext(char_sym)) {
		if (current_dt != type) {
			printf("char expected!");
			error(37);
			return;
		}
		addobject(name, kconst, dt_char, prev_char_value, 0, 0, 0, NULL);
		return;
	} else if (checknext(float_sym)) {
		if (current_dt != type) {
			printf("float expected!");
			error(37);
			return;
		}
		addobject(name, kconst, dt_float, floatToInt(prev_float_value), 0, 0, 0,
		NULL);
		return;
	} else if (checknext(int_sym)) {
		if (current_dt != type) {
			printf("int expected!");
			error(37);
			return;
		}
		addobject(name, kconst, dt_int, prev_int_value, 0, 0, 0, NULL);
		return;
	} else if (checknext(bool_sym)) {
		if (current_dt != type) {
			printf("bool expected!");
			error(37);
			return;
		}
		addobject(name, kconst, dt_bool, boolToInt(prev_bool_value), 0, 0, 0,
		NULL);
		return;
	} else {
		printf("Error: value was expected for datatype %i", current_dt);
	}
}

bool checknext(symbol s) {
	if (sym == s) {
		if (lookahead != EOF)
			get_token();
		return true;
	} else {
		return false;
	}
}

void next(symbol s) {
	if (sym == s) {
		if (lookahead != EOF)
			get_token();

	} else {
		printf(
				"Error: %i was expected! Instead %i was found there! Codepointer: %i \n",
				s, sym, codepointer);
		error(27);
	}
}

//---------------------Scanner------------------------

void get_token() {
	symbol op_sym;
	char c = readnextchar();
	symbol keyword;
	string_value = NULL; //TODO problem?
	prev_ident_index = ident_index;
	ident_index = 0;
	num_digits = 0;
	cleararray(prev_id, MAX_ID);
	strcpy(prev_id, tmp_ident);
	cleararray(tmp_ident, MAX_ID);
	prev_bool_value = bool_value;
	prev_char_value = char_value;
	char_value = 0;
	int_value = 0;
	float_value = 0.0;

	if (c == EOF) {
		sym = dummy_sym;
		return;
	}

	while (is_whitespace(c))
		c = readnextchar();

	if (c == 39) {
		c = readnextchar();
		char_value = c;
		sym = char_sym;
		c = readnextchar();
		if (c != 39)
			error(38);
		return;
	}

	if (c == 34) {
		readstring();
		sym = string_sym;
		return;
	}

	while (is_letter(c)) {
		tmp_ident[ident_index] = c;
		if (ident_index >= MAX_ID) {
			error(0);
			return;
		}
		if (!is_letter(lookahead)) {
			tmp_ident[ident_index + 1] = '\0';
			keyword = is_keyword(tmp_ident);
			if (keyword == -1) {
				sym = ident_sym;
				return;
			} else {
				sym = keyword;
				return;
			}
		}
		c = readnextchar();
		ident_index++;
	}
	if (is_digit(c))
		current_value = dt_int;
	while (is_digit(c)) {
		int_value = int_value * 10 + (c - '0');
		num_digits++;
		if (!is_digit(lookahead)) {
			if (lookahead != '.') {
				if (current_value == dt_int) {
					prev_int_value = int_value;
					sym = int_sym;
					return;
				} else if (current_value == dt_float) { //end float read
					float tmp = int_value * pow(10, -num_digits);
					float_value += tmp;
					prev_float_value = float_value;
					sym = float_sym;
					return;
				}
			} else {
				c = readnextchar();
				if (is_digit(lookahead) || (current_value != dt_float)) {
					current_value = dt_float;
					float_value = (float) int_value;
					int_value = 0;
					num_digits = 0;
				} else {
					error(29);
				}
			}
		}
		c = readnextchar();
	}

	if ((op_sym = identify_operator(c)) != -1) {
		sym = op_sym;
		return;
	}

//	else
//		error(36);

	return;
}

void readstring() {
	char c = readnextchar();
	while (c != 34) {
		string_value = realloc(string_value, (ident_index + 1) * sizeof(char));
		string_value[ident_index] = c;
		ident_index++;
		c = readnextchar();
	}
	string_value = realloc(string_value, (ident_index + 1) * sizeof(char));
	string_value[ident_index] = '\0';
	ident_index++;
}

char readnextchar(void) {
	char value;
	if (codepointer < codelength) {
		value = sourcecode[codepointer++];
		if (codepointer < codelength) {
			lookahead = sourcecode[codepointer];
		} else {
			lookahead = EOF;
		}
	} else {
		value = EOF;
	}

	return value;
}

bool is_whitespace(char c) {

	if (c == ' ' || c == '\t')
		return true;
	if (c == '\n' || c == 13 || c == 10) {
		linecounter++;
		return true;
	}
	return false;
}

bool is_digit(char c) {
	if ((c >= 48) && (c <= 57))
		return true;
	else
		return false;
}

bool is_letter(char c) {
	if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'))
		return true;
	return false;
}

symbol identify_operator(char c) {

	switch (c) {
	case '*':
		return times_sym;
	case '/':
		return div_sym;
	case '{':
		return lcbracket_sym;
	case '}':
		return rcbracket_sym;
	case '=':
		return eql_sym;
	case ',':
		return comma_sym;
	case ';':
		return semicolon_sym;
	case ':':
		if (lookahead == '=') {
			readnextchar();
			return becomes_sym;
		} else {
			error(7);
			break;
		}
	case '<':
		if (lookahead == '=') {
			readnextchar();
			return leq_sym;
		} else if (lookahead == '<') {
			readnextchar();
			return taskletout_sym;
		}
		return lss_sym;
	case '>':
		if (lookahead == '=') {
			readnextchar();
			return geq_sym;
		} else if (lookahead == '>') {
			readnextchar();
			return taskletin_sym;
		}
		return gtr_sym;
	case '#':
		return neq_sym;
	case '+':
		if (lookahead == '+') {
			readnextchar();
			return incr_sym;
		} else
			return plus_sym;
	case '%':
		return modulo_sym;
	case '-':
		if (lookahead == '-') {
			readnextchar();
			return decr_sym;
		} else if (lookahead == '>') {
			readnextchar();
			return arraycpy_sym;
		} else
			return minus_sym;
	case '(':
		return lparen_sym;
	case ')':
		return rparen_sym;
	case '!':
		return not_sym;
	case '&':
		if (lookahead == '&') {
			readnextchar();
			return logand_sym;
		} else {
			error(34);
			break;
		}
	case '|':
		if (lookahead == '|') {
			readnextchar();
			return logor_sym;
		} else {
			error(35);
			break;
		}
	case '\'':
		return apostrophe_sym;
	case '\"':
		return quot_sym;
	case '[':
		return lbracket_sym;
	case ']':
		return rbracket_sym;
	default:
		return -1;
	}
	return -1;
}

symbol is_keyword(char *s) {
	if (strcmp(s, s_const) == 0)
		return const_sym;
	if (strcmp(s, s_procedure) == 0)
		return procedure_sym;
	if (strcmp(s, s_return) == 0)
		return return_sym;
	if (strcmp(s, s_if) == 0)
		return if_sym;
	if (strcmp(s, s_else) == 0)
		return else_sym;
	if (strcmp(s, s_while) == 0)
		return while_sym;
	if (strcmp(s, s_int) == 0) {
		current_dt = dt_int;
		array_dt = false;
		return datatype_sym;
	}
	if (strcmp(s, s_float) == 0) {
		current_dt = dt_float;
		array_dt = false;
		return datatype_sym;
	}
	if (strcmp(s, s_char) == 0) {
		current_dt = dt_char;
		array_dt = false;
		return datatype_sym;
	}
	if (strcmp(s, s_bool) == 0) {
		current_dt = dt_bool;
		array_dt = false;
		return datatype_sym;
	}
	if (strcmp(s, s_void) == 0) {
		current_dt = dt_void;
		array_dt = false;
		return datatype_sym;
	}
	if (strcmp(s, s_true) == 0) {
		bool_value = true;
		array_dt = false;
		return bool_sym;
	}
	if (strcmp(s, s_false) == 0) {
		bool_value = false;
		array_dt = false;
		return bool_sym;
	}
	if (strcmp(s, s_length) == 0) {
		return length_sym;
	}
	if (strcmp(s, s_rnd) == 0) {
		return random_sym;
	}
	if (strcmp(s, s_sqrt) == 0) {
		return sqrt_sym;
	}
	if (strcmp(s, s_nroot) == 0) {
		return nroot_sym;
	}
	if (strcmp(s, s_tan) == 0) {
		return tan_sym;
	}
	if (strcmp(s, s_cos) == 0) {
		return cos_sym;
	}
	if (strcmp(s, s_sin) == 0) {
		return sin_sym;
	}
	if (strcmp(s, s_pow) == 0) {
		return pow_sym;
	}
	if (strcmp(s, s_log) == 0) {
		return log_sym;
	}
	if (strcmp(s, s_log2) == 0) {
		return log2_sym;
	}
	if (strcmp(s, s_log10) == 0) {
		return log10_sym;
	}
	if (strcmp(s, s_exp) == 0) {
		return exp_sym;
	}

	if (strcmp(s, s_arraycpy) == 0) {
		return arraycpy_sym;
	}

	return -1;

}

void cleararray(char* a, int length) {
	while (length > 0) {
		a[length - 1] = '\0';
		length--;
	}

}

char* errors[] =
		{
				"ID too long", //0
				"Unexpected end of file", //1
				"Program has to start with const, var, procedure declaration or statement", //2
				"begin, if, while or do expected", //3
				"id expected", //4
				"Too many identifier", //5
				"id must follow const", //6
				"= expected", //7
				"number expected", //8
				"; expected", //9
				". expected", // 10
				"procedure nesting level exeeded", //11
				"id not found", //12
				"lvalue expected", //13
				":= expected", //14
				"id must be a procedure", //15
				"end expected", //16
				"then expected", //17
				"do expected", //18
				"= | # | < | <= | > | >= expected", //19
				"condition expected", //20
				"+, - (, ident or number expected", // 21
				"ident, number, ( expected", //22
				") expected", //23
				"name double defined in same scope", //24
				"const or variable expected", //25
				"Statement error: ident, call, ?, !, begin, if, while expected", //26
				"Parsing error", //27
				"id must be a variable", //28
				"wrong float data type format", //29
				"data types are mixed up in term", //30
				"data types mixed up in expression", //31
				"integer instead of float value expected", //32
				"float instead of integer value expected", //33
				"& symbol accepted, unknown operator!", //34
				"| symbol accepted, unknown operator!", //35
				"unknows symbol, operator found!", //36
				"wrong value for datatype!", //37
				"an apostrophe must be at the end of a char definition!", //38
				"wrong datatypes!", //39
				"Wrong datatype in parameterlist from application received!", //40
				"Number of procedure parameters is not correct!", //41
				"index must be an integer type expression", //42
				"only arrays can be assigned with values that way", //43
				"string values cannot be assigned to a variable other than char array", //44
				"a void data type is inadmissible here", //45
				"statement error, after ident the expression is non valid", //46
				"unknown/invalid datatype found", //47
				"tasklet out/in is not accepted for this datatype", //48
				"modulo accepts integer values only", //49
				"operator not valid for term", //50
				"header object not allowed here", //51
				"only int and float expressions are allowed for the random function", //52
				"only int and float expressions are allowed for the sqrt or tan function", //53
				"only int and float expressions are allowed for the nroot function", //54
				"only int and float expressions are allowed for the pow function", //55
				"non valid factor", //56
				"after comma another parameter is expected", //57
				"only paramter or variable types are accepted", //58
				"increment is only for integer datatypes", //59
				"decrement is only for integer datatypes", //60
				"resend not possible, no former bytecode available!", //61
				"only integers or integer const are allowed as array index initialization", //62
				"only allowed for arrays from the same data type and the same size!", //63
				"only float values are allowed for log, log2, and log10!" //64

		};

void error(int error) {

	fprintf(stderr, "Line: %i : %s...Codepointer: %i\n", linecounter,
			errors[error], codepointer);
//	if (error == 12)
//		printf("id %s\n", id);
	compiler_error = true;
//	exit(-1);
}

