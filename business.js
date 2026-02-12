const persistence = require("./persistence");

/**
 * Computes the duration of a shift in hours
 * @param {string} startTime - Format "HH:MM"
 * @param {string} endTime - Format "HH:MM"
 * @returns {number} - Duration in hours (e.g., 2.5)
 */
function computeShiftDuration(startTime, endTime) {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
}

/**
 * Retrieves all employees
 * @returns {Promise<Array>} - Array of employee objects
 */
async function getEmployees() {
    return await persistence.readJsonFile("employees.json");
}

/**
 * Adds a new employee
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function addEmployee(name, phone) {
    const employees = await persistence.readJsonFile("employees.json");
    let maxId = 0;
    for (let i = 0; i < employees.length; i++) {
        const currentId = parseInt(employees[i].employeeId.substring(1));
        if (currentId > maxId) maxId = currentId;
    }
    const newEmployeeId = "E" + String(maxId + 1).padStart(3, "0");
    employees.push({ employeeId: newEmployeeId, name, phone });
    await persistence.writeJsonFile("employees.json", employees);
}

/**
 * Checks if employee exists
 * @param {string} employeeId
 * @returns {Promise<boolean>}
 */
async function employeeExists(employeeId) {
    const emp = await persistence.findEmployee(employeeId);
    return !!emp;
}

/**
 * Checks if shift exists
 * @param {string} shiftId
 * @returns {Promise<boolean>}
 */
async function shiftExists(shiftId) {
    const shift = await persistence.findShift(shiftId);
    return !!shift;
}

/**
 * Checks if employee is already assigned to a shift
 * @param {string} employeeId
 * @param {string} shiftId
 * @returns {Promise<boolean>}
 */
async function isAlreadyAssigned(employeeId, shiftId) {
    const assignments = await persistence.getAssignments();
    for (let i = 0; i < assignments.length; i++) {
        const a = assignments[i];
        if (a.employeeId === employeeId && a.shiftId === shiftId) return true;
    }
    return false;
}

/**
 * Checks if assigning a shift exceeds max daily hours
 * @param {string} employeeId
 * @param {Object} newShift - { date, startTime, endTime }
 * @returns {Promise<boolean>}
 */
async function exceedsDailyHours(employeeId, newShift) {
    const assignments = await persistence.getAssignments();
    const maxHours = await persistence.getMaxDailyHours();

    let totalHours = computeShiftDuration(newShift.startTime, newShift.endTime);

    for (let i = 0; i < assignments.length; i++) {
        const a = assignments[i];
        if (a.employeeId === employeeId) {
            const s = await persistence.findShift(a.shiftId);
            if (s.date === newShift.date) {
                totalHours += computeShiftDuration(s.startTime, s.endTime);
            }
        }
    }

    return totalHours > maxHours;
}

/**
 * Assigns an employee to a shift
 * @param {string} employeeId
 * @param {string} shiftId
 * @returns {Promise<string>} - Status message
 */
async function assignEmployee(employeeId, shiftId) {
    if (!await employeeExists(employeeId)) return "Employee does not exist";
    if (!await shiftExists(shiftId)) return "Shift does not exist";
    if (await isAlreadyAssigned(employeeId, shiftId)) return "Employee already assigned";

    const shift = await persistence.findShift(shiftId);
    if (await exceedsDailyHours(employeeId, shift)) return "Cannot assign: exceeds max daily hours";

    await persistence.saveAssignment({ employeeId, shiftId });
    return "Shift assigned successfully";
}

/**
 * Retrieves schedule for an employee
 * @param {string} employeeId
 * @returns {Promise<Array>} - Array of shift objects
 */
async function getEmployeeSchedule(employeeId) {
    const assignments = await persistence.getAssignments();
    const shifts = await persistence.readJsonFile("shifts.json");

    const schedule = [];
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeId) {
            for (let j = 0; j < shifts.length; j++) {
                if (assignments[i].shiftId === shifts[j].shiftId) {
                    schedule.push(shifts[j]);
                }
            }
        }
    }

    return schedule;
}

module.exports = {
    computeShiftDuration,
    getEmployees,
    addEmployee,
    employeeExists,
    shiftExists,
    isAlreadyAssigned,
    exceedsDailyHours,
    assignEmployee,
    getEmployeeSchedule
};
