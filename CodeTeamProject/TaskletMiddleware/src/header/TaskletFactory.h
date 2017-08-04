/*
 * StaticTaskletFactory.h
 *
 *  Created on: 19.08.2014
 *      Author: Dominik
 */

#ifndef TASKLETFACTORY_H_
#define TASKLETFACTORY_H_

#define MAX_ID 32 //TODO change to generic length?

#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
//#include <dos.h>
#include <math.h>
#include <sys/time.h>

#include "TaskletProtocol.h"
#include "TaskletExecutionEnvironment.h"
#include "SocketInterface.h"
#include "Orchestration.h"

typedef enum factorymode {
	tfMode_submitComputation = 0,
	tfMode_requestByteCode = 1,
	tfMode_requestDebugInformation = 2
} factorymode;

typedef enum symbol {
	const_sym = 0,
	becomes_sym = 1,
	comma_sym = 2,
	semicolon_sym = 3,
	procedure_sym = 4,
	lcbracket_sym = 5,
	rcbracket_sym = 6,
	return_sym = 7,
	if_sym = 8,
	not_sym = 9,
	times_sym = 10,
	div_sym = 11,
	lparen_sym = 12,
	rparen_sym = 13,
	taskletin_sym = 14,
	taskletout_sym = 15,
	while_sym = 16,
	int_sym = 17,
	float_sym = 18,
	char_sym = 19,
	void_sym = 20,
	bool_sym = 21,
	eql_sym = 22,
	neq_sym = 23,
	lss_sym = 24,
	leq_sym = 25,
	gtr_sym = 26,
	geq_sym = 27,
	logand_sym = 28,
	logor_sym = 29,
	plus_sym = 30,
	minus_sym = 31,
	apostrophe_sym = 32,
	quot_sym = 33,
	true_sym = 34,
	false_sym = 35,
	lbracket_sym = 36,
	rbracket_sym = 37,
	floatsep_sym = 38,

	string_sym = 39,
	ident_sym = 40,
	number_sym = 41,
	operator_sym = 42,
	termination_sym = 43,
	datatype_sym = 44,
	modulo_sym = 45,
	length_sym = 46,
	else_sym = 47,
	random_sym = 48,
	sqrt_sym = 49,
	nroot_sym = 50,
	pow_sym = 51,
	incr_sym = 52,
	decr_sym = 53,
	arraycpy_sym = 54,
	log_sym = 55,
	log2_sym = 56,
	log10_sym = 57,
	tan_sym = 58,
	cos_sym = 59,
	sin_sym = 60,
	dummy_sym = 61,
	exp_sym = 62

} symbol;

typedef enum kinds {
	kconst, kvar, kproc, kheader, kparameter
} objkind;

typedef struct object {
	char name[MAX_ID];
	objkind kind;
	lang_datatype type;
	int val, lev, adr, size, *parameters, numParams;
	struct object *next, *last, *down, *dynIndex;

} object;

typedef struct bytecodeEntry {
	int appPort;
	instruction *bytecode;
	int bcLength;
	int *parameterInformation;
	int parameterInfoLength;
	struct bytecodeEntry *next;
} bytecodeEntry;

static const char s_procedure[] = "procedure";
static const char s_const[] = "const";
static const char s_int[] = "int";
static const char s_float[] = "float";
static const char s_char[] = "char";
static const char s_bool[] = "bool";
static const char s_void[] = "void";
static const char s_if[] = "if";
static const char s_else[] = "else";
static const char s_while[] = "while";
static const char s_not[] = "!";
static const char s_or[] = "||";
static const char s_and[] = "&&";
static const char s_neq[] = "#";
static const char s_lparen[] = "(";
static const char s_rparen[] = ")";
static const char s_times[] = "*";
static const char s_plus[] = "+";
static const char s_comma[] = ",";
static const char s_modulo[] = "%";
static const char s_minus[] = "-";
static const char s_period[] = ".";
static const char s_div[] = "/";
static const char s_becomes[] = ":=";
static const char s_semicolon[] = ";";
static const char s_arraycpy[] = "->";
static const char s_leq[] = "<=";
static const char s_lss[] = "<";
static const char s_eql[] = "=";
static const char s_gtr[] = ">";
static const char s_geq[] = ">=";
static const char s_read[] = ">>";
static const char s_write[] = "<<";
static const char s_incr[] = "++";
static const char s_decr[] = "--";
static const char s_lcbracket[] = "{";
static const char s_rcbracket[] = "}";
static const char s_return[] = "return";
static const char s_true[] = "true";
static const char s_false[] = "false";
static const char s_quot[] = "\"";
static const char s_length[] = "length";
static const char s_rnd[] = "random";
static const char s_sqrt[] = "sqrt";
static const char s_nroot[] = "nroot";
static const char s_pow[] = "pow";
static const char s_log[] = "log";
static const char s_log2[] = "logII";
static const char s_log10[] = "logX";
static const char s_tan[] = "tan";
static const char s_cos[] = "cos";
static const char s_sin[] = "sin";
static const char s_exp[] = "exp";

