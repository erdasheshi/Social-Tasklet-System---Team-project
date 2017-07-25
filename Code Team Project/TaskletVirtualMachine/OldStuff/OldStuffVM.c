///*
// * OldStuffVM.c
// *
// *  Created on: 20.08.2014
// *      Author: Dominik
// */
//
//#define NUM_REGS 4
//int instrNum = 0;
//int reg0 = 0;
//int reg1 = 0;
//int reg2 = 0;
//int imm = 0;
//
//bool running = true;
//bool vmAlive = true;
//int pc = 0;
//
//int regs[NUM_REGS];
//void run() {
//	while (vmAlive) {
//		if (receiveprogram()) {
//			resetVM();
//			while (running) {
////				int instr = fetch();
////				decode(instr);
////				eval();
////				showRegs();
//				interpret();
//			}
//			returnresult();
//			free(prog);
//		}
//	}
//}
//
///*
// * 0 = halt
// * 1 = loadi register value
// * 2 = add register1 register2
// * 3 = substract register1 register2
// * 4 = multiply register1 register2
// */
//void eval() {
//	switch (instrNum) {
//	case 0:
//		printf("halt\n");
//		running = false;
//		break;
//	case 1:
//		printf("loadi r%d #%d\n", reg0, imm);
//		regs[reg0] = imm;
//		break;
//	case 2:
//		printf("add r%d r%d r%d\n", reg0, reg1, reg2);
//		regs[reg0] = regs[reg1] + regs[reg2];
//		result = &regs[reg0];
//		break;
//	case 3:
//		printf("subtract r%d r%d r%d\n", reg0, reg1, reg2);
//		regs[reg0] = regs[reg1] - regs[reg2];
//		result = &regs[reg0];
//		break;
//	case 4:
//		printf("multiply r%d r%d r%d\n", reg0, reg1, reg2);
//		regs[reg0] = regs[reg1] * regs[reg2];
//		result = &regs[reg0];
//		break;
//	}
//}
//
//int fetch() {
//	return prog[pc++];
//}
//
//int fetchInput() {
//	int i = 0;
//	scanf("%i", &i);
//	return i;
//}
//
//void decode(int instr) {
//	instrNum = (instr & 0xF000) >> 12;
//	reg0 = (instr & 0xF00) >> 8;
//	reg1 = (instr & 0xF0) >> 4;
//	reg2 = (instr & 0xF);
//	imm = (instr & 0xFF);
//}
//
//void resetVM() {
//	int i;
//	result = NULL;
//	running = true;
//	instrNum = 0;
//	pc = 0;
//	imm = 0;
//	for (i = 0; i < NUM_REGS; i++)
//		regs[i] = 0;
//}
//
//void showRegs() {
//	int i;
//	printf("regs = ");
//	for (i = 0; i < NUM_REGS; i++)
//		printf("%04X ", regs[i]);
//	printf("\n");
//	fflush(stdout);
//}
