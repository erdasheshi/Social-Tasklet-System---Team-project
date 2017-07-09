################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../src/source/Orchestration.c \
../src/source/TaskletFactory.c \
../src/source/TaskletVirtualMachineMonitor.c 

OBJS += \
./src/source/Orchestration.o \
./src/source/TaskletFactory.o \
./src/source/TaskletVirtualMachineMonitor.o 

C_DEPS += \
./src/source/Orchestration.d \
./src/source/TaskletFactory.d \
./src/source/TaskletVirtualMachineMonitor.d 


# Each subdirectory must supply rules for building sources it contributes
src/source/%.o: ../src/source/%.c
	@echo 'Building file: $<'
	@echo 'Invoking: Cygwin C Compiler'
	gcc -I"C:\Users\Janick\Dropbox\Promotion\Programming\TaskletMiddleware2017\TaskletEnvironmentLibrary\src\header" -O0 -g3 -Wall -c -fmessage-length=0 -MMD -MP -MF"$(@:%.o=%.d)" -MT"$(@:%.o=%.d)" -o "$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


