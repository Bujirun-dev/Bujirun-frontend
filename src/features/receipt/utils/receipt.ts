export const formatDateWithDots = (date: string) => date.replaceAll("-", ".");

export const calculateTotalDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const createArchiveNumber = (startDate: string, tripOrder: number) => {
  return `BR-${startDate.replaceAll("-", "")}-${String(tripOrder).padStart(3, "0")}`;
};

export const createBarcode = (startDate: string, endDate: string) => {
  return `${startDate.replaceAll("-", "")}${endDate.replaceAll("-", "")}`;
};
