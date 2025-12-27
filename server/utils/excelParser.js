const ExcelJS = require('exceljs');
const moment = require('moment');
const { getExpectedHours, calculateWorkedHours, getAttendanceStatus } = require('./workingHours');

const parseExcelFile = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const attendanceData = [];

    // Skip header row, start from row 2
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const employeeName = row.getCell(1).value;
      const dateValue = row.getCell(2).value;
      const inTime = row.getCell(3).value;
      const outTime = row.getCell(4).value;

      if (!employeeName || !dateValue) return;

      // Parse date - handle various formats
      let date;
      if (dateValue instanceof Date) {
        date = moment(dateValue);
      } else if (typeof dateValue === 'string') {
        date = moment(dateValue, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY', 'MM-DD-YYYY']);
      } else if (typeof dateValue === 'number') {
        // Handle Excel serial date numbers
        date = moment(new Date((dateValue - 25569) * 86400 * 1000));
      } else {
        return; // Skip invalid dates
      }

      if (!date.isValid()) return;

      const expectedHours = getExpectedHours(date.toDate());

      // Convert time values to string format - handle various time formats
      let inTimeStr = null;
      let outTimeStr = null;

      if (inTime) {
        if (typeof inTime === 'string') {
          inTimeStr = inTime;
        } else if (inTime instanceof Date) {
          inTimeStr = moment(inTime).format('HH:mm');
        } else if (typeof inTime === 'number') {
          // Handle Excel time serial numbers (fraction of a day)
          const hours = Math.floor(inTime * 24);
          const minutes = Math.floor((inTime * 24 * 60) % 60);
          inTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }

      if (outTime) {
        if (typeof outTime === 'string') {
          outTimeStr = outTime;
        } else if (outTime instanceof Date) {
          outTimeStr = moment(outTime).format('HH:mm');
        } else if (typeof outTime === 'number') {
          // Handle Excel time serial numbers (fraction of a day)
          const hours = Math.floor(outTime * 24);
          const minutes = Math.floor((outTime * 24 * 60) % 60);
          outTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }

      const workedHours = calculateWorkedHours(inTimeStr, outTimeStr);
      const status = getAttendanceStatus(inTimeStr, outTimeStr, expectedHours, workedHours);

      attendanceData.push({
        employeeName: employeeName.toString().trim(),
        date: date.toDate(),
        inTime: inTimeStr,
        outTime: outTimeStr,
        workedHours,
        expectedHours,
        status
      });
    });

    return attendanceData;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

module.exports = { parseExcelFile };