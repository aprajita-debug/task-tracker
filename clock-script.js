// Digital Clock Manager
class ClockManager {
    constructor() {
        this.timezones = this.loadTimezones();
        this.is24HourFormat = localStorage.getItem('is24HourFormat') !== 'false';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderClocks();
        this.startClockUpdate();
        this.updateFormatToggle();
    }

    setupEventListeners() {
        // Add timezone button
        document.getElementById('addTimezoneBtn').addEventListener('click', () => this.addTimezone());

        // Enter key to add timezone
        document.getElementById('timezoneSelect').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTimezone();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllTimezones());

        // Format toggle
        document.getElementById('format24h').addEventListener('change', (e) => {
            this.is24HourFormat = e.target.checked;
            localStorage.setItem('is24HourFormat', this.is24HourFormat);
            this.updateAllClocks();
        });
    }

    addTimezone() {
        const select = document.getElementById('timezoneSelect');
        const timezone = select.value.trim();

        if (!timezone) {
            alert('Please select a time zone!');
            return;
        }

        if (this.timezones.includes(timezone)) {
            alert('This time zone is already added!');
            return;
        }

        this.timezones.push(timezone);
        this.saveTimezones();
        select.value = '';
        this.renderClocks();
    }

    addQuickTimezone(timezone) {
        if (this.timezones.includes(timezone)) {
            alert('This time zone is already added!');
            return;
        }

        this.timezones.push(timezone);
        this.saveTimezones();
        this.renderClocks();
    }

    removeTimezone(timezone) {
        this.timezones = this.timezones.filter((tz) => tz !== timezone);
        this.saveTimezones();
        this.renderClocks();
    }

    clearAllTimezones() {
        if (this.timezones.length === 0) {
            alert('No time zones to clear!');
            return;
        }

        if (confirm('Are you sure you want to clear all time zones?')) {
            this.timezones = [];
            this.saveTimezones();
            this.renderClocks();
        }
    }

    getTimeInTimezone(timezone) {
        const now = new Date();
        const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const offset = (tzTime - utcTime) / 3600000;

        return {
            time: tzTime,
            offset: offset,
        };
    }

    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        if (this.is24HourFormat) {
            return `${hours}:${minutes}:${seconds}`;
        } else {
            let displayHours = date.getHours() % 12;
            displayHours = displayHours === 0 ? 12 : displayHours;
            const period = date.getHours() >= 12 ? 'PM' : 'AM';
            return {
                time: `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds}`,
                period: period,
            };
        }
    }

    getTimezoneDisplayName(timezone) {
        // Extract the city name from the timezone string
        const parts = timezone.split('/');
        return parts[parts.length - 1].replace(/_/g, ' ');
    }

    formatOffset(offset) {
        const sign = offset >= 0 ? '+' : '-';
        const absOffset = Math.abs(offset);
        const hours = Math.floor(absOffset);
        const minutes = Math.round((absOffset - hours) * 60);
        return `UTC ${sign}${hours}:${String(minutes).padStart(2, '0')}`;
    }

    renderClocks() {
        const clocksGrid = document.getElementById('clocksGrid');
        const emptyState = document.getElementById('emptyClocks');
        const selectedContainer = document.getElementById('selectedTimezones');

        clocksGrid.innerHTML = '';
        selectedContainer.innerHTML = '';

        if (this.timezones.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Render selected timezone tags
        this.timezones.forEach((timezone) => {
            const tag = document.createElement('span');
            tag.className = 'timezone-tag';
            tag.innerHTML = `
                ${this.getTimezoneDisplayName(timezone)}
                <button onclick="clockManager.removeTimezone('${timezone}')">✕</button>
            `;
            selectedContainer.appendChild(tag);
        });

        // Render clock cards
        this.timezones.forEach((timezone) => {
            const tzData = this.getTimeInTimezone(timezone);
            const timeFormatted = this.formatTime(tzData.time);
            const displayName = this.getTimezoneDisplayName(timezone);
            const offsetStr = this.formatOffset(tzData.offset);
            const dateStr = tzData.time.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const clockCard = document.createElement('div');
            clockCard.className = 'clock-card';
            clockCard.id = `clock-${timezone}`;

            if (this.is24HourFormat) {
                clockCard.innerHTML = `
                    <div class="timezone-name">
                        <span>${displayName}</span>
                        <span class="timezone-offset">${offsetStr}</span>
                    </div>
                    <div class="digital-clock" id="time-${timezone}">${timeFormatted}</div>
                    <div class="clock-details">
                        <div class="date-display">${dateStr}</div>
                    </div>
                    <button class="remove-clock" onclick="clockManager.removeTimezone('${timezone}')">Remove</button>
                `;
            } else {
                clockCard.innerHTML = `
                    <div class="timezone-name">
                        <span>${displayName}</span>
                        <span class="timezone-offset">${offsetStr}</span>
                    </div>
                    <div class="digital-clock" id="time-${timezone}">${timeFormatted.time}</div>
                    <div class="clock-period">${timeFormatted.period}</div>
                    <div class="clock-details">
                        <div class="date-display">${dateStr}</div>
                    </div>
                    <button class="remove-clock" onclick="clockManager.removeTimezone('${timezone}')">Remove</button>
                `;
            }

            clocksGrid.appendChild(clockCard);
        });
    }

    updateAllClocks() {
        this.timezones.forEach((timezone) => {
            this.updateClock(timezone);
        });
    }

    updateClock(timezone) {
        const timeElement = document.getElementById(`time-${timezone}`);
        const clockCard = document.getElementById(`clock-${timezone}`);

        if (!timeElement || !clockCard) return;

        const tzData = this.getTimeInTimezone(timezone);
        const timeFormatted = this.formatTime(tzData.time);

        if (this.is24HourFormat) {
            timeElement.textContent = timeFormatted;
        } else {
            timeElement.textContent = timeFormatted.time;
            const periodElement = clockCard.querySelector('.clock-period');
            if (periodElement) {
                periodElement.textContent = timeFormatted.period;
            }
        }
    }

    startClockUpdate() {
        // Update clocks every second
        setInterval(() => {
            this.updateAllClocks();
        }, 1000);
    }

    updateFormatToggle() {
        document.getElementById('format24h').checked = this.is24HourFormat;
    }

    saveTimezones() {
        localStorage.setItem('timezones', JSON.stringify(this.timezones));
    }

    loadTimezones() {
        const stored = localStorage.getItem('timezones');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize the clock manager
let clockManager;
document.addEventListener('DOMContentLoaded', () => {
    clockManager = new ClockManager();
});
