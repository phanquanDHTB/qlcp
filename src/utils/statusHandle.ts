export const statusHandle = (status: any) => {
    switch (status) {
        case 1:
            return 'Khởi tạo'
        case 2:
            return 'Chờ phê duyệt'
        case 3:
            return 'Đã phê duyệt'
        case 4:
            return 'Từ chối phê duyệt'
        case 5:
            return 'Chờ xác nhận kết quả công tác'
        case 6:
            return 'Xác nhận kết quả công tác'
        case 7:
            return 'Chờ phê duyệt kết thúc công tác'
        case 8:
            return 'Kết thúc công tác'
        case 9:
            return 'Từ chối kết thúc công tác'
        case 10:
            return 'Hủy'
        default:
            return ''
    }
}