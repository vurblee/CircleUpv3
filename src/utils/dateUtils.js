// dateUtils.js
export function formatDateString(isoString) {
    // 1. Guard clause: if the string is missing, return empty data
    if (!isoString) {
      return {
        day: "",
        monthName: "",
        timeString: "",
      };
    }
  
    // 2. Create a JavaScript Date object from the ISO string
    const dateObj = new Date(isoString); 
  
    // 3. Get the day of the month (1-31)
    const day = dateObj.getDate();
  
    // 4. Get the month name in uppercase, e.g. "JUNE"
    const monthName = dateObj
      .toLocaleString("default", { month: "long" })
      .toUpperCase();
  
    // 5. Get the local time with short timezone. Example: "10:56 PM EST"
    //    If you prefer 24-hour format, you can add hourCycle: 'h23'
    const timeString = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short", // yields "EST", "PST", etc.
    });
  
    // 6. Return the formatted parts
    return {
      day,
      monthName,
      timeString,
    };
  }
  