package main;
import enums.DataType;


public class Element {

	DataType type;
	Object value;
	
	public Element(DataType type, Object value){
		this.type = type;
		this.value = value;
	}
	
	public String toString() {
		String output = "\n{";
		
		if(type == DataType.INTEGER_ARRAY){
			int[] value_array = (int[]) value;
			for (int i = 0; i < value_array.length; i++) {
				output += " " + value_array[i];
			}
		} else if(type == DataType.FLOAT_ARRAY){
			float[] value_array = (float[]) value;
			for (int i = 0; i < value_array.length; i++) {
				output += " " + value_array[i];
			}
		} else if(type == DataType.CHAR_ARRAY){
			char[] value_array = (char[]) value;
			for (int i = 0; i < value_array.length; i++) {
				output += " " + value_array[i];
			}
		} else if(type == DataType.BOOLEAN_ARRAY){
			boolean[] value_array = (boolean[]) value;
			for (int i = 0; i < value_array.length; i++) {
				output += " " + value_array[i];
			}
		} else {
			return "" + value;
		}
		
		return output + "}\n";
		
	}
	
	
}


//INTEGER_ARRAY, //5
//FLOAT_ARRAY, //6
//CHAR_ARRAY, //7
//BOOLEAN_ARRAY //8