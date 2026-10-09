
/* =====================================
   Elements
===================================== */

const tableBody = document.getElementById("tasksTableBody");
const pagination = document.getElementById("pagination");
const paginationInfo = document.getElementById("paginationInfo");
const emptyMessage = document.getElementById("emptyMessage");
const searchDate = document.getElementById("searchDate");
const searchButton = document.getElementById("searchButton");
const resetButton = document.getElementById("resetButton");
const addTaskButton = document.querySelector(".btn-add-task");

const totalTasksElement = document.getElementById("totalTasks");
const urgentTasksElement = document.getElementById("urgentTasks");
const upcomingTasksElement = document.getElementById("upcomingTasks");

const pageSize = 5;

let currentPage = 1;
let filteredRows = [];


/* =====================================
   Get All Task Rows
===================================== */

function getRows() {
    return Array.from(tableBody.querySelectorAll("tr"));
}


/* =====================================
   Format Date and Time
===================================== */

function formatDeadline(deadline) {
    const dateText = deadline.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const timeText = deadline.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return { dateText, timeText };
}


/* =====================================
   Update Deadlines and Statistics
===================================== */

function updateDeadlines() {
    const now = new Date();

    getRows().forEach(row => {
        const offsetHours = Number(row.dataset.offsetHours);

        // Demo deadline calculated relative to current time.
        const deadline = new Date(
            now.getTime() + offsetHours * 60 * 60 * 1000
        );

        // Save deadline date and timestamp for filtering and sorting.
        row.dataset.deadline =
            `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, "0")}-${String(deadline.getDate()).padStart(2, "0")}`;

        row.dataset.deadlineTimestamp = deadline.getTime();

        const { dateText, timeText } = formatDeadline(deadline);

        const deadlineCell = row.querySelector(".deadline-cell");

        // Reset cell content so warning messages never duplicate.
        deadlineCell.innerHTML = `
            <div class="deadline-text">
                <div>
                    <i class="bi bi-calendar-event me-1"></i>
                    ${dateText}
                </div>

                <div class="mt-1">
                    <i class="bi bi-clock me-1"></i>
                    ${timeText}
                </div>
            </div>
        `;

        const isOverdue = deadline < now;

        const isUrgent =
            !isOverdue &&
            deadline <= new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Highlight overdue and urgent task rows.
        row.classList.toggle(
            "deadline-danger",
            isOverdue || isUrgent
        );

        const deadlineText = deadlineCell.querySelector(".deadline-text");

        deadlineText.classList.toggle(
            "deadline-warning",
            isOverdue || isUrgent
        );

        deadlineText.classList.toggle(
            "deadline-normal",
            !isOverdue && !isUrgent
        );

        // Display the appropriate deadline message.
        if (isOverdue) {
            deadlineText.insertAdjacentHTML("beforeend", `
                <small class="text-danger d-block mt-1">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Deadline passed
                </small>
            `);
        } else if (isUrgent) {
            deadlineText.insertAdjacentHTML("beforeend", `
                <small class="text-danger d-block mt-1">
                    <i class="bi bi-alarm me-1"></i>
                    Due within 24 hours
                </small>
            `);
        }
    });

    // Update statistics.
    const rows = getRows();

    totalTasksElement.textContent = rows.length;

    urgentTasksElement.textContent = rows.filter(row => {
        const hours = Number(row.dataset.offsetHours);
        return hours > 0 && hours <= 24;
    }).length;

    upcomingTasksElement.textContent = rows.filter(row => {
        return Number(row.dataset.offsetHours) > 24;
    }).length;
}


/* =====================================
   Render Pagination
===================================== */

/*function renderTasks() {
    const allRows = getRows();

    // Hide all rows before displaying the current page.
    allRows.forEach(row => row.classList.add("d-none"));

    const total = filteredRows.length;
    const totalPages = Math.ceil(total / pageSize);

    pagination.innerHTML = "";

    // Display empty state when no tasks match.
    if (total === 0) {
        emptyMessage.classList.remove("d-none");
        paginationInfo.textContent = "No tasks found";
        return;
    }

    emptyMessage.classList.add("d-none");

    // Keep current page within the valid range.
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    // Display only the tasks belonging to this page.
    filteredRows.slice(start, end).forEach(row => {
        row.classList.remove("d-none");
        tableBody.appendChild(row);
    });

    paginationInfo.textContent =
        `Showing ${start + 1}–${end} of ${total} tasks`;

    // Create a pagination button.
    function addPage(label, page, disabled, active = false) {
        const li = document.createElement("li");

        li.className =
            `page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}`;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "page-link";
        button.textContent = label;
        button.disabled = disabled;

        button.addEventListener("click", () => {
            currentPage = page;
            renderTasks();
        });

        li.appendChild(button);
        pagination.appendChild(li);
    }*/

    // Previous page.
    addPage("‹", currentPage - 1, currentPage === 1);

    // Page numbers.
    for (let page = 1; page <= totalPages; page++) {
        addPage(page, page, false, page === currentPage);
    }

    // Next page.
    addPage("›", currentPage + 1, currentPage === totalPages);
}


/* =====================================
   Search and Sort Tasks
===================================== */

function searchTasks() {
    const selectedDate = searchDate.value;

    filteredRows = getRows()
        .filter(row => {
            return !selectedDate ||
                row.dataset.deadline === selectedDate;
        })
        // Sort by full deadline, including time.
        .sort((a, b) => {
            return Number(a.dataset.deadlineTimestamp) -
                Number(b.dataset.deadlineTimestamp);
        });

    currentPage = 1;

    renderTasks();
}


/* =====================================
   Search Button
===================================== */

searchButton.addEventListener("click", searchTasks);


/* =====================================
   Reset Button
===================================== */

resetButton.addEventListener("click", () => {
    searchDate.value = "";
    searchTasks();
});


/* =====================================
   Search Using Enter
===================================== */

searchDate.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        searchTasks();
    }
});


/* =====================================
   Task Actions
===================================== */

document.addEventListener("click", event => {
    const editButton = event.target.closest(".edit-button");
    const deleteButton = event.target.closest(".delete-button");
    const fileLink = event.target.closest(".file-link");

    // Edit task: demo only.
   /* if (editButton) {
        alert("Edit Task: connect this button to your Edit page.");
    }*/

    // Delete task from the demo table.
/*    if (deleteButton) {
        const row = deleteButton.closest("tr");

        if (confirm("Are you sure you want to delete this task?")) {
            row.remove();

            updateDeadlines();
            searchTasks();
        }
    }*/

    // File download: placeholder until a real file URL is provided.
/*    if (fileLink) {
        event.preventDefault();

        alert("No real file is connected yet.");
    }*/
});


/* =====================================
   Add Task Button
===================================== */


/* =====================================
   Initialize Page
===================================== */

updateDeadlines();
searchTasks();
