export default function getMessageError(e: any) : string {
	return e?.response?.data?.message ?? 'Đã có lỗi xảy ra'
}