package oldstuff;

import enums.DataType;

public class TypeValueElement {

	DataType type;
	Object value;

	public TypeValueElement(DataType type, Object value) {
		this.type = type;
		this.value = value;
	}

	public String toString() {
		return "" + value;
	}

}
