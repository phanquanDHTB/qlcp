export default function createArray(N: number, startAt: number){
	return [...Array((N) + 1).keys()].slice(startAt)
}