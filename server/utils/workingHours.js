const moment = require('moment');

const getExpectedHours = (date) => {
  const dayOfWeek = moment(date).format('dddd');

  switch (dayOfWeek) {
    case 'Monday':
    case 'Tuesday':
    case 'Wednesday':
    case 'Thursday':
    case 'Friday':
      return 8.5; // 10:00 AM - 6:30 PM
    case 'Saturday':
      return 4; // 10:00 AM - 2:00 PM
    case 'Sunday':
      return 0; // Off day
    default:
      return 0;
  }
};

const calculateWorkedHours = (inTime, outTime) => {
  if (!inTime || !outTime) return 0;

  const inMoment = moment(inTime, 'HH:mm');
  const outMoment = moment(outTime, 'HH:mm');

  if (!inMoment.isValid() || !outMoment.isValid()) return 0;

  let duration;

  // Handle overnight shifts (when out time is next day)
  if (outMoment.isBefore(inMoment)) {
    // Add 24 hours to out time for next day calculation
    const nextDayOutTime = outMoment.clone().add(1, 'day');
    duration = moment.duration(nextDayOutTime.diff(inMoment));
  } else {
    duration = moment.duration(outMoment.diff(inMoment));
  }

  return Math.max(0, Math.round(duration.asHours() * 10) / 10); // Round to 1 decimal place
};

const getAttendanceStatus = (inTime, outTime, expectedHours, workedHours) => {
  if (expectedHours === 0) return 'Present'; // Sunday

  if (!inTime || !outTime) return 'Leave';

  if (workedHours >= expectedHours * 0.8) return 'Present';

  return 'Partial';
};

module.exports = {
  getExpectedHours,
  calculateWorkedHours,
  getAttendanceStatus
};