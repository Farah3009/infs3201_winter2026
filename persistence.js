const fs = require("fs/promises");

/**
 * Reads a JSON file and returns parsed content
 * @param {string} fileName - Name of the JSON file
 * @returns {Promise<Array|Object>} - Parsed JSON data
 */
async function readJsonFile(fileName) {
    const data = await fs.readFile(fileName, "utf-8");
    return JSON.parse(data);
}

/**
 * Writes data to a JSON file
 * @param {string} fileName - Name of the JSON file
 * @param {Array|Object} data - Data to write
 * @returns {Promise<void>}
 */
async function writeJsonFile(fileName, data) {
    await fs.writeFile(fileName, JSON.stringify(data, null, 4));
}

/**
 * Finds an employee by ID
 * @param {string} employeeId
 * @returns {Promise<Object|null>} - Employee object or null
 */
async function findEmployee(employeeId) {
    const employees = await readJsonFile("employees.json");
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId === employeeId) {
            return employees[i];
        }
    }
    return null;
}

/**
 * Finds a shift by ID
 * @param {string} shiftId
 * @returns {Promise<Object|null>} - Shift object or null
 */
async function findShift(shiftId) {
    const shifts = await readJsonFile("shifts.json");
    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftId) {
            return shifts[i];
        }
    }
    return null;
}

/**
 * Retrieves all assignments
 * @returns {Promise<Array>} - Array of assignments
 */
async function getAssignments() {
    return await readJsonFile("assignments.json");
}

/**
 * Saves a new assignment
 * @param {Object} assignment - Assignment object { employeeId, shiftId }
 * @returns {Promise<void>}
 */
async function saveAssignment(assignment) {
    const assignments = await getAssignments();
    assignments.push(assignment);
    await writeJsonFile("assignments.json", assignments);
}

/**
 * Retrieves maximum daily hours from config
 * @returns {Promise<number>} - Maximum hours allowed per day
 */
async function getMaxDailyHours() {
    const config = await readJsonFile("config.json");
    return config.maxDailyHours;
}

module.exports = {
    readJsonFile,
    writeJsonFile,
    findEmployee,
    findShift,
    getAssignments,
    saveAssignment,
    getMaxDailyHours
};
