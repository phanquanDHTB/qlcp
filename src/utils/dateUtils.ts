// import dayjs from "dayjs-timezone";

// dayjs.tz.setDefault("Asia/Saigon");

// export const formatWithTzVN = (value) => {
//   return dayjs(String(value)).format("YYYY-MM-DD");
// };
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

export const formatWithTzVN = (value) => {
  return dayjs(String(value)).format("YYYY-MM-DD");
};
