var notificationId = 0;
var lastReportedTime = new Date();

const url = "http://jiofi.local.html/mark_title.w.xml";

const BATTERY_LEVEL_CRITICAL = 0;
const BATTERY_LEVEL_LOW = 1;
const BATTERY_LEVEL_NORMAL = 2;
const BATTERY_LEVEL_FULL = 3;

function handleBatteryLevel(batteryPercentage = undefined){
	var alertMessage = undefined;
	if(!batteryPercentage){
		alertMessage = "Error occured while parsing batteryPercentage!";
		var message = {
			title: "JioFi battery alert",
			message: alertMessage,
			iconUrl: "images/icon128.png",
			type: "basic"
		};
		notifyUser(message);
	}

	chrome.browserAction.setTitle({
	    title:'Battery: ' + batteryPercentage + "%"
	});
	chrome.browserAction.setBadgeText({text: batteryPercentage + ""});

	var batteryLevel = BATTERY_LEVEL_NORMAL;
	if(batteryPercentage >= 0 && batteryPercentage <= 10){
		alertMessage = "Battery level is critical! Please charge it! - " + batteryPercentage + "%";
		batteryLevel = BATTERY_LEVEL_CRITICAL;
	} else if(batteryPercentage > 20 && batteryPercentage < 30){
		alertMessage = "Battery level is low! - " + batteryPercentage + "%";
		batteryLevel = BATTERY_LEVEL_LOW;
	} else if(batteryPercentage >= 95 && batteryPercentage <= 100){
		alertMessage = "Battery almost full! Please unplug it! - " + batteryPercentage + "%";
		batteryLevel = BATTERY_LEVEL_FULL;
	}

	if(batteryLevel === BATTERY_LEVEL_NORMAL){
		return;
	}

	var message = {
		title: "JioFi battery alert",
		message: alertMessage,
		iconUrl: "images/icon128.png",
		type: "basic"
	};
	var timeNow = new Date();
	var timeDiff = timeNow.getTime() - lastReportedTime.getTime();
	switch(batteryLevel){
		case BATTERY_LEVEL_CRITICAL:
			var minReportInterval = 3 * 60 * 1000;
			if(timeDiff >= minReportInterval){
				notifyUser(message);
			}
			break;
		case BATTERY_LEVEL_LOW:
			var minReportInterval = 5 * 60 * 1000;
			if(timeDiff >= minReportInterval){
				notifyUser(message);
			}
			break;
		case BATTERY_LEVEL_FULL:
			var minReportInterval = 5 * 60 * 1000;
			if(timeDiff >= minReportInterval){
				notifyUser(message);
			}
			break;
		default:
			break;
	}
}

function notifyUser(message){
	chrome.notifications.create(notificationId++ + "", message);
	lastReportedTime = new Date();
}

function parseBatteryPercentage(response){
	if(!response){
		return undefined;
	}
	var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(response, "text/xml");
    var batteryPercentage = parseInt(xmlDoc.getElementsByTagName("batt_per")[0].childNodes[0].nodeValue);
    return batteryPercentage;
}

function getBatteryLevel(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
	  if (xmlHttp.readyState == 4) {
	    var resp = xmlHttp.responseText;
	    var batteryPercentage = parseBatteryPercentage(resp);
	    if(!batteryPercentage){
	    	chrome.browserAction.setTitle({
			    title:'Battery: ' + "?"
			});
			chrome.browserAction.setBadgeText({text: "?"});
	    	return;
	    }
	    handleBatteryLevel(batteryPercentage);
	  }
	}
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.send();
}

setInterval(function(){
	getBatteryLevel(url);
}, 60 * 1000);
getBatteryLevel(url);
