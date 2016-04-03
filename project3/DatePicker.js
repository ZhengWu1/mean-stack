'use strict';

function DatePicker(id, dateSelection){
	this.id = id;
	this.dateSelection = dateSelection;
}

DatePicker.prototype.render = function(date) {
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var month = date.getMonth();
	var year = date.getFullYear();
	var dateCursor = new Date(date.getFullYear(), month, 1, 1, 0, 0, 0); //hour set to 1 to hanlde the edge case of daylight saving
	
	var htmlContents = "<div><span id='prev'><</span>";
	htmlContents += "<span class='wrap'><span>" + date.getFullYear() + "</span><span>" +  months[month] + "</span></span>" + "<span id='next'>></span></div>";
	htmlContents += "<table cellspacing='0'><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr>"; 
	htmlContents += "<tr>";

	//Get to the first Sunday
	while(dateCursor.getDay() > 0) {
		dateCursor.setTime(dateCursor.getTime() - 24 * 60 * 60 * 1000);
	}
	
	//Fill in the last several dates from last month
	var dateCursorPre = new Date(dateCursor.getTime() - 24 * 60 * 60 * 1000);
	while(dateCursorPre.getDate() < dateCursor.getDate()) {
		htmlContents += "<td class='dimmed'>" + dateCursor.getDate() +"</td>";
		dateCursor.setTime(dateCursor.getTime() + 24 * 60 * 60 * 1000);
		dateCursorPre.setTime(dateCursorPre.getTime() + 24 * 60 * 60 * 1000);
	}
	
	//Fill in the dates of this month
	while(dateCursor.getMonth() === month) {
		if (dateCursor.getDay() === 0 && dateCursor.getDate() !== 1) {
			htmlContents += "</tr><tr>";
		}
		htmlContents += "<td>" + dateCursor.getDate() +"</td>";
		dateCursor.setTime(dateCursor.getTime() + 24 * 60 * 60 * 1000);
	}
	
	if (dateCursor.getDay() === 0) { //When the current month finishes perfectly at a Saturday
		htmlContents += "</tr>";
	} else {
		while(true) {   //Fill in the first several dates of next month
			htmlContents += "<td class='dimmed'>" + dateCursor.getDate() +"</td>";
			if (dateCursor.getDay() === 6) {
				htmlContents += "</tr>";
				break;
			}
			dateCursor.setTime(dateCursor.getTime() + 24 * 60 * 60 * 1000);
		}
	}
	
	htmlContents += "</table>";
	var div = document.getElementById(this.id);
	div.innerHTML = htmlContents;
	
	var self = this;
	var dateCells = document.querySelectorAll("#" + self.id + " TD");
	Array.prototype.forEach.call(dateCells, function(element) {
		if (element.className !== "dimmed") {
			element.addEventListener("click", function() {
				self.dateSelection(self.id, {month: month + 1, day: element.innerHTML, year: year});
			});
		}
	});
	
	var prevButton = document.querySelector("#" + self.id + " #prev");
	prevButton.addEventListener("click", function() {
		dateCursor = new Date(date.getFullYear(), month, 1, 0, 0, 0, 0);
		self.render(new Date(dateCursor.getTime() - 24 * 60 * 60 * 1000));
	}); 

	var nextButton = document.querySelector("#" + self.id + " #next");
	nextButton.addEventListener("click", function() {
		dateCursor = new Date(date);
		// Simply adding 30 or 31 days will not work as in some edge case we will skip an entire month
		var dateCursorNext = new Date(date.getTime() + 24 * 60 * 60 * 1000);
		while(dateCursor.getDate() < dateCursorNext.getDate()) {
			dateCursor.setTime(dateCursor.getTime() + 24 * 60 * 60 * 1000);
			dateCursorNext.setTime(dateCursorNext.getTime() + 24 * 60 * 60 * 1000);
		}
		self.render(dateCursorNext);
	}); 
};
