function AttendanceStatus(status) {
    this.id;
    this.smsTeacherId;
    this.date;//PlainDate.
    
    if(status == null) status = new AttendanceStatusEnum();
    
    // Either "PRESENT" or "ABSENT"
    this.status = status;
}
Metis.define(AttendanceStatus, "AttendanceStatuses", "id", "smsTeacherId", "date", "status");
Metis.defineSortColumn(AttendanceStatus, "date", "asc");
Metis.createGettersAndSetters(AttendanceStatus);

AttendanceStatus.prototype.getId = function() {
    return this.smsTeacherId+":"+this.date;
};

AttendanceStatus.prototype.markPresent = function() {
    this.status = new AttendanceStatusEnum("PRESENT");
};

AttendanceStatus.prototype.markAbsent = function() {
    this.status = new AttendanceStatusEnum("ABSENT");
};

AttendanceStatus.prototype.markNotYetTaken = function() {
    this.status = new AttendanceStatusEnum();
};