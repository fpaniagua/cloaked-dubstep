function TeacherAttendance() {
    this.teacherAttributeSelector = new AttributeSelectorClass();
    this.teacherAttributeSelector.addAttributes(["smsTeacherId", "employeeNumber", "title", "preferredName", "familyName", "fullName",
	                                             "status", "birthDate", "employmentDate", "teacherCategoryName", "nationality", 
	                                             "invitationStatus", "invitationStatusPart2", "teacherRoleListAsString", "isInvited", "lessons",
	                                             "containsTeacherPicture", "teacherPictureHardDiskFileId", "teacherPictureRevision", "userId"]);
	
    
    // Constructor code here
    this.pageHeader = new PageHeaderWidget("Teacher Attendance");
    //this.pageHeader.activateRightBorderSection();
    
    this.dateSelection = new DateSelectorWidget(new Date(), this, function() {
        this.hasAttendance();
	});
	this.dateSelection.setStartAttendanceClickHandler(this, "clickedAddSchoolDay");
    this.dateSelection.finish();
	


    this.attendanceTableMarker = new MarkerWidget();
    this.attendanceTableMarker.hide();
    
    this.teacherAttendanceStatus = new MapClass();
    
    var rmi = new RMIUtilityClass(new Loadable());
    rmi.setSuccessHandler(this, "loadedActiveSemester");
    rmi.setArguments();
	rmi.remoteBeanCall("SMSAcademicYearAdmin", "getCurrentActiveSMSAcademicSemester");
}

TeacherAttendance.prototype.loadedActiveSemester = function(activeSemester) {
    this.activeSemester = activeSemester;
    
    this.renderTable();
    this.hasAttendance();
};



TeacherAttendance.prototype.hasAttendance = function(){
    var metisLoader = new MetisLoader("AttendanceStatuses");
    var formattedDate = this.getCurrentFormattedDate();
    
    var tableParameters = metisLoader.getTableParameters();
    tableParameters.setNumberOfItemsPerPage(1);
    
    metisLoader.setFilters([new EqFilter("date", formattedDate)]);
    Metis.load(metisLoader, this, function(){
        var item = metisLoader.get();
        if(item != null){
            this.dateSelection.hideTakeAttendance();
            this.attendanceTableMarker.show();
            this.teacherAttendanceTable.refreshTable();
        } else {
            this.dateSelection.showTakeAttendance();
            this.attendanceTableMarker.hide();
            this.teacherAttendanceTable.renderList([]);
            
        }
    });
};

TeacherAttendance.prototype.clickedAddSchoolDay = function(){
    this.dateSelection.hideTakeAttendance();
    this.attendanceTableMarker.show();
    this.teacherAttendanceTable.refreshTable();

};

TeacherAttendance.prototype.renderTable = function(){
    this.attendanceTableMarker.activate();
    this.attendanceTableMarker.hide();
    
    this.searchWidget = new SearchWidget();
	this.searchWidget.hideShowDeletedOption();

    new LineBreakWidget();

	this.teacherAttendanceTable = new DataTableWidget(this, "teacherAttendanceTableX", "fullName", 1);
    this.searchWidget.setTable(this.teacherAttendanceTable);
	
	this.teacherAttendanceTable.addHeader("Teacher", "fullName", true, false, 300);
	this.teacherAttendanceTable.addColumn(function(rowObject) {
		if(rowObject.getData("containsTeacherPicture") == true) {
			new ImageThumbnail(rowObject, "teacherPictureHardDiskFileId", "teacherPictureRevision");
		}
		
		var templateStr ="<em>${fullName}</em>";
		
		var title = rowObject.getData("title");
		if(title != null && title != "") {
			templateStr += "\n" + title;
		}
		
		templateStr +=  "\n" + rowObject.getData("teacherRoleListAsString");
		
		return $H(templateStr);
	});

    this.teacherAttendanceTable.addHeader("Status", "status", false, false, 100);
    this.teacherAttendanceTable.addColumn(function(rowObject) {
        if(this.teacherAttendanceStatus.containsKey(rowObject.getData("smsTeacherId"))) {
            return this.teacherAttendanceStatus.get(rowObject.getData("smsTeacherId")).getStatus().getStatusText();
        } else {
            return new AttendanceStatus().getStatus().getStatusText();
        }
        
    });
    
    this.teacherAttendanceTable.addHeader("Action", "action", false, false, 200);
    this.teacherAttendanceTable.addColumn(function(rowObject) {
        new ButtonWidget("Present", this, "clickedPresent", rowObject);
        new SpaceWidget();
        new ButtonWidget("Absent", this, "clickedAbsent", rowObject);
        if(this.teacherAttendanceStatus.containsKey(rowObject.getData("smsTeacherId"))) {
            new SpaceWidget();
            new ButtonWidget("Clear", this, "clickedClear", rowObject);
        } 
        
    });
        
	//this.teacherAttendanceTable.setClickHandler(this, "clickedTeacher");	

    this.teacherAttendanceTable.setSingleRowConstraint(function(searchParameters, rowObject) {
         searchParameters.addExactSearch("id", rowObject.getData("smsTeacherId"));
	});	
    
    var ownerObject = this;
	this.teacherAttendanceTable.setTableLoader(function(rmi, tableParameters, searchParameters, callbackObject, callbackMethod, callbackObj) {
        var callbackAction = new Action(arguments, 3);
        tableParameters.setNumberOfItemsPerPage(10000);
        tableParameters.setTableId(this.teacherAttendanceTable.tableId);
        tableParameters.setSortColumn(this.teacherAttendanceTable.sortColumn);
        tableParameters.setSortOrder(this.teacherAttendanceTable.sortOrder);
        
        rmi.setSuccessHandler(this, "proxyTableLoader", callbackAction);
        rmi.setArguments(this.teacherAttributeSelector, tableParameters, searchParameters);
    	rmi.remoteBeanCall("SMSTeacherAdmin", "getSMSTeacherList");
	});

	this.teacherAttendanceTable.renderList([]);
    this.attendanceTableMarker.finish();
    
};

