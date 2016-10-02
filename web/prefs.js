function Prefs () {
	this.isAr;
	this.isLight;
	this.is24HourFormat;

	this.latitude;
	this.longitude;
	this.timezone;
	this.calc_method;
	this.asr_juristic;
	this.high_lats_method;

	this.iqamaFajr;
	this.iqamaDuhr;
	this.iqamaAsr;
	this.iqamaMagrib;
	this.iqamaIsha;

	this.init = function () {
		/*read_file ();*/

		this.isAr = false;
		this.isLight = false;
		this.is24HourFormat = false;

		this.latitude = 25.285447;
		this.longitude = 51.531040;
		this.timezone = 3;
		this.calc_method = "qatar";
		this.asr_juristic = "shafii";
		this.high_lats_method = "anglebased";

		this.iqamaFajr = 25;
		this.iqamaDuhr = 20;
		this.iqamaAsr = 25;
		this.iqamaMagrib = 10;
		this.iqamaIsha = 20;
	}
	/*
	private static void read_file () {

		var file = File.new_for_path ("prefs");

		if (!file.query_exists ()) {
	write_file (file);
	return;
		}

		try {
	var dis = new DataInputStream (file.read ());
	string line;
	for (int i = 0; ((line = dis.read_line (null)) != null); i++) {
		string val = line.split ("//") [0];
		switch (i) {
	case 0: isAr = bool.parse (val); break;
	case 1: isLight = bool.parse (val); break;
	case 2: is24HourFormat = bool.parse (val); 	break;

	case 3: latitude = double.parse (val); break;
	case 4: longitude = double.parse (val); 	break;
	case 5: timezone = double.parse (val); break;
	case 6: calc_method = val; 	break;
	case 7: asr_juristic = val; 	break;
	case 8: high_lats_method = val; break;

	case 9: iqamaFajr = int.parse (val); break;
	case 10: iqamaDuhr = int.parse (val); break;
	case 11: iqamaAsr = int.parse (val); break;
	case 12: iqamaMagrib = int.parse (val); 	break;
	case 13: iqamaIsha = int.parse (val); break;
		}
	}
		} catch (Error e) {
	error ("%s", e.message);
		}

	}

	private static void write_file (File file) {

		isAr = true;
		isLight = false;
		is24HourFormat = false;

		latitude = 25.285447;
		longitude = 51.531040;
		timezone = 3;
		calc_method = "qatar";
		asr_juristic = "shafii";
		high_lats_method = "anglebased";

		iqamaFajr = 25;
		iqamaDuhr = 20;
		iqamaAsr = 25;
		iqamaMagrib = 10;
		iqamaIsha = 20;

		try {
	var dos = new DataOutputStream (file.create (FileCreateFlags.REPLACE_DESTINATION));

	string text = @"$isAr//isAr(true-false)\n$isLight//isLight(true-false)\n$is24HourFormat//is24HourFormat(true-false)\n$latitude//latitude\n$longitude//longitude\n$timezone//timezone\n$calc_method//calc_method(karachi-isna-mwl-makkah-egypt-qatar)\n$asr_juristic//asr_juristic(shafii-hanafi)\n$high_lats_method//high_lats_method(none-midnight-oneseventh-anglebased)\n$iqamaFajr//iqamaFajr\n$iqamaDuhr//iqamaDuhr\n$iqamaAsr//iqamaAsr\n$iqamaMagrib//iqamaMagrib\n$iqamaIsha//iqamaIsha";
	uint8[] data = text.data;
	long written = 0;
	while (written < data.length) {
	    written += dos.write (data[written:data.length]);
	}
		} catch (Error e) {
	stderr.printf ("%s\n", e.message);
		}
	}

	*/
}

var P = new Prefs();
