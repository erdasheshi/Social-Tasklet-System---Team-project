package main;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.InetAddress;
import java.net.UnknownHostException;

import enums.LogPoint;

public class Logger {

	Writer writer;
	String loggerFile;
	String ip = "0.0.0.0";
	long systemStart;

	public Logger(int sessionID, int trialID) {
		loggerFile = "Evaluation" + File.separator + "appLog_4WINS_"
				+ sessionID + "_" + trialID + "_" + System.currentTimeMillis()
				+ ".csv";
		try {
			systemStart = System.currentTimeMillis();
			writer = new BufferedWriter(new OutputStreamWriter(
					new FileOutputStream(loggerFile, true), "utf-8"));
			writer.write("SessionID;TrialID;Move;Pushs;NumberOfTL;SizeOfTL;Received;Guess;Perfekt\n");
			writer.flush();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public Logger(int port, int sessionID, int trialID) {
		loggerFile = "Evaluation" + File.separator + "appLog_" + port + "_"
				+ sessionID + "_" + trialID + "_" + System.currentTimeMillis()
				+ ".csv";
		try {
			systemStart = System.currentTimeMillis();
			writer = new BufferedWriter(new OutputStreamWriter(
					new FileOutputStream(loggerFile, true), "utf-8"));
			writer.write("Role;MeasurePoint;LocalIP(String);IP(Zero);Port;AppIdentifier;Session;Trial;ResultSize;Serial;ReplicationID;Subserial;ExecutingHost;IntermediateComp;FinalComp;RetryCounter;HeartBeatCounter;HotRetryCounter;"
					+ "CurrentTime;SystemStart;Duration\n");
			writer.flush();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void writeMoveMessage(int sessionID, int trialID, int move,
			int pushs, int numberOfTL, int sizeOfTL, int received, int guess,
			String perfect) {
		try {
			String output = "";
			output += sessionID + ";";
			output += trialID + ";";
			output += move + ";";
			output += pushs + ";";
			output += numberOfTL + ";";
			output += sizeOfTL + ";";
			output += received + ";";
			output += guess + ";";
			output += perfect;
			writer.write(output + "\n");
			writer.flush();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	synchronized public void writeLogMessage(int measurePoint, String ip,
			int port, int appIdentifier, int session, int trial,
			int resultSize, int serial, int replicationID, int subserial,
			String executingHost, int intermediateComp, int finalComp,
			int retryCounter, int heartBeatCounter, int hotRetryCounter) {

		try {
			String output = "";
			output += "0;";
			output += measurePoint + ";";
			output += ip + ";";
			output += "0;";
			output += port + ";";
			output += appIdentifier + ";";
			output += session + ";";
			output += trial + ";";
			output += resultSize + ";";
			output += serial + ";";
			output += replicationID + ";";
			output += subserial + ";";
			output += executingHost + ";";
			output += intermediateComp + ";";
			output += finalComp + ";";
			output += retryCounter + ";";
			output += heartBeatCounter + ";";
			output += hotRetryCounter + ";";
			long time = System.currentTimeMillis();
			output += time + ";";
			output += systemStart + ";";
			output += time - systemStart + ";";
			writer.write(output + "\n");
			writer.flush();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

	// synchronized public void writeLogMessage(LogPoint type, int serial,
	// int subserial, int ip, String ipString, int port,
	// int appIdentifier, int sessionID, int trialID, int resultSize,
	// int executingHostIP, String executingHostString, int info1,
	// int info2) {
	//
	// try {
	// String output = "";
	// output += type + ";";
	// output += serial + ";";
	// output += subserial + ";";
	// output += ip + ";";
	// output += ipString + ";";
	// output += port + ";";
	// output += appIdentifier + ";";
	// output += sessionID + ";";
	// output += trialID + ";";
	// output += resultSize + ";";
	// output += executingHostIP + ";";
	// output += executingHostString + ";";
	// output += info1 + ";";
	// output += info2 + ";";
	// output += System.currentTimeMillis() + ";";
	// output += systemStart;
	// writer.write(output + "\n");
	// writer.flush();
	// } catch (IOException e) {
	// e.printStackTrace();
	// }
	// }

}
