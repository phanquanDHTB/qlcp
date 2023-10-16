export function isGlobalPhoneNumber(number: any) {
	return /(84[3|5|7|8|9])+([0-9]{8,10})\b/g.test(number);
}