import dayjs from "dayjs";

export function formatDateWithFormatStr(dateStr: string, format: string) {
  const dateFormatted = dayjs(dateStr).format(format);
  if (dateFormatted === "Invalid date") return "";
  return dateFormatted;
}

export function formatDateTime(value) {
  if (value) {
    return dayjs(String(value)).format("HH:mm DD-MM-YYYY");
  }
}

export const formatDate = (value, format = "DD/MM/YYYY") => {
  return value ? dayjs(value).format(format) : "";
};
