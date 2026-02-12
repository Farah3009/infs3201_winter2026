const prompt = require("prompt-sync")();
const business = require("./business");

/**
 * Displays the main menu
 */
function showMenu() {
    console.log("\nEmployee Scheduling System");
    console.log("-------------------------");
    console.log("1. Show all employees");
    console.log("2. Add new employee");
    console.log("3. Assign employee to shift");
    console.log("4. View employee schedule");
    console.log("5. Exit");
}

/**
 * Displays all employees
 */
async function showEmployees() {
    const employees = await business.getEmployees();
    console.log("\nEmployee ID  Name                Phone");
    console.log("-----------  ------------------- ---------");
    for (let i = 0; i < employees.length; i++) {
        const e = employees[i];
        console.log(
            e.employeeId.padEnd(12) +
            e.name.padEnd(21) +
            e.phone
        );
    }
}

/**
 * Adds a new employee
 */
async function addEmployee() {
    const name = prompt("Enter employee name: ");
    const phone = prompt("Enter phone number: ");
    await business.addEmployee(name, phone);
    console.log("Employee added successfully.");
}

/**
 * Assigns an employee to a shift
 */
async function assignEmployeeToShift() {
    const employeeId = prompt("Enter employee ID: ");
    const shiftId = prompt("Enter shift ID: ");

    const result = await business.assignEmployee(employeeId, shiftId);
    console.log(result);
}

/**
 * Views an employee schedule
 */
async function viewEmployeeSchedule() {
    const employeeId = prompt("Enter employee ID: ");
    const schedule = await business.getEmployeeSchedule(employeeId);

    if (schedule.length === 0) {
        console.log("No shifts found or employee does not exist.");
        return;
    }

    console.log("\ndate,startTime,endTime");
    for (let i = 0; i < schedule.length; i++) {
        const s = schedule[i];
        console.log(`${s.date},${s.startTime},${s.endTime}`);
    }
}

/**
 * Main program loop
 */
async function main() {
    while (true) {
        showMenu();
        const choice = prompt("What is your choice> ");

        if (choice === "1") {
            await showEmployees();
        } else if (choice === "2") {
            await addEmployee();
        } else if (choice === "3") {
            await assignEmployeeToShift();
        } else if (choice === "4") {
            await viewEmployeeSchedule();
        } else if (choice === "5") {
            console.log("Goodbye!");
            break;
        } else {
            console.log("Invalid choice. Please try again.");
        }
    }
}

main();
