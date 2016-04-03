'use strict';

function cs142FormatTime(date) {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var hour = date.getHours();
	var ampm = "AM";
	if (hour > 12) {
		hour = hour - 12;
		ampm = "PM";
	}
	if (hour < 10) {
		hour = "0" + hour;
	} 
	if (hour === "00") {
		hour = "12";
	}
	var minutes = date.getMinutes();
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + hour + ":" + minutes + " " + ampm;
}