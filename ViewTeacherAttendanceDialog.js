function ViewTeacherAttendanceDialog(activeSemesterInfo, teacherInfo) {
    this.activeSemesterInfo = activeSemesterInfo;
	this.teacherInfo = teacherInfo;
    
    this.dialog = new FullPageDialog();
    this.pageHeader = new PageHeaderWidget(teacherInfo.getData("fullName"));
    this.pageHeader.activateRightBorderSection();
    
    var panel = new HorizontalPanelWidget("right", false);
	new DemotedButtonWidget("Close", this.dialog, "close");
	panel.finish();
	this.dialog.resetInsertPosition();
    
    //load and render attendance chart
    new TeacherAttendanceChart(this.activeSemesterInfo, this.teacherInfo, false);
    
}