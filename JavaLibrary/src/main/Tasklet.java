package main;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.Charset;
import java.util.Random;
import java.util.Scanner;

import enums.LogPoint;
import enums.ResultMode;

public class Tasklet {

	public static int taskletCounter = 1;
	static int localPort = -1;
	static ServerSocket ssocket = null;
	static TaskletResultListener resultListener = null;
	static int[] myGuid = null;
	static String lastTasklet = null;
	static long lastModified = 0;
	static boolean reexecution = false;
	public static int sessionID = 347;
	public static int trialID = 985;
	static int appIdentifier = Math.abs((new Random()).nextInt());
	static long systemStart;
	public static int info1 = -1;
	public static int info2 = -1;

	static Socket jsocket;
	static OutputStream socketOutputStream;

	String sourceCode;
	String sourcePath;
	boolean useProxy = false;
	private QoCList qocs;
	private int numberOfCopies = 1;
	private ParameterList parameters;
	static Logger logger;

	static int iteration = 0;
	static private int numberOfRuns;

	public static void setNumberOfRuns(int numberOfRuns) {
		Tasklet.numberOfRuns = numberOfRuns;
		if (resultListener != null) {
			resultListener.numberOfRuns = numberOfRuns;
		}
	}

	public static void main(String[] args) throws Exception {
		if (args.length > 1) {
			sessionID = Integer.parseInt(args[0]);
			trialID = Integer.parseInt(args[1]);
		}
		int taskletID = 1337;

		// Tasklet.numberOfRuns = 1;
		initSendingSocket();

		Tasklet tasklet = new Tasklet("primes.cmm");
		tasklet.addInt(0);
		tasklet.addInt(25000);
		//tasklet.setQoCReliable();
		tasklet.setQoCost(3);
		tasklet.setQocPrivacy(5);
		System.out.println("Running!");
		tasklet.start(taskletID);

		TaskletResults results = Tasklet
				.getTaskletResults(ResultMode.EVERYTHING);

		System.out.println(results.get(taskletID).elements);

	}

