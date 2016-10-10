var todayData = {
	today: "", // YYYYMMDD - 20161007
	/*
		items: {
			1476086375013: { // timestamp of the initial add
				text: "This is my taks",
				status: false
			}
		}
	*/
	items: {},
	localStoragePrefix: "today",
	idFormat: "YYYYMMDD",
	get: function() {
		if(this.today == "" ) {
			this.today = moment().format(this.idFormat);
		}
		todayDataTemp = JSON.parse(
						localStorage.getItem(
							this.localStoragePrefix + this.today
						),
						this.fixBooleanAsString
					);
		// in case it's empty
		todayDataTemp = todayDataTemp ? todayDataTemp : {};

		// I used to store the whole todayData into JSON, this is to handle the legacy structure
		todayData.items = todayDataTemp.items ? todayDataTemp.items : todayDataTemp;
	},
	fixBooleanAsString(k,v) {
		if(v=="true") return true;
		if(v=="false") return false;
		return v;
	},
	save: function() {
		localStorage.setItem(
			this.localStoragePrefix + this.today,
			JSON.stringify(this.items)
		);
	},
	shiftDate: function( position ) {
		if(position>0) {
			todayData.today = moment( todayData.today ).add(position, "days").format(todayData.idFormat);
		} else if(position<0) {
			todayData.today = moment( todayData.today ).subtract(Math.abs(position), "days").format(todayData.idFormat);
		} else {
			todayData.today = moment().format(todayData.idFormat);
		}
	}
}