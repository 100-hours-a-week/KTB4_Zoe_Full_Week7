/** 1000 -> 1k로 변환해주는 함수 */
export function countFormat(number){
    if (number < 1000) return number;
    const formattedNum = Math.floor(number/1000);
    console.log(formattedNum);
    return `${formattedNum}k`
}