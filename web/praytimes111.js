function PrayTime() {
    var
    // ------------------------ Constants --------------------------

    // Calculation Methods
    KARACHI = 0, // University of Islamic Sciences, Karachi
    ISNA = 1, // Islamic Society of North America (ISNA)
    MWL = 2, // Muslim World League (MWL)
    MAKKAH = 3, // Umm al-Qura, Makkah
    EGYPT = 4, // Egyptian General Authority of Survey
    CUSTOM = 5, // Custom Setting
    QATAR = 6, // Qatar Calendar House

    // Juristic Methods
    SHAFII = 0, // Shafii (standard)
    HANAFI = 1, // Hanafi

    // Adjusting Methods for Higher Latitudes
    NONE = 0, // No adjustment
    MIDNIGHT = 1, // middle of night
    ONE_SEVENTH = 2, // 1/7th of night
    ANGLE_BASED = 3, // angle/60th of night

    // Time Formats
    TIME_24 = 0, // 24-hour format
    TIME_12 = 1, // 12-hour format
    TIME_12_NS = 2, // 12-hour format with no suffix
    FLOATING = 3, // floating point number

    // Time Names
    TIMES_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Sunset", "Maghrib", "Isha"],
    INVALID_TIME = "-----", // The string used for invalid times

    // --------------------- Technical Settings --------------------

    NUM_ITERATIONS = 1, // number of iterations needed to compute times

    // ------------------- Calc Method Parameters --------------------

    /*
     * fa : fajr angle
     * ms : maghrib selector (0 = angle; 1 = minutes after sunset)
     * mv : maghrib parameter value (in angle or minutes)
     * is : isha selector (0 = angle; 1 = minutes after maghrib)
     * iv : isha parameter value (in angle or minutes)
     */
    _methodParams = [
            [18, 1, 0, 0, 18],                       // Karachi
            [15, 1, 0, 0, 15],                       // ISNA
            [18, 1, 0, 0, 17],                       // MWL
            [18.5, 1, 0, 1, 90],                     // Makkah
            [19.5, 1, 0, 0, 17.5],                   // Egypt
            [18, 1, 0, 0, 17],                       // Custom
            [18, 1, 0, 1, 90]                        // Qatar
    ];

    this.getMethodParams = function(int i, int j) {
        return _methodParams[i, j];
    };

    this.setMethodParams = function(int i, int j, double v) {
        _methodParams[i, j] = v;
    };

    // ---------------------- Global Variables --------------------
    var
    calcMethod = 0, // caculation method
    asrJuristic = 0, // Juristic method for Asr
    dhuhrMinutes = 0, // minutes after mid-day for Dhuhr
    adjustHighLats = 1, // adjusting method for higher latitudes

    timeFormat = 0, // time format

    lat, // latitude
    lng, // longitude
    timeZone, // time-zone
    jDate, // Julian date

    offsets = new Array(7);

    // ---------------------- Trigonometric Functions -----------------------

    // range reduce angle in degrees.
    this.fixangle = function(a) {
        a = a - (360 * (Math.floor(a / 360.0)));
        a = a < 0 ? (a + 360) : a;
        return a;
    }

    // range reduce hours to 0..23
    this.fixhour = function(a) {
        a = a - 24.0 * Math.floor(a / 24.0);
        a = a < 0 ? (a + 24) : a;
        return a;
    }

    // radian to degree
    this.radiansToDegrees = function(alpha) {
        return ((alpha * 180.0) / Math.PI);
    }

    // deree to radian
    this.DegreesToRadians = function(alpha) {
        return ((alpha * Math.PI) / 180.0);
    }

    // degree sin
    this.dsin = function(d) {
        return (Math.sin(DegreesToRadians(d)));
    }

    // degree cos
    this.dcos = function(d) {
        return (Math.cos(DegreesToRadians(d)));
    }

    // degree tan
    this.dtan = function(d) {
        return (Math.tan(DegreesToRadians(d)));
    }

    // degree arcsin
    this.darcsin = function(x) {
        return radiansToDegrees(Math.asin(x));
    }

    // degree arccos
    this.darccos = function(x) {
        return radiansToDegrees(Math.acos(x));
    }

    // degree arctan
    this.darctan = function(x) {
        return radiansToDegrees(Math.atan(x));
    }

    // degree arctan2
    this.darctan2 = function(y, x) {
        return radiansToDegrees(Math.atan2(y, x));
    }

    // degree arccot
    this.darccot = function(x) {
        return radiansToDegrees(Math.atan2(1.0, x));
    }

    // ---------------------- Time-Zone Functions -----------------------
/*
    // compute base time-zone of the system
    public static double getBaseTimeZone() {
        return (TimeZone.getDefault().getRawOffset() / 1000.0) / 3600;

    }

    // detect daylight saving in a given date
    public static double detectDaylightSaving() {
        return (double) TimeZone.getDefault().getDSTSavings();
    }
*/
    // ---------------------- Julian Date Functions -----------------------

    // calculate julian date from a calendar date
    this.julianDate = function(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        var A = Math.floor(year / 100.0);
        var B = 2 - A + Math.floor(A / 4.0);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    }

    // ---------------------- Calculation Functions -----------------------

    // References:
    // http://www.ummah.net/astronomy/saltime
    // http://aa.usno.navy.mil/faq/docs/SunApprox.html
    // compute declination angle of sun and equation of time
    this.sunPosition = function(jd) {
        var D = jd - 2451545;
        var g = fixangle(357.529 + 0.98560028 * D);
        var q = fixangle(280.459 + 0.98564736 * D);
        var L = fixangle(q + (1.915 * dsin(g)) + (0.020 * dsin(2 * g)));

        var e = 23.439 - (0.00000036 * D);
        var d = darcsin(dsin(e) * dsin(L));
        var RA = (darctan2((dcos(e) * dsin(L)), (dcos(L)))) / 15.0;
        RA = fixhour(RA);
        var EqT = q / 15.0 - RA;
        var sPosition = [d, EqT];

        return sPosition;
    }

    // compute equation of time
    this.equationOfTime = function(jd) {
        return sunPosition(jd)[1];
    }

    // compute declination angle of sun
    this.sunDeclination = function(jd) {
        return sunPosition(jd)[0];
    }

    // compute mid-day (Dhuhr, Zawal) time
    this.computeMidDay = function(t) {
        var T = equationOfTime(jDate + t);
        return fixhour(12 - T);
    }

    // compute time for a given angle G
    this.computeTime = function(G, t) {
        var D = sunDeclination(jDate + t);
        var Z = computeMidDay(t);
        var Beg = -dsin(G) - dsin(D) * dsin(lat);
        var Mid = dcos(D) * dcos(lat);
        var V = darccos(Beg / Mid) / 15.0;
        return Z + (G > 90 ? -V : V);
    }

    // compute the time of Asr
    // Shafii: step=1, Hanafi: step=2
    this.computeAsr = function(step, t) {
        var D = sunDeclination(jDate + t);
        var G = -darccot(step + dtan(Math.fabs(lat - D)));
        return computeTime(G, t);
    }

    // ---------------------- Misc Functions -----------------------

    // compute the difference between two times
    this.timeDiff = function(time1, time2) {
        return fixhour(time2 - time1);
    }

    // -------------------- Interface Functions --------------------

    // return prayer times for a given date
    this.getDatePrayerTimes = function(year, month, day, latitude, longitude, tZone) {
        lat = latitude;
        lng = longitude;
        timeZone = tZone;
        jDate = julianDate(year, month, day);
        var lonDiff = longitude / (15.0 * 24.0);
        jDate = jDate - lonDiff;
        return computeDayTimes();
    }

    // return prayer times for a given date
    this.getPrayerTimes = function(date, latitude, longitude, tZone) {
        var year = date.getYear();
        var month = date.getMonth ();
        var day = date.getDay();
        return getDatePrayerTimes(year, month, day, latitude, longitude, tZone);
    }

    // set custom values for calculation parameters
    this.setCustomParams = function(params) {
        for (var i = 0; i < 5; i++) {
            if (params[i] == -1)
                setMethodParams(CUSTOM, i, getMethodParams(calcMethod, i));
            else
                setMethodParams(CUSTOM, i, params[i]);
        }
        calcMethod = CUSTOM;
    }

    // set the angle for calculating Fajr
    this.setFajrAngle = function(angle) {
        var params = {angle, -1, -1, -1, -1};
        setCustomParams(params);
    }

    // set the angle for calculating Maghrib
    this.setMaghribAngle = function(angle) {
        var params = {-1, 0, angle, -1, -1};
        setCustomParams(params);
    }

    // set the angle for calculating Isha
    this.setIshaAngle = function(angle) {
        var params = {-1, -1, -1, 0, angle};
        setCustomParams(params);
    }

    // set the minutes after Sunset for calculating Maghrib
    this.setMaghribMinutes = function(minutes) {
        var params = {-1, 1, minutes, -1, -1};
        setCustomParams(params);
    }

    // set the minutes after Maghrib for calculating Isha
    this.setIshaMinutes = function(minutes) {
        var params = {-1, -1, -1, 1, minutes};
        setCustomParams(params);
    }

    // convert double hours to 24h format
    this.floatToTime24 = function(time) {
        var result;

        if (isNaN(time)) {
            return INVALID_TIME;
        }

        time = fixhour(time + 0.5 / 60.0); // add 0.5 minutes to round
        var hours = Math.floor(time);
        var minutes = Math.floor((time - hours) * 60.0);

        if ((hours >= 0 && hours <= 9) && (minutes >= 0 && minutes <= 9)) {
            result = "0" + hours + ":0" + Math.round(minutes);
        } else if ((hours >= 0 && hours <= 9)) {
            result = "0" + hours + ":" + Math.round(minutes);
        } else if ((minutes >= 0 && minutes <= 9)) {
            result = hours + ":0" + Math.round(minutes);
        } else {
            result = hours + ":" + Math.round(minutes);
        }
        return result;
    }

    // convert double hours to 12h format
    this.floatToTime12 = function(time, noSuffix) {

        if (isNaN(time)) {
            return INVALID_TIME;
        }

        time = fixhour(time + 0.5 / 60); // add 0.5 minutes to round
        var hours = Math.floor(time);
        var minutes = Math.floor((time - hours) * 60);
        var suffix, result;
        if (hours >= 12) {
            suffix = "pm";
        } else {
            suffix = "am";
        }
        hours = ((((hours + 12) - 1) % (12)) + 1);
        if (!noSuffix) {
            if ((hours >= 0 && hours <= 9) && (minutes >= 0 && minutes <= 9)) {
                result = "0" + hours + ":0" + Math.round(minutes) + " " + suffix;
            } else if ((hours >= 0 && hours <= 9)) {
                result = "0" + hours + ":" + Math.round(minutes) + " " + suffix;
            } else if ((minutes >= 0 && minutes <= 9)) {
                result = hours + ":0" + Math.round(minutes) + " " + suffix;
            } else {
                result = hours + ":" + Math.round(minutes) + " " + suffix;
            }

        } else {
            if ((hours >= 0 && hours <= 9) && (minutes >= 0 && minutes <= 9)) {
                result = "0" + hours + ":0" + Math.round(minutes);
            } else if ((hours >= 0 && hours <= 9)) {
                result = "0" + hours + ":" + Math.round(minutes);
            } else if ((minutes >= 0 && minutes <= 9)) {
                result = hours + ":0" + Math.round(minutes);
            } else {
                result = hours + ":" + Math.round(minutes);
            }
        }
        return result;

    }

    // convert double hours to 12h format with no suffix
    this.floatToTime12NS = function(time) {
        return floatToTime12(time, true);
    }

    // ---------------------- Compute Prayer Times -----------------------

    // compute prayer times at given julian date
    this.computeTimes = function(times) {

        var t = dayPortion(times);

        var Fajr = this.computeTime(180 - getMethodParams(calcMethod, 0), t[0]);
        var Sunrise = this.computeTime(180 - 0.833, t[1]);
        var Dhuhr = this.computeMidDay(t[2]);
        var Asr = this.computeAsr(1 + asrJuristic, t[3]);
        var Sunset = this.computeTime(0.833, t[4]);
        var Maghrib = this.computeTime(getMethodParams(calcMethod, 2), t[5]);
        var Isha = this.computeTime(getMethodParams(calcMethod, 4), t[6]);

        return new Array(Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha);
    }

    // compute prayer times at given julian date
    this.computeDayTimes = function() {
        var times = [5, 6, 12, 13, 18, 18, 18]; // default times

        for (var i = 1; i <= NUM_ITERATIONS; i++) {
            times = computeTimes(times);
        }

        times = adjustTimes(times);
        times = tuneTimes(times);

        return adjustTimesFormat(times);
    }

    // adjust times in a prayer time array
    this.adjustTimes = function(times) {
        for (var i = 0; i < times.length; i++) {
            times[i] += timeZone - lng / 15;
        }

        times[2] += dhuhrMinutes / 60; // Dhuhr
        if (getMethodParams(calcMethod, 1) == 1) // Maghrib
            times[5] = times[4] + getMethodParams(calcMethod, 2) / 60;
        if (getMethodParams(calcMethod, 3) == 1) // Isha
            times[6] = times[5] + getMethodParams(calcMethod, 4) / 60;

        if (adjustHighLats != NONE)
            times = adjustHighLatTimes(times);

        return times;
    }

    // convert times array to given time format
    this.adjustTimesFormat = function(times) {
        var result = new Array(7);

        if (timeFormat == FLOATING) {
            for (var i = 0; i < 7; i++)
                result[i] = times[i];
            return result;
        }

        for (var i = 0; i < 7; i++) {
            if (timeFormat == TIME_12) {
                result[i] = floatToTime12(times[i], false);
            } else if (timeFormat == TIME_12_NS) {
                result[i] = floatToTime12(times[i], true);
            } else {
                result[i] = floatToTime24(times[i]);
            }
        }
        return result;
    }

    // adjust Fajr, Isha and Maghrib for locations in higher latitudes
    this.adjustHighLatTimes = function(times) {
        var nightTime = timeDiff(times[4], times[1]); // sunset to sunrise

        // Adjust Fajr
        var FajrDiff = nightPortion(getMethodParams(calcMethod, 0)) * nightTime;

        if (isNaN(times[0]) || timeDiff(times[0], times[1]) > FajrDiff) {
            times[0] = times[1] - FajrDiff;
        }

        // Adjust Isha
        var IshaAngle = (getMethodParams(calcMethod, 3) == 0) ? getMethodParams(calcMethod, 4) : 18;
        var IshaDiff = this.nightPortion(IshaAngle) * nightTime;
        if (isNaN(times[6]) || this.timeDiff(times[4], times[6]) > IshaDiff) {
            times[6] = times[4] + IshaDiff;
        }

        // Adjust Maghrib
        var MaghribAngle = (getMethodParams(calcMethod, 1) == 0) ? getMethodParams(calcMethod, 2) : 4;
        var MaghribDiff = nightPortion(MaghribAngle) * nightTime;
        if (isNaN(times[5]) || this.timeDiff(times[4], times[5]) > MaghribDiff) {
            times[5] = times[4] + MaghribDiff;
        }

        return times;
    }

    // the night portion used for adjusting times in higher latitudes
    this.nightPortion = function(angle) {
        switch (adjustHighLats) {
            case ANGLE_BASED:
                return angle / 60.0;
            case MIDNIGHT:
                return 0.5;
            case ONE_SEVENTH:
                return 0.14286;
            default:
                return 0;
        }
    }

    // convert hours to day portions
    this.dayPortion = function(times) {
        for (var i = 0; i < 7; i++)
            times[i] /= 24;
        return times;
    }

    // Tune timings for adjustments
    // Set time offsets
    this.tune = function(offsetTimes) {
        for (var i = 0; i < offsetTimes.length; i++)
            this.offsets[i] = offsetTimes[i];
    }

    this.tuneTimes = function(times) {
        for (var i = 0; i < times.length; i++) {
            times[i] = times[i] + this.offsets[i] / 60.0;
        }
        return times;
    }

    this.isNaN = function(d) {
    	return d < 0;
    }

    /*public static void main(string[] args) {
        double latitude = 25.2899589;
        double longitude = 51.4974742;
        double timezone = 3;

        PrayTime prayers = new PrayTime();

        prayers.timeFormat = TIME_12;
        prayers.calcMethod = QATAR;
        prayers.asrJuristic = SHAFII;
        prayers.adjustHighLats = ANGLE_BASED;
        int[] offsets = {0, 0, 0, 0, 0, 0, 0}; // {Fajr,Sunrise,Dhuhr,Asr,Sunset,Maghrib,Isha}
        prayers.tune(offsets);

        var cal = new DateTime.now_local ();

        string[] prayerTimes = prayers.getPrayerTimes(cal, latitude, longitude, timezone);

        for (int i = 0; i < prayerTimes.length; i++) {
            print (TIMES_NAMES[i] + "\t\t" + prayerTimes[i] + "\n");
        }

    }*/

}

