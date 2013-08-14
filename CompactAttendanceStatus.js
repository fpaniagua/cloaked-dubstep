/**
 * This is saved in the TeacherPacket. It is designed to be as compact as possible
 * so that TeacherPacket can efficiently save a list of these.
 * 
 * There may be 80-90 work days a semester.
 */
function CompactAttendanceStatus() {
    this.id; // ID of AttendanceStatus
    this.status;
}
Metis.defineSubItem(CompactAttendanceStatus, "as", "id", "status");
Metis.createGettersAndSetters(CompactAttendanceStatus);
