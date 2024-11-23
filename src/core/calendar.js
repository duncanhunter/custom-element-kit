export function renderCalendar(container, selectedDate) {
	container.innerHTML = ""; // Clear previous calendar
	const calendar = document.createElement("div");
	calendar.classList.add("calendar");

	const monthYearPicker = document.createElement("div");
	monthYearPicker.classList.add("month-year-picker");
	monthYearPicker.innerHTML = `
        <button data-action="prev-month" aria-label="Previous Month">&lt;</button>
        <span data-display="month-year"></span>
        <button data-action="next-month" aria-label="Next Month">&gt;</button>
    `;
	calendar.appendChild(monthYearPicker);

	const grid = document.createElement("div");
	grid.classList.add("calendar-grid");
	// Populate grid with dates
	populateDates(grid, selectedDate);
	calendar.appendChild(grid);

	container.appendChild(calendar);
	updateMonthYearDisplay(monthYearPicker, selectedDate);
}

function populateDates(grid, date) {
	grid.innerHTML = ""; // Clear previous dates
	const year = date.getFullYear();
	const month = date.getMonth();

	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	// Create empty slots for days before the first day
	for (let i = 0; i < firstDay; i++) {
		const emptyCell = document.createElement("div");
		emptyCell.classList.add("empty");
		grid.appendChild(emptyCell);
	}

	// Create cells for each day
	for (let day = 1; day <= daysInMonth; day++) {
		const dateCell = document.createElement("button");
		const currentDate = new Date(year, month, day);
		dateCell.textContent = day;
		dateCell.setAttribute("data-date", currentDate.toISOString().split("T")[0]);
		dateCell.setAttribute("tabindex", "-1");
		dateCell.addEventListener("click", () => {
			// Handle date selection
			const event = new CustomEvent("date-selected", {
				detail: { date: currentDate },
			});
			grid.dispatchEvent(event);
		});
		grid.appendChild(dateCell);
	}
}

function updateMonthYearDisplay(picker, date) {
	const display = picker.querySelector('[data-display="month-year"]');
	const options = { month: "long", year: "numeric" };
	display.textContent = date.toLocaleDateString(undefined, options);
}

export function initializeCalendarNavigation(container, datePicker) {
	container.addEventListener("date-selected", (e) => {
		datePicker.shadowRoot.querySelector("#control").value =
			e.detail.date.toLocaleDateString();
		datePicker.hide();
	});

	container.addEventListener("keydown", (e) => {
		const focusable = container.querySelectorAll("button[data-date]");
		const focusArray = Array.from(focusable);
		const currentIndex = focusArray.indexOf(document.activeElement);

		switch (e.key) {
			case "ArrowRight":
				e.preventDefault();
				if (currentIndex < focusArray.length - 1) {
					focusArray[currentIndex + 1].focus();
				}
				break;
			case "ArrowLeft":
				e.preventDefault();
				if (currentIndex > 0) {
					focusArray[currentIndex - 1].focus();
				}
				break;
			case "ArrowDown":
				e.preventDefault();
				if (currentIndex + 7 < focusArray.length) {
					focusArray[currentIndex + 7].focus();
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (currentIndex - 7 >= 0) {
					focusArray[currentIndex - 7].focus();
				}
				break;
			case "Enter":
			case " ":
				e.preventDefault();
				document.activeElement.click();
				break;
			case "Escape":
				e.preventDefault();
				datePicker.hide();
				break;
			default:
				break;
		}
	});

	// Handle month-year navigation buttons
	const picker = container.querySelector(".month-year-picker");
	picker.addEventListener("click", (e) => {
		if (e.target.matches('button[data-action="prev-month"]')) {
			changeMonth(container, -1);
		}
		if (e.target.matches('button[data-action="next-month"]')) {
			changeMonth(container, 1);
		}
	});
}

function changeMonth(container, delta) {
	const picker = container.querySelector(".month-year-picker");
	const display = picker.querySelector('[data-display="month-year"]');
	const [month, year] = display.textContent.split(" ");

	const currentDate = new Date(`${month} 1, ${year}`);
	currentDate.setMonth(currentDate.getMonth() + delta);

	renderCalendar(container, currentDate);
}
