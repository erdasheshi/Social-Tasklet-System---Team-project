package main;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.net.Socket;
import java.util.ArrayList;

import enums.LogPoint;

public class ResultWorkerThread implements Runnable {
	private Socket resultSocket;
//	ResultListener resultListener;

	public ResultWorkerThread(Socket s) {
		resultSocket = s;
	}

	@Override
	public void run() {

		ResultList results = null;
		try {
			results = (ResultList) receiveIResultMessage(resultSocket);
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		if (results == null) {
			return;
		}

//		if (ResultListener.resultAlreadyReceived(results.handler)) {
//		} else {
//			ResultListener.incrementNumberOfResults();
//			resultListener.addResult(results);
//		}
		try {
			resultSocket.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public ResultList receiveIResultMessage(Socket connectedSocket)
			throws IOException {

		BufferedInputStream in = new BufferedInputStream(
				connectedSocket.getInputStream());
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
		//System.out.println("Serial: " + serial);
		// currentSerial = serial;
		int proxy = Util.receiveInt(in);
		int resultHandle = Util.receiveInt(in);
		int subserial = Util.receiveInt(in);
		int sessionID = Util.receiveInt(in);
		int trialID = Util.receiveInt(in);
		int executingHost = Util.receiveInt(in);
		int resultLength = Util.receiveInt(in);

		// if (trialID >= currenttrial) {
		// currenttrial = trialID;
		// } else {
		// return null;
		// }

		// logger.writeLogMessage(LogPoint.RESULT_IN, serial, subserial, ip,
		// intToIp(ip), port, proxy, sessionID, trialID, resultLength,
		// executingHost, intToIp(executingHost), -1, -1);

		int chunkSize = 1000000;
		byte[] results_arr = new byte[resultLength];
		byte[] temp_input = new byte[chunkSize];
		int bytesReceived = 0;
		int remainingBytes = resultLength;

		while (remainingBytes > 0) {
			bytesReceived = in.read(temp_input);
			System.arraycopy(temp_input, 0, results_arr, resultLength
					- remainingBytes, bytesReceived);
			remainingBytes -= bytesReceived;

		}

		ResultList results = new ResultList();

		ArrayList<Element> elements = ResultList
				.byteArrayToArrayList(results_arr);
		results.elements = elements;
		results.handler = resultHandle;

		return results;
	}

}
