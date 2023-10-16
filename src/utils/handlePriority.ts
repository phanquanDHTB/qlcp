export const handlePriority = (v: any) => {
    switch (v) {
        case 1:
            return 'Bình thường'
        case 2:
            return 'Khẩn'
        case 3:
            return 'Hỏa tốc'
        case 4:
            return 'Thượng khẩn'
        default: return ''
    }
}