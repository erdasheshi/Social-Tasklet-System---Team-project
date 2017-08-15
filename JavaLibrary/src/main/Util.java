package main;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.ServerSocket;
import java.nio.ByteBuffer;
import java.util.Scanner;
import java.util.UUID;

import enums.DataType;

public class Util {

	public static void main(String[] args) {

		boolean[] test = new boolean[] { true, true, true, false, true, false,
				false };
		byte[] testb = booleanArrayToArray(test);
		for (int i = 0; i < testb.length; i++) {
			System.out.print(testb[i] + " ");
		}
		System.out.println();
		boolean[] testi = byteArrayToBooleanArray(testb);

		for (int i = 0; i < testi.length; i++) {
			System.out.print(testi[i] + " ");
		}
		// int[] test = new int[]{1,2,3,4,5, 100, 2000, 3000};
		// byte[] testb = intArrayToArray(test);
		// for (int i = 0; i < testb.length; i++) {
		// System.out.print(testb[i] + " ");
		// }
		// System.out.println();
		// int[] testi = byteArrayToIntArray(testb);
		//
		// for (int i = 0; i < testi.length; i++) {
		// System.out.print(testi[i] + " ");
		// }

	}

	public static String readFile(String file) {
		String content = null;
		try {
			content = new Scanner(new File(file)).useDelimiter("\\Z").next();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		return content;
	}

	public static ServerSocket startupServerSocket(ServerSocket ssocket) {
		try {
			ssocket = new ServerSocket(0);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return ssocket;
	}

	/*
	 * ByteArray to X
	 */
	public static short byteArrayToShort(byte[] b) {
		short value = 0;
		for (int i = 0; i < 2; i++) {
			int shift = (2 - 1 - i) * 8;
			value += (b[1 - i] & 0x000000FF) << shift;
		}
		return value;
	}

	public static int[] byteArrayToIntArray(byte[] b) {

		int[] result = new int[b.length / 4];
		int offset = 0;

		for (int index = 0; index < result.length; index++) {

			int value = 0;

			for (int i = 0 + offset; i < offset + 4; i++) {
				int shift = (3 - i % 4) * 8;
				value += (b[3 + offset - i % 4] & 0x000000FF) << shift;
			}
			offset += 4;
			result[index] = value;
		}

		return result;
	}

	public static int byteArrayToInt(byte[] b) {
		int value = 0;
		for (int i = 0; i < 4; i++) {
			int shift = (4 - 1 - i) * 8;
			value += (b[3 - i] & 0x000000FF) << shift;
		}
		return value;
	}

	public static float[] byteArrayToFloatArray(byte[] b) {

		float[] result = new float[b.length / 4];
		int offset = 0;

		for (int index = 0; index < result.length; index++) {
			float value = ByteBuffer.wrap(Util.reverseByteArray(b), offset, 4)
					.getFloat();
			result[result.length - 1 - index] = value;
			offset += 4;
		}

		return result;
	}

	public static char[] byteArrayToCharArray(byte[] b) {

		char[] result = new char[b.length / 2];
		int offset = 0;

		for (int index = 0; index < result.length; index++) {
			char value = ByteBuffer.wrap(Util.reverseByteArray(b), offset, 2)
					.getChar();
			result[result.length - 1 - index] = value;
			offset += 2;
		}

		return result;
	}

	public static boolean[] byteArrayToBooleanArray(byte[] b) {

		boolean[] result = new boolean[b.length];

		for (int index = 0; index < result.length; index++) {
			if (b[index] == 1) {
				result[index] = true;
			} else {
				result[index] = false;
			}
		}
		return result;
	}

	public static float byteArrayToFloat(byte[] b) {
		float value = ByteBuffer.wrap(Util.reverseByteArray(b)).getFloat();
		return value;
	}

	public static char byteArrayToChar(byte[] b) {
		char value = ByteBuffer.wrap(Util.reverseByteArray(b)).getChar();
		return value;
	}

	public static boolean byteArrayToBoolean(byte[] b) {
		byte value = ByteBuffer.wrap(Util.reverseByteArray(b)).get();

		if (value == 1) {
			return true;
		} else
			return false;

	}

	public static byte[] booleanToArray(boolean i) {
		byte b;

		if (i) {
			b = 1;
		} else {
			b = 0;
		}

		return Util.reverseByteArray(ByteBuffer.allocate(1).put((byte) b)
				.array());
	}

	public static byte[] byteToArray(byte i) {
		return Util.reverseByteArray(ByteBuffer.allocate(1).put((byte) i)
				.array());
	}

	public static byte[] charToArray(char i) {
		return Util.reverseByteArray(ByteBuffer.allocate(2).putChar((char) i)
				.array());
	}

	public static byte[] shortToArray(short i) {
		return Util.reverseByteArray(ByteBuffer.allocate(2).putShort((short) i)
				.array());
	}

	public static byte[] intToArray(int i) {
		return Util.reverseByteArray(ByteBuffer.allocate(4).putInt((int) i)
				.array());
	}

	public static byte[] floatToArray(float i) {
		return Util.reverseByteArray(ByteBuffer.allocate(4).putFloat((float) i)
				.array());
	}

	public static byte[] intArrayToArray(int[] sourcearray) {

		int length = sourcearray.length;

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[4];
		buffer = intToArray(length);
		try {
			outputStream.write(buffer);
			for (int i = 0; i < sourcearray.length; i++) {
				buffer = intToArray(sourcearray[i]);
				outputStream.write(buffer);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return outputStream.toByteArray();

	}

	public static byte[] floatArrayToArray(float[] sourcearray) {

		int length = sourcearray.length;

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[4];
		buffer = intToArray(length);
		try {
			outputStream.write(buffer);
			for (int i = 0; i < sourcearray.length; i++) {
				buffer = floatToArray(sourcearray[i]);
				outputStream.write(buffer);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return outputStream.toByteArray();
	}

	public static byte[] charArrayToArray(char[] sourcearray) {

		int length = sourcearray.length;

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[4];
		byte[] charbuffer = new byte[2];
		buffer = intToArray(length);
		try {
			outputStream.write(buffer);
			for (int i = 0; i < sourcearray.length; i++) {
				charbuffer = charToArray(sourcearray[i]);
				outputStream.write(charbuffer);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return outputStream.toByteArray();
	}

	public static byte[] booleanArrayToArray(boolean[] sourcearray) {

		int length = sourcearray.length;

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[4];
		byte[] booleanbuffer = new byte[1];
		buffer = intToArray(length);
		try {
			outputStream.write(buffer);
			for (int i = 0; i < sourcearray.length; i++) {
				booleanbuffer = booleanToArray(sourcearray[i]);
				outputStream.write(booleanbuffer);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return outputStream.toByteArray();
	}

	/*
	 * Receive Methods
	 */
	public static byte receiveByte(InputStream in) throws IOException {

		byte[] temp_arr = new byte[1];
		in.read(temp_arr);
		byte temp = temp_arr[0];

		return temp;
	}

	public static short receiveShort(InputStream in) throws IOException {

		byte[] temp_arr = new byte[2];
		in.read(temp_arr);
		short temp = byteArrayToShort(temp_arr);

		return temp;
	}

	public static int receiveInt(InputStream in) throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		int temp = byteArrayToInt(temp_arr);

		return temp;
	}

	public static int[] receiveIntArray(InputStream in) throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		int length = byteArrayToInt(temp_arr) * 4;

		temp_arr = new byte[length];

		in.read(temp_arr);

		int[] result = byteArrayToIntArray(temp_arr);

		return result;
	}

	public static float[] receiveFloatArray(InputStream in) throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		int length = byteArrayToInt(temp_arr) * 4;

		temp_arr = new byte[length];

		in.read(temp_arr);

		float[] result = byteArrayToFloatArray(temp_arr);

		return result;
	}

	public static char[] receiveCharArray(InputStream in) throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		int length = byteArrayToInt(temp_arr) * 4;

		temp_arr = new byte[length];

		in.read(temp_arr);

		char[] result = byteArrayToCharArray(temp_arr);

		return result;
	}

	public static boolean[] receiveBooleanArray(InputStream in)
			throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		int length = byteArrayToInt(temp_arr) * 4;

		temp_arr = new byte[length];

		in.read(temp_arr);

		boolean[] result = byteArrayToBooleanArray(temp_arr);

		return result;
	}

	public static float receiveFloat(InputStream in) throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		float temp = byteArrayToFloat(temp_arr);

		return temp;
	}

	public static char receiveChar(InputStream in) throws IOException {

		byte[] temp_arr = new byte[2];
		in.read(temp_arr);
		char temp = byteArrayToChar(temp_arr);

		return temp;
	}

	public static boolean receiveBoolean(InputStream in) throws IOException {

		byte[] temp_arr = new byte[1];
		in.read(temp_arr);
		boolean temp = byteArrayToBoolean(temp_arr);

		return temp;
	}

	public static byte[] reverseByteArray(byte[] original) {
		byte[] reverse = new byte[original.length];

		for (int i = 0; i < original.length; i++) {
			reverse[i] = original[original.length - 1 - i];
		}

		return reverse;
	}

	public static DataType receiveDataType(InputStream in) throws IOException {
		byte[] temp_arr = new byte[1];
		in.read(temp_arr);

		switch (temp_arr[0]) {
		case 1:
			return DataType.INTEGER;
		case 2:
			return DataType.FLOAT;
		case 3:
			return DataType.CHAR;
		case 4:
			return DataType.BOOLEAN;
		case 5:
			return DataType.INTEGER_ARRAY;
		case 6:
			return DataType.FLOAT_ARRAY;
		case 7:
			return DataType.CHAR_ARRAY;
		case 8:
			return DataType.BOOLEAN_ARRAY;

		default:
			return null;
		}

	}

	public static int[] createGUID() {

		UUID id = UUID.randomUUID();

		int[] myguid = new int[4];

		Long a = id.getMostSignificantBits();
		Long b = id.getLeastSignificantBits();

		myguid[0] = (int) (a & 0xFFFFFFFF);
		myguid[1] = (int) (a >> 32 & 0xFFFFFFFF);
		myguid[2] = (int) (b & 0xFFFFFFFF);
		myguid[3] = (int) (b >> 32 & 0xFFFFFFFF);

		return myguid;
	}

}
