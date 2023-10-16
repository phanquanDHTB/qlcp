export default function (num: any) {
    num = !isNaN(parseInt(num)) ? String(num).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 0
    return num
}