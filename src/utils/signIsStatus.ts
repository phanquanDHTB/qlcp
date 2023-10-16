export const statusHandle = (status: number | undefined) => {
    switch (status) {
      case 0:
        return 'Chờ phê duyệt';
      case 4:
        return 'Đã phê duyệt';
      case 5:
        return 'Từ chối phê duyệt';
      case 6:
        return 'Kế toán từ chối';
      default:
        return '--';
    }
  };