TeacherAttendance.prototype.proxyTableLoader = function(teacherList, callbackObject, callbackMethod, callbackObj){
    var callbackAction;
    if(ClassUtil.isType(callbackObject, Action)) {
		callbackAction = callbackObject;
	} else {
		callbackAction = new Action(arguments, 1);
	}
    
    
    if(callbackAction != null && callbackAction.actionName != "renderSingleRow") {
        this.teacherAttendanceStatus = new MapClass();
    }
    var metisLoader = new MetisLoader("AttendanceStatuses");
    var formattedDate = this.getCurrentFormattedDate();
    
    //get all teacher ids:
    var subList = teacherList.getList();
    var orFilters = [];
    for(var i=0; i<subList.length; i++) {
        orFilters.push(new EqFilter("smsTeacherId", subList[i].getData("smsTeacherId")));
    }
    
    //setDate filter
    metisLoader.setFilters([new EqFilter("date", formattedDate), new OrFilter("orGroup",orFilters)]);
    metisLoader.setRetrievalSize(subList.length);
    Metis.load(metisLoader, this, function() {
        
        var teacherAttendanceList = metisLoader.getList();
        for(var i=0; i<teacherAttendanceList.length; i++) {
        	var teacherAttendanceStatus = teacherAttendanceList[i];

        	this.teacherAttendanceStatus.put(teacherAttendanceStatus.getSmsTeacherId(), teacherAttendanceStatus);
        }
        
          //renderTable
		callbackAction.call(teacherList);
    });

};

TeacherAttendance.prototype.clickedPresent = function(rowObject) {
    this.clickedButton(rowObject, "PRESENT");
};


TeacherAttendance.prototype.clickedAbsent = function(rowObject) {
    this.clickedButton(rowObject, "ABSENT");
};

TeacherAttendance.prototype.clickedButton = function(rowObject, status) {
    
    var teacherId = rowObject.getData("smsTeacherId");
    var teacherAttendance = null;
    if(this.teacherAttendanceStatus.containsKey(teacherId)) {
        teacherAttendance = this.teacherAttendanceStatus.get(teacherId);
    } else {
        teacherAttendance = new AttendanceStatus();
        teacherAttendance.setSmsTeacherId(teacherId);
        teacherAttendance.setDate(this.getCurrentFormattedDate());
    }
    
    
    var metisLoader = new MetisLoader("TeacherPackets", this.getTeacherPacketId(rowObject));
    Metis.load(metisLoader, this, function(){
        var teacherPacket = metisLoader.get();
        if(teacherPacket == null) {
            teacherPacket = new TeacherPacket();
            teacherPacket.setSmsTeacherId(teacherId);
        }

        if(status == "PRESENT") {
            teacherAttendance.markPresent();
        } else if(status == "ABSENT") {
            teacherAttendance.markAbsent();
        } else {
            teacherAttendance.markNotYetTaken();    
            teacherPacket.deleteAttendanceStatus(teacherAttendance);
            Metis.remove(teacherAttendance, this, function() {
                Metis.save(teacherPacket, this, function() {
                    this.teacherAttendanceStatus.put(teacherId, teacherAttendance);
                    this.teacherAttendanceTable.refreshTable(rowObject);
                });
            });
            
            return false;        
        }
        
        teacherPacket.updateAttendanceStatus(teacherAttendance);
        
        Metis.save([teacherPacket, teacherAttendance], this, function() {
            this.teacherAttendanceStatus.put(teacherId, teacherAttendance);
            this.teacherAttendanceTable.refreshTable(rowObject);
        });

    });
};

TeacherAttendance.prototype.clickedButtonWithDialog = function(rowObject, status) {
    
    var teacherId = rowObject.getData("smsTeacherId");
    var teacherAttendance = null;
    if(this.teacherAttendanceStatus.containsKey(teacherId)) {
        teacherAttendance = this.teacherAttendanceStatus.get(teacherId);
    } else {
        teacherAttendance = new AttendanceStatus();
        teacherAttendance.setSmsTeacherId(teacherId);
        teacherAttendance.setDate(this.getCurrentFormattedDate());
    }
    
    var dialog = new AddAttendanceStatusDialog(status, rowObject, teacherAttendance);
    dialog.setRefreshHandler(this, function(){
        this.teacherAttendanceStatus.put(teacherId, teacherAttendance);
        this.teacherAttendanceTable.refreshTable(rowObject);
    });
};


TeacherAttendance.prototype.clickedClear = function(rowObject) {
    this.clickedButton(rowObject, null);
};

//Returns PlainDate
TeacherAttendance.prototype.getCurrentFormattedDate = function(){
    return new PlainDate(this.dateSelection.getValue());
};

TeacherAttendance.prototype.getTeacherPacketId = function(rowObject) {
    return "tp:"+rowObject.getData("smsTeacherId");
};