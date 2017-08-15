package oldstuff;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import enums.DataType;

public class TypeValueSet {

	ArrayList<TypeValueElement> elements;

	protected TypeValueSet() {
		elements = new ArrayList<TypeValueElement>();
	}

	
	/*
	 * Insert new items 
	 */
	
	protected void addInt(int value) {
		Integer element = new Integer(value);
		elements.add(new TypeValueElement(DataType.INTEGER, element));
	}


	protected void addFloat(float value) {
		Float element = new Float(value);
		elements.add(new TypeValueElement(DataType.FLOAT, element));

	}
	
	protected void print() {
		System.out.print("My Results: ");
		for (int i = 0; i < elements.size(); i++) {
			System.out.print(elements.get(i) + "   ");
		}
		System.out.println();
	}

	protected byte[] convertSetToArray() {

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		for (TypeValueElement element : elements) {
			DataType key = element.type;
			byte[] dataType;
			byte[] struct;
			byte[] data;
			switch (key) {
			case INTEGER:
				dataType = Util.byteToArray(((byte) 1));
				struct = Util.byteToArray(((byte) 0));
				data = Util.intToArray((int) element.value);
				break;
			case FLOAT:
				dataType = Util.byteToArray(((byte) 2));
				struct = Util.byteToArray(((byte) 0));
				data = Util.floatToArray((float) element.value); 
				break;
			case CHAR:
				dataType = Util.byteToArray(((byte) 3));
				struct = Util.byteToArray(((byte) 0));
				data = Util.charToArray((char) element.value); 
				break;
			case BOOLEAN:
				dataType = Util.byteToArray(((byte) 4));
				struct = Util.byteToArray(((byte) 0));
				data = Util.charToArray((char) element.value); 
				break;
			default:
				dataType = Util.byteToArray((byte) -1 );
				struct = Util.byteToArray(((byte) -1));
				data = Util.byteToArray((byte) -1); 
				break;
			}

			try {
				outputStream.write(dataType);
				outputStream.write(struct);
				outputStream.write(data);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		byte output[] = outputStream.toByteArray();

		return output;
	}
	
	protected TypeValueSet convertArrayToSet(byte[] items_arr) throws IOException{
		
		ByteArrayInputStream in = new ByteArrayInputStream(items_arr);
		
		for(int bytes = 0; bytes < items_arr.length;){
			short dataType = Util.receiveShort(in);
			bytes += 2;
			if(dataType == 1){
				int value = Util.receiveInt(in);
				addInt(value);
				bytes += 4;
			} else if(dataType == 2){
				float value = Util.receiveFloat(in);
				addFloat(value);
				bytes += 4;
			}
		}
		
		
		
		return this;
		
	}

}