	public static void initSendingSocket() {
		try {
			jsocket = new Socket("127.0.0.1", 12345);
			jsocket.setKeepAlive(true);
			socketOutputStream = jsocket.getOutputStream();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	public Tasklet(String path) {

		qocs = new QoCList();
		useProxy = false;
		parameters = new ParameterList();

		this.sourcePath = path;

		File file = new File(path);

		if (lastTasklet == path && lastModified == file.lastModified()) {
			sourceCode = null;
		} else {
			sourceCode = Util.readFile(path);
		}
		lastTasklet = path;
		lastModified = file.lastModified();
	}

	public static TaskletResults getTaskletResults(ResultMode mode) {
		TaskletResults tResults = null;

		if (mode == ResultMode.INSTANT) {
			tResults = resultListener.getResultsInstant();
			return tResults;
		}

		if (mode == ResultMode.EVERYTHING) {
			// try {
			// t.wait();
			// } catch (InterruptedException e) {
			// e.printStackTrace();
			// }
			// try {
			// resultListener.wait();
			// System.out.println("I was notified!");
			// tResults = resultListener.taskletResults;
			// resultListener.notifyAll();
			// resultListener = null;
			// return tResults;
			// } catch (InterruptedException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
			// }
			// System.out.println("before wait...");
			tResults = resultListener.waitForAllResults();
			// System.out.println("Tada!\n");
			// resultListener = null;
			// resultListener = new TaskletResultListener(ssocket, logger);
			// resultListener.setNumberOfRuns(numberOfRuns);
			// resultListener.start();
			return tResults;
		}
		return null;

	}

	private void initializeResultListener() {
		ssocket = Util.startupServerSocket(ssocket);
		localPort = ssocket.getLocalPort();
		if (logger == null) {
			logger = new Logger(localPort, sessionID, trialID);

		}
		System.out.println(localPort);
		logger.writeLogMessage(-2, "0.0.0.0", 0, appIdentifier, sessionID,
				trialID, 0, 0, 0, 0, "0.0.0.0", 0, 0, 0, 0, 0);

		resultListener = new TaskletResultListener(ssocket, logger);
		resultListener.setNumberOfRuns(numberOfRuns);
		resultListener.start();
	}

	public void start(int resultHandle) {

		if (!isRunningMW()) {
			// startMW();
		}

		if (resultListener == null) {
			systemStart = System.currentTimeMillis();
			initializeResultListener();
		}
		byte[] tasklet = buildTasklet(sourcePath, resultHandle);

		sendTasklet(tasklet);
	}

	private void sendTasklet(byte[] tasklet) {

		try {
			if (jsocket == null || jsocket.isClosed()) {
				if (useProxy) {
					jsocket = new Socket("134.155.48.170", 11223); // TODO:
					// change
					// back
					// jsocket = new Socket("134.155.48.170", 11223); // TODO:
					// change back
					// after testing
				} else {
					jsocket = new Socket("127.0.0.1", 12345); // TODO: change
					// back
					// after testing
				}
			}

			if (socketOutputStream == null) {
				socketOutputStream = jsocket.getOutputStream();
			}

			// logger.writeLogMessage(LogPoint.TASKLET_START, taskletCounter -
			// 1,
			// 0, 0, "0.0.0.0", localPort, appIdentifier, sessionID,
			// trialID, 0, 0, "0.0.0.0", info1, info2);

			socketOutputStream.write(tasklet);
			// jsocket.close();
		} catch (IOException e) {
			e.printStackTrace();
			System.out.print("Error in opening socket/sending tasklet.\n");
		}
	}

	private byte[] buildTasklet(String codeFile, int resultHandle) {
		byte[] tasklet;

		int messageType;

		if (sourceCode == null) {
			sourceCode = "";
			messageType = 8;
		} else {
			messageType = 6;
		}

		tasklet = assembleTasklet(sourceCode, messageType, resultHandle);

		return tasklet;
	}

	private byte[] assembleTasklet(String sourceCode, int mType,
			int resultHandle) {

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		byte[] magic = Util.intToArray(12345);
		byte[] protocolVersion = Util.intToArray(1);
		byte[] messageType = Util.intToArray(mType); // iRequestMessage TODO:
														// might
														// easily cause errors!

		// System.out.println("Tasklet " + taskletCounter + " created.");
		int copies = Math.max(qocs.redundancy, qocs.replication);
		copies = Math.max(copies, 1);
		for (int replica = 0; replica < copies; replica++) {
			logger.writeLogMessage(0, "0.0.0.0", localPort, appIdentifier,
					sessionID, trialID, 0, taskletCounter, replica, 0,
					"0.0.0.0", 0, 0, 0, 0, 0);
		}

		byte[] port = Util.intToArray(localPort);
		byte[] serial = Util.intToArray(taskletCounter++);
		byte[] proxy = Util.intToArray(appIdentifier);
		byte[] resHandle = Util.intToArray(resultHandle);
		byte[] session = Util.intToArray(sessionID);
		byte[] trial = Util.intToArray(trialID);

		byte[] codeData = sourceCode.getBytes(Charset.forName("UTF-8"));
		byte[] qocs = this.qocs.qocsToArray();
		byte[] params = parameters.elementsToArray();

		byte[] codeLength = Util.intToArray(codeData.length);
		byte[] qocLength = Util.intToArray(qocs.length);
		byte[] parameterLength = Util.intToArray(params.length);

		try {
			// Protocol Header
			outputStream.write(magic);
			outputStream.write(protocolVersion);
			outputStream.write(messageType);

			// iRequestMessage Header
			outputStream.write(port);
			outputStream.write(serial);
			outputStream.write(proxy);
			outputStream.write(resHandle);
			outputStream.write(session);
			outputStream.write(trial);
			outputStream.write(codeLength);
			outputStream.write(qocLength);
			outputStream.write(parameterLength);

			// Payload
			outputStream.write(codeData);
			outputStream.write(qocs);
			outputStream.write(params);
		} catch (IOException e) {
			e.printStackTrace();
		}

		byte tasklet[] = outputStream.toByteArray();
		//
		// for (int i = 0; i < tasklet.length; i++) {
		// System.out.println(tasklet[i]);
		// }

		return tasklet;
	}

	private boolean isRunningMW() {
		return true;
	}

	public void addInt(int value) {
		parameters.addInt(value);
	}

	public void addFloat(float value) {
		parameters.addFloat(value);
	}

	public void addChar(char value) {
		parameters.addChar(value);
	}

	public void addBoolean(boolean value) {
		parameters.addBoolean(value);
	}

	public void addIntArray(int[] value) {
		parameters.addIntArray(value);
	}

	public void addFloatArray(float[] value) {
		parameters.addFloatArray(value);
	}

	public void addCharArray(char[] value) {
		parameters.addCharArray(value);
	}

	public void addBooleanArray(boolean[] value) {
		parameters.addBooleanArray(value);
	}

	public void setQoCLocal() {
		qocs.setLocal();
	}

	public void setQoCRemote() {
		qocs.setRemote();
	}

	public void setQoCSpeed(Speed speed) {
		qocs.setSpeed(speed);
	}

	public void setQoCSpeed(float speed) {
		qocs.setSpeed(speed);
	}

	public void setQoCReliable() {
		qocs.setReliable();
	}

	public void setQoCProxy() {
		useProxy = true;
		if (myGuid == null) {
			myGuid = Util.createGUID();
		}
		qocs.setProxy(myGuid);
	}

	public void setQoCRedundancy(int number) {
		numberOfCopies = number;
		qocs.setRedundancy(number);
	}

	public void setQoCReplication(int number) {
		numberOfCopies = number;
		qocs.setReplication(number);
	}

	public void setQoCMigration(int hotMigrationEnabled,
			int coldMigrationInterval) {
		qocs.setMigration(hotMigrationEnabled, coldMigrationInterval);
	}
	
	public void setQoCost(int level) {
		qocs.setCost(level);
	}
	
	public void setQocPrivacy(int level) {
		qocs.setPrivacy(level);
	}

}