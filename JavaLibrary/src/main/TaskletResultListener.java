package main;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Iterator;

import enums.LogPoint;

public class TaskletResultListener extends Thread {
	private volatile boolean isRunning = true;
	ServerSocket acceptSocket;
	Logger logger = null;
	TaskletResults taskletResults;
	public static int currentSerial = -1;
	public static int currenttrial = 0;
	int receivedResults;
	int numberOfRuns;
	volatile boolean started;
	int cutoffSerial = 0;
	public static int cutoffTrial = 0;

	public TaskletResultListener(ServerSocket ssocket, Logger logger) {
		this.acceptSocket = ssocket;
		this.logger = logger;
		taskletResults = new TaskletResults();
		isRunning = true;
		started = false;
		numberOfRuns = 1;
	}

	public void setNumberOfRuns(int num) {
		numberOfRuns = num;
	}

	@Override
	public synchronized void run() {
		try {

			Socket connectedSocket = acceptSocket.accept();
			BufferedInputStream in = new BufferedInputStream(
					connectedSocket.getInputStream());

			started = true;

			// System.out.println("Thread started.");
			while (isRunning) {
				// System.out.println("Thread running...");

				ResultList results = (ResultList) receiveIResultMessage(in);

				if (results == null || results.serial <= cutoffSerial) {
					continue;
				}

				receivedResults++;

				if (taskletResults.get(results.handler) == null) {

					taskletResults.addResults(results);
					if (receivedResults >= numberOfRuns) {
						notifyAll();
						wait();
						// System.out.println("I notified him.");
						logger.writeLogMessage(-1, "0.0.0.0.",
								Tasklet.localPort, Tasklet.appIdentifier,
								Tasklet.sessionID, Tasklet.trialID, 0, 0, 0, 0,
								"0.0.0.0", 0, 0, 0, 0, 0);

						receivedResults = 0;
					}

				} else {
					receivedResults--;
				}

			}

		} catch (SocketException e) {
			e.printStackTrace();
			System.out.println("SocketException.");
		} catch (IOException e) {
			System.out.println("IOException.");
			e.printStackTrace();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	public TaskletResults getResultsInstant() {
		cutoffSerial = Tasklet.taskletCounter;
		TaskletResults currentResults = taskletResults;
		taskletResults = new TaskletResults();
		for (ResultList current : currentResults.tResults) {
			System.out.println("Current: " + current.serial);
		}
		return currentResults;
	}

	public synchronized TaskletResults waitForAllResults() {
		// System.out.println("started?");
		if (!started) {
			try {
				System.out.println("ResultListener waits for activation.");
				wait();
				notifyAll();
				
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

		// System.out.println("waitForAllResults() returned.");
		notifyAll();
		TaskletResults currentResults = taskletResults;
		taskletResults = new TaskletResults();
		cutoffTrial++;
		return currentResults;
	}

	// public void stopListener() {
	//
	// try {
	// acceptSocket.close();
	// } catch (IOException e) {
	// e.printStackTrace();
	// }
	// isRunning = false;
	// this.interrupt();
	//
	// }

	public ResultList receiveIResultMessage(BufferedInputStream in)
			throws IOException {

		int magic = Util.receiveInt(in);
		int version = Util.receiveInt(in);
		int messageType = Util.receiveInt(in);

		// TODO: fix message type can easily cause errors
		if (magic != 12345 || version != 1 || messageType != 7) { // iResultMessage
																	// = 7 (?)
			System.err.println("Wrong protocl/version/messageType");
			return null;
		}

		int ip = Util.receiveInt(in);
		int port = Util.receiveInt(in);
		int serial = Util.receiveInt(in);
		// System.out.println("Serial: " + serial);
		currentSerial = serial;
		int proxy = Util.receiveInt(in);
		int resultHandle = Util.receiveInt(in);
		int subserial = Util.receiveInt(in);
		int replicationID = Util.receiveInt(in);
		int sessionID = Util.receiveInt(in);
		int trialID = Util.receiveInt(in);
		int executingHost = Util.receiveInt(in);
		int resultLength = Util.receiveInt(in);

		int intermediateComp = Util.receiveInt(in);
		int finalComp = Util.receiveInt(in);
		int retryCounter = Util.receiveInt(in);
		int heartBeatCounter = Util.receiveInt(in);
		int hotRetryCounter = Util.receiveInt(in);

		int chunkSize = 1000000;
		byte[] results_arr = new byte[resultLength];
		byte[] temp_input = new byte[chunkSize];
		int bytesReceived = 0;
		int bytesToRead = 0;
		int remainingBytes = resultLength;
		while (remainingBytes > 0) {
			bytesToRead = Math.min(remainingBytes, temp_input.length);
			bytesReceived = in.read(temp_input, 0, bytesToRead);
			System.arraycopy(temp_input, 0, results_arr, resultLength
					- remainingBytes, bytesReceived);
			remainingBytes -= bytesReceived;

		}

		if (trialID < cutoffTrial) {
			return null;
		}

		logger.writeLogMessage(15, intToIp(ip), port, proxy, sessionID,
				trialID, resultLength, serial, replicationID, subserial,
				intToIp(executingHost), intermediateComp, finalComp,
				retryCounter, heartBeatCounter, hotRetryCounter);

		ResultList results = new ResultList();

		ArrayList<Element> elements = ResultList
				.byteArrayToArrayList(results_arr);
		results.elements = elements;
		results.handler = resultHandle;
		results.serial = serial;

		return results;
	}

	public static String intToIp(int i) {

		return (i & 0xFF) + "." + ((i >> 16) & 0xFF) + "." + ((i >> 8) & 0xFF)
				+ "." + ((i >> 24) & 0xFF);

	}
}
