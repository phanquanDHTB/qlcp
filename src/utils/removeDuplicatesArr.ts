export function removeDuplicates(arr: any[], key?: any) {
  key = key ?? 'value';
  const map: any = new Map();

  arr.forEach((v: any) => {
    if (typeof v === 'object') {
      map.set(v[key], v);
    } else {
      map.set(v, v);
    }
  });

  return [...map.values()];
}

// Hàm isEqual kiểm tra sự bằng nhau giữa hai object
function isEqual(obj1, obj2) {
  // Kiểm tra từng thuộc tính của object
  for (const prop in obj1) {
    if (obj1.hasOwnProperty(prop) && obj2.hasOwnProperty(prop)) {
      if (obj1[prop] !== obj2[prop]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
