export const formatCurrency = (value) => {
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
