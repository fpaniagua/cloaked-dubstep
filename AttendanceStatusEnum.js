function AttendanceStatusEnum(statusType) {
    this.statusType = statusType;
}
Metis.defineSubItem(AttendanceStatusEnum, "AttendanceStatusEnum", "statusType");
Metis.createGettersAndSetters(AttendanceStatusEnum);

AttendanceStatusEnum.prototype.getStatusText = function() {
    if(this.statusType == "PRESENT") {
        return "Present";
    } else if(this.statusType == "ABSENT") {
        return "Absent"
    } else {
        return "Not yet taken";
    }
};