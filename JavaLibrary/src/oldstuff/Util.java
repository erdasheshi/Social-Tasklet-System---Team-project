package oldstuff;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.ServerSocket;
import java.nio.ByteBuffer;
import java.util.Scanner;

public class Util {

	public static void main(String[] args) {

		// short test = 1;
		// byte[] testarray = Util.shortToArray(test);
		//
		// for (int i = 0; i < testarray.length; i++) {
		// System.out.println(testarray[i]);
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

	public static int byteArrayToInt(byte[] b) {
		int value = 0;
		for (int i = 0; i < 4; i++) {
			int shift = (4 - 1 - i) * 8;
			value += (b[3 - i] & 0x000000FF) << shift;
		}
		return value;
	}

	public static float byteArrayToFloat(byte[] b) {
		float value = ByteBuffer.wrap(Util.reverseByteArray(b)).getFloat();
		return value;
	}

	public static byte[] booleanToArray(boolean i) {
		byte b;
		
		if(i){
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

	public static float receiveFloat(InputStream in) throws IOException {

		byte[] temp_arr = new byte[4];
		in.read(temp_arr);
		float temp = byteArrayToFloat(temp_arr);

		return temp;
	}

	public static byte[] intToParameter(int i) {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[4];
		buffer = intToArray(1);
		try {
			outputStream.write(buffer);
			buffer = intToArray(0);
			outputStream.write(buffer);
			buffer = intToArray(i);
			outputStream.write(buffer);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return outputStream.toByteArray();

	}

	public static byte[] reverseByteArray(byte[] original) {
		byte[] reverse = new byte[original.length];

		for (int i = 0; i < original.length; i++) {
			reverse[i] = original[original.length - 1 - i];
		}

		return reverse;

	}

}
