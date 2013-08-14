function TeacherAttendanceChart(activeSemesterInfo, teacherInfo, isClickAble, onRefreshAction) {
    if(ClassUtil.inherit(TeacherAttendanceChart, this, Widget, arguments)) return;
	ClassUtil.mixin(TeacherAttendanceChart, this, AttendanceChartWidget);
    
    AttendanceChartWidget.call(this, isClickAble, onRefreshAction);
    
    this.tooltip.maxWidth=150;
    this.teacherInfo = teacherInfo;
    this.activeSemesterInfo = activeSemesterInfo;
    
    this.loadAndRender();
}

//load teacherPacket
TeacherAttendanceChart.prototype.loadAndRender = function() {
    
    var dateStartString = this._getMonthLookup(this.refDate)+"-";
    var daysInMonth = this.getDaysInMonth(this.refDate);
    var monthStart = new PlainDate(dateStartString+"01");
    var monthEnd = new PlainDate(dateStartString+daysInMonth);
    
    
    //did we already load this data??
    if(this.monthlyLookup.containsKey(this._getMonthLookup(this.refDate))) {
    	this.render();
		return;
	}
    
    //nope
	this.marker.setActive();
	
    var metisLoader = new MetisLoader("AttendanceStatuses");
    //filters: smsTeacherId, dates between monthStart and monthEnd
    metisLoader.setFilters([
        new EqFilter("smsTeacherId", this.teacherInfo.getData("smsTeacherId")),
        new BetweenFilter("date", monthStart, monthEnd)    
    ]);
    metisLoader.setRetrievalSize(daysInMonth);
    Metis.load(metisLoader, this, function(){
        var attendanceStatusByDays = metisLoader.getList();
        this.loadedInformation(attendanceStatusByDays);
    });
    
    
    return false;
    
	var rmi = new RMIUtilityClass(new Loadable());
	rmi.setSuccessHandler(this, "loadedInformation");
	rmi.setArguments(this.studentInfo.getData("smsStudentStubId"), this.refDate);
	rmi.remoteBeanCall("SMSStudentAttendanceAdmin", "getMonthlyStudentAttendance");
};

// Returns the number of days in a given month
TeacherAttendanceChart.prototype.getDaysInMonth = function(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth()+1, 0).getDate(); 
};

TeacherAttendanceChart.prototype.loadedInformation = function(attendanceStatusByDays) {
    var resultMap = new MapClass();
    resultMap.put("attendanceType", null);
    
    var attendanceStatusMap = new MapClass();
    for(var i=0; i<attendanceStatusByDays.length; i++) {
        var attendanceStatus = attendanceStatusByDays[i];
        
        // MapKey is dd-mm-yyyy, getDate() returns PlainDate, toString() returns yyyy-mm-dd
        var dateTokens = attendanceStatus.getDate().toString().split("-");
        
        attendanceStatusMap.put(dateTokens[2]+"-"+dateTokens[1]+"-"+dateTokens[0], attendanceStatus);
    }
    
    
    resultMap.put("attendanceMapByDate", attendanceStatusMap);
    
    
    
    this.monthlyLookup.put(this._getMonthLookup(this.refDate), resultMap);
	this.summaryInfo = null;//most up to date;
	
	this.render();
};

TeacherAttendanceChart.prototype.renderPeriods = function(dayJq, attendanceStatus, dateCounter) {
	var periodHolder = dayJq.find(".periodHolder");
	
    var status = attendanceStatus.getStatus().getStatusType();
	
	var dateCounter = dateCounter;

	var period = this.periods.filter("." + status);
	
    var periodJq = period.clone();
	periodHolder.append(periodJq);
	
	this.setTooltip(dayJq, status);
	periodHolder.find(".period").first().css({"border-left": "1px solid transparent"});
};

TeacherAttendanceChart.prototype.setTooltip = function(periodJq, status) {
    var ownerObject = this;
	this.tooltip.setTriggerElement(periodJq, function() {
		var prettyStatus = ownerObject.prettyStatus[status];
		var prettyStatusHtml = "<em>" + $T(prettyStatus) + "</em>"
		return $H(prettyStatusHtml, true);
	});
};

//Cannot edit
TeacherAttendanceChart.prototype.setEditAttendance = function(periodJq, periodMap, dateCounter, isPeriod){
    return false;
};

TeacherAttendanceChart.prototype.renderPieChart = function() {
    //Render Summary:
    var text = this.activeSemesterInfo.getData("academicYearAndSemesterName") + "\n" +
    $T("Start Date: ") + DateUtil.getShortFormattedDate(new PlainDate(this.activeSemesterInfo.getData("startPDate"))) + "\n" +
    $T("End Date: ") + DateUtil.getShortFormattedDate(new PlainDate(this.activeSemesterInfo.getData("endPDate"))) ;
    
    if(this.summaryText != null) {
        this.summaryText.setText(text);
    } else {
        this.titleMarker.activate();
	    this.summaryText = new TextWidget(text);
        new LineBreakWidget();
        this.titleMarker.finish();
    }
};