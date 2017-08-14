package main;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import enums.DataType;

public class ElementList {

	ArrayList<Element> elements;

	public ElementList() {
		elements = new ArrayList<Element>();
	}

	public int size() {
		return elements.size();
	}

	protected byte[] elementsToArray() {

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		for (Element element : elements) {
			DataType key = element.type;
			byte[] dataType;
			byte[] data;
			switch (key) {
			case INTEGER:
				dataType = Util.byteToArray(((byte) 1));
				data = Util.intToArray((int) element.value);
				break;
			case FLOAT:
				dataType = Util.byteToArray(((byte) 2));
				data = Util.floatToArray((float) element.value);
				break;
			case CHAR:
				dataType = Util.byteToArray(((byte) 3));
				data = Util.charToArray((char) element.value);
				break;
			case BOOLEAN:
				dataType = Util.byteToArray(((byte) 4));
				data = Util.charToArray((char) element.value);
				break;
			//case BOOLEAN:
				//dataType = Util.byteToArray(((byte) 4));
				//data = Util.charToArray((char) ((boolean) element.value ? 1 : 0));
				//break;
			case INTEGER_ARRAY:
				dataType = Util.byteToArray(((byte) 5));
				data = Util.intArrayToArray((int[]) element.value);
				break;
			case FLOAT_ARRAY:
				dataType = Util.byteToArray(((byte) 6));
				data = Util.floatArrayToArray((float[]) element.value);
				break;
			case CHAR_ARRAY:
				dataType = Util.byteToArray(((byte) 7));
				data = Util.charArrayToArray((char[]) element.value);
				break;
			case BOOLEAN_ARRAY:
				dataType = Util.byteToArray(((byte) 8));
				data = Util.booleanArrayToArray((boolean[]) element.value);
				break;
			default:
				dataType = Util.byteToArray((byte) -1);
				data = Util.byteToArray((byte) -1);
				break;
			}

			try {
				outputStream.write(dataType);
				outputStream.write(data);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		byte output[] = outputStream.toByteArray();

		return output;
	}

	protected static ArrayList<Element> byteArrayToArrayList(byte[] input) {

		ElementList elements = new ElementList();

		ByteArrayInputStream in = new ByteArrayInputStream(input);
		DataType dataType;

		try {
			for (int bytes = 0; bytes < input.length;) {
				dataType = Util.receiveDataType(in);
				bytes++;
				switch (dataType) {
				case INTEGER:
					int int_value = Util.receiveInt(in);
					elements.addInt(int_value);
					bytes += 4;
					break;
				case FLOAT:
					float float_value = Util.receiveFloat(in);
					elements.addFloat(float_value);
					bytes += 4;
					break;
				case CHAR:
					char char_value = Util.receiveChar(in);
					elements.addChar(char_value);
					bytes += 2;
					break;
				case BOOLEAN:
					boolean boolean_value = Util.receiveBoolean(in);
					elements.addBoolean(boolean_value);
					bytes += 1;
					break;
				case INTEGER_ARRAY:
					int[] intArray_value = Util.receiveIntArray(in);
					elements.addIntArray(intArray_value);
					bytes += intArray_value.length * 4 + 4;
					break;
				case FLOAT_ARRAY:
					float[] floatArray_value = Util.receiveFloatArray(in);
					elements.addFloatArray(floatArray_value);
					bytes += floatArray_value.length * 4 + 4;
					break;
				case CHAR_ARRAY:
					char[] charArray_value = Util.receiveCharArray(in);
					elements.addCharArray(charArray_value);
					bytes += charArray_value.length * 2 + 4;
					break;
				case BOOLEAN_ARRAY:
					boolean[] booleanArray_value = Util.receiveBooleanArray(in);
					elements.addBooleanArray(booleanArray_value);
					bytes += booleanArray_value.length + 4;
					break;
				default:
					break;
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return elements.elements;

	}

	protected void addInt(int value) {
		Integer element = new Integer(value);
		elements.add(new Element(DataType.INTEGER, element));
	}

	protected void addIntArray(int[] value) {
		elements.add(new Element(DataType.INTEGER_ARRAY, value));
	}

	protected void addFloat(float value) {
		Float element = new Float(value);
		elements.add(new Element(DataType.FLOAT, element));
	}

	protected void addFloatArray(float[] value) {
		elements.add(new Element(DataType.FLOAT_ARRAY, value));
	}

	protected void addChar(char value) {
		Byte element = new Byte((byte) value);
		elements.add(new Element(DataType.CHAR, element));
	}

	protected void addCharArray(char[] value) {
		elements.add(new Element(DataType.CHAR_ARRAY, value));
	}

	protected void addBoolean(boolean value) {
		Boolean element = new Boolean(value);
		elements.add(new Element(DataType.BOOLEAN, element));
	}

	protected void addBooleanArray(boolean[] value) {
		elements.add(new Element(DataType.BOOLEAN_ARRAY, value));
	}

}
