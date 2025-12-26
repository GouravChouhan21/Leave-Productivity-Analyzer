const calculateProductivity = (actualHours, expectedHours) => {
  if (expectedHours === 0) return 100;
  return Math.round((actualHours / expectedHours) * 100);
};

const calculateEmployeeMetrics = (attendanceRecords) => {
  const totalExpected = attendanceRecords.reduce((sum, record) => sum + record.expectedHours, 0);
  const totalActual = attendanceRecords.reduce((sum, record) => sum + record.workedHours, 0);
  const totalLeaves = attendanceRecords.filter(record => record.status === 'Leave').length;

  return {
    totalExpectedHours: totalExpected,
    totalActualHours: totalActual,
    totalLeaves,
    productivity: calculateProductivity(totalActual, totalExpected)
  };
};

const calculateOrganizationMetrics = (employees, attendanceRecords) => {
  const totalEmployees = employees.length;
  const totalExpected = attendanceRecords.reduce((sum, record) => sum + record.expectedHours, 0);
  const totalActual = attendanceRecords.reduce((sum, record) => sum + record.workedHours, 0);
  const totalLeaves = attendanceRecords.filter(record => record.status === 'Leave').length;
  const totalAllowedLeaves = totalEmployees * 2; // 2 leaves per employee per month

  return {
    totalEmployees,
    totalExpectedHours: totalExpected,
    totalActualHours: totalActual,
    averageProductivity: calculateProductivity(totalActual, totalExpected),
    totalLeavesUsed: totalLeaves,
    totalAllowedLeaves
  };
};

module.exports = {
  calculateProductivity,
  calculateEmployeeMetrics,
  calculateOrganizationMetrics
};