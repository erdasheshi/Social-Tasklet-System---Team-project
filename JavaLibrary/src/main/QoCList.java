package main;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import enums.QocCategory;

public class QoCList {

	ArrayList<QoC> qocs;
	int replication;
	int redundancy;

	public QoCList() {
		qocs = new ArrayList<QoC>();
	}

	public byte[] qocsToArray() {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		for (QoC qoc : qocs) {
			QocCategory key = qoc.category;
			byte[] type;
			byte[] plength;
			byte[] data = null;
			switch (key) {
			case LOCAL:
				type = Util.byteToArray((byte) 1);
				break;
			case REMOTE:
				type = Util.byteToArray((byte) 2);
				break;
			case SPEED:
				type = Util.byteToArray((byte) 3);
				break;
			case RELIABLE:
				type = Util.byteToArray((byte) 4);
				break;
			case PROXY:
				type = Util.byteToArray((byte) 5);
				break;
			case REDUNDANCY:
				type = Util.byteToArray((byte) 6);
				break;
			case REPLICATION:
				type = Util.byteToArray((byte) 7);
				break;
			case MIGRATION:
				type = Util.byteToArray((byte) 8);
				break;
			case COST:
				type = Util.byteToArray((byte) 9);
				break;
			case PRIVACY:
				type = Util.byteToArray((byte) 10);
				break;
			default:
				type = Util.byteToArray((byte) 0);
				break;
			}

			if (qoc.parameters != null) {
				data = qoc.parameters.elementsToArray();
				plength = Util.intToArray(data.length);
			} else {
				plength = new byte[1];
				plength[0] = 0;
			}

			try {
				outputStream.write(type);
				outputStream.write(plength);
				if (data != null) {
					outputStream.write(data);
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		byte output[] = outputStream.toByteArray();

		return output;
	}

	protected void setLocal() {
		qocs.add(new QoC(QocCategory.LOCAL, null));
	}

	protected void setRemote() {
		qocs.add(new QoC(QocCategory.REMOTE, null));
	}

	protected void setSpeed(Speed speed) {
		ParameterList plist = new ParameterList();
		if (speed == Speed.MEDIUM) {
			plist.addFloat((float) 6.5);
		} else if (speed == Speed.FAST) {
			plist.addFloat((float) 6.0);
		} else if (speed == Speed.FASTEST) {
			plist.addFloat((float) 5.5);
		}
		qocs.add(new QoC(QocCategory.SPEED, plist));
	}

	protected void setSpeed(float speed) {
		ParameterList plist = new ParameterList();
		plist.addFloat(speed);
		qocs.add(new QoC(QocCategory.SPEED, plist));
	}

	protected void setReliable() {
		qocs.add(new QoC(QocCategory.RELIABLE, null));
	}

	protected void setProxy(int[] guid) {
		ParameterList plist = new ParameterList();
		plist.addIntArray(guid);
		qocs.add(new QoC(QocCategory.PROXY, plist));
	}

	protected void setRedundancy(int number) {
		ParameterList plist = new ParameterList();
		plist.addInt(number);
		qocs.add(new QoC(QocCategory.REDUNDANCY, plist));
		redundancy = number;
	}

	protected void setReplication(int number) {
		ParameterList plist = new ParameterList();
		plist.addInt(number);
		qocs.add(new QoC(QocCategory.REPLICATION, plist));
		replication = number;
	}
	
	protected void setMigration(int hotMigrationEnabled,
			int coldMigrationInterval) {
		ParameterList plist = new ParameterList();
		plist.addInt(hotMigrationEnabled);
		plist.addInt(coldMigrationInterval);
		qocs.add(new QoC(QocCategory.MIGRATION, plist));
	}
	
	protected void setCost(int level) {
		ParameterList plist = new ParameterList();
		plist.addInt(level);
		qocs.add(new QoC(QocCategory.COST, plist));
	}
	
	protected void setPrivacy(int level) {
		ParameterList plist = new ParameterList();
		plist.addInt(level);
		qocs.add(new QoC(QocCategory.PRIVACY, plist));
	}

}
