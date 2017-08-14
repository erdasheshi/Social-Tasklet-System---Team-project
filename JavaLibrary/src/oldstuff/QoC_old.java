package oldstuff;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import enums.DataType;


public class QoC_old extends TypeValueSet{

	ArrayList<TypeValueElement> qocs;
	
	public QoC_old() {
		qocs = new ArrayList<TypeValueElement>();
	}
	
	public void putLocal(int value){
		Integer number = new Integer(value);
//		qocs.add(new TypeValueElement(DataType.LOCAL, number));
	}
	
	
	public static byte[] resolve(QoC_old qoc) {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		if(qoc == null){
			return new byte[0];
		}
		
		for (TypeValueElement element : qoc.qocs) {
			DataType key = element.type;
			byte[] type;
			byte[] data;
			switch (key) {
//			case LOCAL:
//				type = Util.shortToArray((short) 1);
//				data = Util.intToArray((int) element.value);
//				break;
			default:
				type = Util.shortToArray((short) 0 );
				data = Util.intToArray((int) 0);
				break;
			}

			try {
				outputStream.write(type);
				outputStream.write(data);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		byte output[] = outputStream.toByteArray();

		return output;
	}
	
}
