// One teacherPacker per Teacher
function TeacherPacket() {
    this.id;
    this.smsTeacherId;
    
    this.daysPresent = 0;
    this.daysAbsent = 0;
    
    // An array of CompactAttendanceStatus: Currently every attendanceStatus
    this.attendanceStatuses = [];
}
Metis.define(TeacherPacket, "TeacherPackets", "id", "smsTeacherId", "daysPresent","daysAbsent", "attendanceStatuses");
Metis.defineSortColumn(TeacherPacket, "semesterId", "asc");
Metis.createGettersAndSetters(TeacherPacket);

TeacherPacket.prototype.getId = function() {
    return "tp:"+this.smsTeacherId;
};

TeacherPacket.prototype.addAttendanceStatus = function(attendanceStatus) {
    
    var as = new CompactAttendanceStatus();
    as.setId(attendanceStatus.getId());
    
    if(attendanceStatus.getStatus().getStatusType() == "PRESENT") {
        as.setStatus("PRESENT");
    } else if(attendanceStatus.getStatus().getStatusType() == "ABSENT") {
        as.setStatus("ABSENT");
    } else {
        throw new Error("Something wrong");
    }
    
    this.attendanceStatuses.push(as);
};

TeacherPacket.prototype.updateAttendanceStatus = function(attendanceStatus) {
    for(var i=0; i<this.attendanceStatuses.length; i++) {
        var as = this.attendanceStatuses[i];
        if(as.getId() == attendanceStatus.getId()) {
            as.setStatus(attendanceStatus.getStatus().getStatusType());
            return;
        }
    }
    //did not find, so let's add
    this.addAttendanceStatus(attendanceStatus);
};

//Uses CompactAttendanceStatus
TeacherPacket.prototype.recalculateDaysPresent = function() {
    var daysPresent = 0;
    var daysAbsent = 0;
    for(var i=0; i<this.attendanceStatuses.length; i++) {
        var as = this.attendanceStatuses[i];
        if(as.getStatus() == "PRESENT") {
            daysPresent += 1;
        } else if(as.getStatus() == "ABSENT") {
            daysAbsent += 1;
        }
    }
    this.daysPresent = daysPresent;
    this.daysAbsent = daysAbsent;
    
};

//Uses CompactAttedanceStatus; between range, inclusive.
TeacherPacket.prototype.recalculateDaysPresentBetweenDates = function(startPDate, endPDate) {
    var daysPresent = 0;
    var daysAbsent = 0;
    var startDateId = this._generateCompactStatusId(startPDate);
    var endDateId = this._generateCompactStatusId(endPDate);
    
    for(var i=0; i<this.attendanceStatuses.length; i++) {
        var as = this.attendanceStatuses[i];
        //now check between range:
        if(as.getId() >= startDateId && as.getId() <= endDateId) {
            if(as.getStatus() == "PRESENT") {
                daysPresent += 1;
            } else if(as.getStatus() == "ABSENT") {
                daysAbsent += 1;
            }
        }
        
    }
    this.daysPresent = daysPresent;
    this.daysAbsent = daysAbsent;
};

TeacherPacket.prototype.deleteAttendanceStatus = function(attendanceStatus) {
    for(var i=0; i<this.attendanceStatuses.length; i++) {
        var as = this.attendanceStatuses[i];
        if(as.getId() == attendanceStatus.getId()) {
            this.attendanceStatuses.splice(i, 1);
            return;
        }
    }
};

TeacherPacket.prototype._generateCompactStatusId = function(pDate) {
    //YYYY-mm-dd
    return this.smsTeacherId+":"+pDate;
};