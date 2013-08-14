function TeacherAttendanceHistory() {
    this.teacherAttributeSelector = new AttributeSelectorClass();
    this.teacherAttributeSelector.addAttributes(["smsTeacherId", "employeeNumber", "title", "preferredName", "familyName", "fullName",
                                                 "status", "birthDate", "employmentDate", "teacherCategoryName", "nationality", 
	                                             "invitationStatus", "invitationStatusPart2", "teacherRoleListAsString", "isInvited", "lessons",
	                                             "containsTeacherPicture", "teacherPictureHardDiskFileId", "teacherPictureRevision", "userId"]);
	
    this.pageHeader = new PageHeaderWidget("Attendance History");
 
    var rmi = new RMIUtilityClass(new Loadable());
    rmi.setSuccessHandler(this, "loadedActiveSemester");
	rmi.setArguments();
	rmi.remoteBeanCall("SMSAcademicYearAdmin", "getCurrentActiveSMSAcademicSemester");
}

TeacherAttendanceHistory.prototype.loadedActiveSemester = function(activeSemesterInfo) {
    this.activeSemesterInfo = activeSemesterInfo;
    
    new SecondaryHeaderWidget(this.activeSemesterInfo.getData("academicYearAndSemesterName"));
    
    var startPDate = new PlainDate(this.activeSemesterInfo.getData("startPDate"));
    var endPDate = new PlainDate(this.activeSemesterInfo.getData("endPDate"));
    //new LineBreakWidget(.1);
    new TextWidget(DateUtil.getShortFormattedDate(startPDate) + " - "+DateUtil.getShortFormattedDate(endPDate), 
        {"font-size":".85em"});
    
    this.renderTable();
};



TeacherAttendanceHistory.prototype.renderTable = function(){
    
    this.searchWidget = new SearchWidget();
    this.searchWidget.hideShowDeletedOption();

    new LineBreakWidget();

	this.teacherAttendanceTable = new DataTableWidget(this, "teacherAttendanceHistoryTable", "fullName", 1);
    this.searchWidget.setTable(this.teacherAttendanceTable);
	
	this.teacherAttendanceTable.addHeader("Teacher", "fullName", true, true, 300);
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

    this.teacherAttendanceTable.addHeader("Attendance", "daysPresent", false, false, 100);
    this.teacherAttendanceTable.addColumn(function(rowObject) {
         if(this.teacherPacketMap.containsKey(rowObject.getData("smsTeacherId"))) {
             var teacherPacket = this.teacherPacketMap.get(rowObject.getData("smsTeacherId"));
             teacherPacket.recalculateDaysPresentBetweenDates(this.activeSemesterInfo.getData("startPDate"), this.activeSemesterInfo.getData("endPDate"));
             return "Present: "+teacherPacket.getDaysPresent()+"\n"
                + "Absent: "+teacherPacket.getDaysAbsent();
        } 
        
        return "Unknown";
        
    });
    
        
	this.teacherAttendanceTable.setClickHandler(this, "clickedTeacher");	

    this.teacherAttendanceTable.setSingleRowConstraint(function(searchParameters, rowObject) {
         searchParameters.addExactSearch("id", rowObject.getData("smsTeacherId"));
	});	
    
	this.teacherAttendanceTable.setTableLoader(function(rmi, tableParameters, searchParameters, callbackObject, callbackMethod, callbackObj){
        var callbackAction = new Action(arguments, 3);
        tableParameters.setNumberOfItemsPerPage(10000);
        rmi.setSuccessHandler(this, "proxyTableLoader", callbackAction);
        rmi.setArguments(this.teacherAttributeSelector, tableParameters, searchParameters);
		rmi.remoteBeanCall("SMSTeacherAdmin", "getSMSTeacherList");
	});

	this.teacherAttendanceTable.render();
};

TeacherAttendanceHistory.prototype.proxyTableLoader = function(teacherList, callbackObject, callbackMethod, callbackObj){
    var callbackAction;
    if(ClassUtil.isType(callbackObject, Action)) {
		callbackAction = callbackObject;
	} else {
		callbackAction = new Action(arguments, 1);
	}
    
    if(callbackAction != null && callbackAction.actionName != "renderSingleRow") {
        this.teacherPacketMap = new MapClass();
    }
    
    var metisLoader = new MetisLoader("TeacherPackets");
    
    var subList = teacherList.getList();
    var orFilters = [];
    for(var i=0; i<subList.length; i++) {
        orFilters.push(new EqFilter("smsTeacherId", subList[i].getData("smsTeacherId")));
    }
    
    metisLoader.setFilters([new OrFilter("orGroup",orFilters)]);
    metisLoader.setRetrievalSize(subList.length);
    Metis.load(metisLoader, this, function() {
        var teacherPackets = metisLoader.getList();
        for(var i=0; i<teacherPackets.length; i++) {
            var teacherPacket = teacherPackets[i];
        	this.teacherPacketMap.put(teacherPacket.getSmsTeacherId(), teacherPacket);
        }
	    callbackAction.call(teacherList);
    });
};


TeacherAttendanceHistory.prototype.clickedTeacher = function(rowObject) {
    var dialog = new ViewTeacherAttendanceDialog(this.activeSemesterInfo,rowObject);
};