void newFactoryInstance(void* temp);
void startFactory();
bool is_whitespace(char);
bool is_digit(char);
bool is_letter(char);
symbol identify_operator(char);
symbol is_keyword(char*);
void cleararray(char*, int);
void error(int);
void get_token();
char readnextchar();
void printsymbol();
void readstring();
bool checknext(symbol);
void next(symbol);
void program();
void block(bool, int);
void statement();
bool simple_statement();
bool conditional_statement();
bool loop_statement();
void condition();
void expression();
void term();
void factor();
void procedurecall();
void loop();
void parameterlist();
void paramters();
void assignarray();
void const_def();
int createConstantPoolEntry(int, lang_datatype);
void overwriteConstantPoolEntry(int, char*, int);
void writeSingleConstantPoolEntry(int, int, char*, int);
int readLengthFromConstantPool(int);
void var_dekl(int);
void const_value();
void array_index();
bool value();
void reserveHeapEntries();
void addVariable(int*, int*);
void addParameter(int, object*);
void addParameterToProcedure(object*, int);
object* addobject(char[MAX_ID], objkind, lang_datatype, int, int, int, int,
		object*);
object* find(char[MAX_ID]);
lang_datatype putProcedureParameterOnStack();
void procedureCall();
void initializeCompiler();
void createNewScope();
bool standardFunctions();
void updateParameterAddressesInTopScope(int);
void updateByteCodeCacheEntry();
bool getByteCodeCacheEntry();
int popNextIntParameter(bool);
int popNextFloatParameter(bool);
int popNextBoolParameter(bool);
int popNextCharParameter(bool);

int popNextIntArrayParameter(bool);
int popNextFloatArrayParameter(bool);
int popNextBoolArrayParameter(bool);
int popNextCharArrayParameter(bool);
void markCurrentInstructionAsParameter(lang_datatype);
void update_lookahead();
void newTaskletRequest(SOCKET);
void softResetForReparameterization();
void reuseTaskletCodeWithNewParameter(SOCKET);
bool receiveprogram(SOCKET);
void sendtobroker();
void run();
void hardReset();
void reparameterizeByteCode();
void printCode();

//----------Compiler-----------
//----------Compiler-----------

//Handling input
int codepointer;
FILE *fp;
char *sourcecode;
int codelength;

//Scanning
int lookahead;
int ident_index, prev_ident_index;
int num_digits;
char* string_value;

bool end;

//Errorhandling
bool datatype_error;
bool compiler_error;
int linecounter;
//Tokenizing
int sym;

int prev_int_value;
int int_value;
float prev_float_value;
float float_value;
char char_value;
char prev_char_value;
bool bool_value;
bool prev_bool_value;

int index_number;
bool array_dt, dynamic_array;
object *dynIndex;

lang_datatype current_dt;
lang_datatype current_value;

//Codegen
int L;
struct object *symtbl;
struct object *topscope, *bottom, *undef;
int currentlevel;

char prev_id[MAX_ID];
char tmp_ident[MAX_ID];

char *constantPool;
int constantPoolSize, numberOfHeapEntries;

//Result forwarding
int numofresults;
char *da_parameters;
int paramp;

bytecodeEntry *bytecodeCache;

SOCKADDR_IN addr;

tasklet *incomingTasklet, *outgoingTasklet;

instruction *bytecode;
char *constantPool;
int constantPoolSize, *parameterInformation, numberOfParameters;

factorymode currentFactoryMode;
pimutex interpreterMutex;
//Eval Time

#endif /* TASKLETFACTORY_H_ */
