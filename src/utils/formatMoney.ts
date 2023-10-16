export default function (num: any) {
    num = !isNaN(parseInt(num)) ? String(num).split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 0
    return num
}