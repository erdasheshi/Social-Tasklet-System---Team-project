package main;
import enums.DataType;

public class ResultList extends ElementList {

	int handler;
	public int serial;

	protected void add(Result result) {
		elements.add(result);
	}

	public int getInteger(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.INTEGER) {
			return (int) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public float getFloat(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.FLOAT) {
			return (float) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public char getChar(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.CHAR) {
			return (char) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public boolean getBoolean(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.BOOLEAN) {
			return (boolean) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public int[] getIntegerArray(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.INTEGER_ARRAY) {
			return (int[]) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public float[] getFloatArray(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.FLOAT_ARRAY) {
			return (float[]) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public char[] getCharArray(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.CHAR_ARRAY) {
			return (char[]) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public boolean[] getBooleanArray(int index) throws WrongDataTypeException {
		if (elements.get(index).type == DataType.BOOLEAN_ARRAY) {
			return (boolean[]) elements.get(index).value;
		}
		throw new WrongDataTypeException();
	}

	public Object getObject(int index) throws Exception {
		return elements.get(index).value;
	}
}
