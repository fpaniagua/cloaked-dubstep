function AddAttendanceStatusDialog(presentOrAbsent, teacherInfo, attendanceStatus) {
    ClassUtil.mixin(AddAttendanceStatusDialog, this, Refreshable);
    ClassUtil.mixin(AddAttendanceStatusDialog, this, Dialogable);
    
    var semesterId = semesterId;
    this.presentOrAbsent = presentOrAbsent;//PRESENT OR ABSENT
    this.teacherInfo = teacherInfo;
    this.attendanceStatus = attendanceStatus;

    var text = "";
    if(this.presentOrAbsent == "PRESENT") {
        this.dialog = new Dialog("Mark Present");
        this.dialog.setOkCancel(this, "loadTeacherPacketAndClickSave", "Present");
        text = "present";
    } else if(this.presentOrAbsent == "ABSENT") {
        this.dialog = new Dialog("Mark Absent");
        this.dialog.setOkCancel(this, "loadTeacherPacketAndClickSave", "Absent");
        text = "absent";
    } else {
        this.dialog = new Dialog("Clear Status");
        this.dialog.setOkCancel(this, "loadTeacherPacketAndClickSave", "Clear");
        text = "cleared";
    }
    
    this.render(text);
}

AddAttendanceStatusDialog.prototype.render = function(text) {
    new TextWidget($T("Do you want to mark " + this.teacherInfo.getData("fullName") + " as "+text+"?"));
    this.dialog.reposition();
};


AddAttendanceStatusDialog.prototype.loadTeacherPacketAndClickSave = function() {
    var metisLoader = new MetisLoader("TeacherPackets", this.getTeacherPacketId());
    Metis.load(metisLoader, this, function(){
        this.teacherPacket = metisLoader.get();
        if(this.teacherPacket == null) {
            this.teacherPacket = new TeacherPacket();
            this.teacherPacket.setSmsTeacherId(this.teacherInfo.getData("smsTeacherId"));
        }
        
        this.clickedSave();
    });
    
    return false;
};

AddAttendanceStatusDialog.prototype.clickedSave = function() {

    if(this.attendanceStatus == null) {
        this.attendanceStatus = new AttendanceStatus(this.presentOrAbsent);
    } else {
        if(this.presentOrAbsent == "PRESENT") {
            this.attendanceStatus.markPresent();
        } else if(this.presentOrAbsent == "ABSENT") {
            this.attendanceStatus.markAbsent();
        } else {
            this.attendanceStatus.markNotYetTaken();
            
            this.teacherPacket.deleteAttendanceStatus(this.attendanceStatus);
            Metis.remove(this.attendanceStatus, this, function() {
                Metis.save(this.teacherPacket, this, function() {
                    this.closeDialogBox();
                    this.refreshAction.call();
                });
            });
            
            return false;
            
        }
    }
    
    
    this.teacherPacket.updateAttendanceStatus(this.attendanceStatus);
    
    Metis.save([this.teacherPacket, this.attendanceStatus], this, function() {
        this.closeDialogBox();
        this.refreshAction.call();
    });
    
    return false;
}

AddAttendanceStatusDialog.prototype.getTeacherPacketId = function() {
    return "tp:"+this.teacherInfo.getData("smsTeacherId");
};