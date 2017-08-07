/*
 * TaskletExecutionEnvironment.h
 *
 *  Created on: 05.02.2015
 *      Author: Dominik
 */

#ifndef HEADER_TASKLETEXECUTIONENVIRONMENT_H_
#define HEADER_TASKLETEXECUTIONENVIRONMENT_H_

typedef enum lang_datatypes {
	dt_int = 1,
	dt_float = 2,
	dt_char = 3,
	dt_bool = 4,
	dt_int_array = 5,
	dt_float_array = 6,
	dt_char_array = 7,
	dt_bool_array = 8,
	dt_void = 9
} lang_datatype;

enum commands {
	//lit commands for standard literals
	clit = 0,
	//operator interstuction
	copr = 1,
	//lod commands for standard variables
	clod = 2,
	//sto commands for standard variables
	csto = 3,
	//cal commands for standard procedures and their return data types
	ccal = 4,
	//int for reserving stack space
	cint = 5,
	//standard jump command
	cjmp = 6,
	//conditional jump command
	cjpc = 7,
	//lod commands for heap values that are not fit into a 4 byte container
	chilod = 8,
	chclod = 9,
	chblod = 10,
	chflod = 11,
	//sto commands for heap values that are not fit into a 4 byte container
	chisto = 12,
	chfsto = 13,
	chbsto = 14,
	chcsto = 15,
	cpara = 16,
	clen = 17,
	crnd = 18,
	cdtrnd = 19,
	cinroot = 20,
	cfnroot = 21,
	cipow = 22,
	cfpow = 23,
	cincr = 24,
	cdecr = 25,
	chinit = 26,
	cresheap = 27, //resereves heapspace entry
	cincrhl = 28,
	carraydc = 29, //deep copy for arrays
	chincr = 30,
	chdecr = 31,
	clog = 32,
	clog2 = 33,
	clog10 = 34,
	cexp = 35,
	citan = 36,
	cftan = 37,
	cicos = 38,
	cfcos = 39,
	cisin = 40,
	cfsin = 41
};

enum oprs {
	oret = 0,
	onot,
	omod,
	oineg,
	ofneg,
	ocneg,
	oiplus,
	ofplus,
	ocplus,
	oiminus,
	ofminus,
	ocminus,
	oitimes,
	oftimes,
	octimes,
	oidiv,
	ofdiv,
	ocdiv,
	oeql,
	oneq,
	olss,
	ogeq,
	ogtr,
	oleq,
	oitout,
	oftout,
	octout,
	obtout,
	ohitout,
	ohftout,
	ohctout,
	ohbtout,
	ologand,
	ologor,
};

#endif /* HEADER_TASKLETEXECUTIONENVIRONMENT_H_ */
