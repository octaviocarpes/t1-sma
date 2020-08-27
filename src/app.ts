console.time();
for (let index = 0; index < 1000; index++) {
  const num = Number(Math.random()).toFixed(10)
  // console.log(num)
}
console.timeEnd();
console.log(U(1,2))

function U(A, B): number {
  const num: number = parseFloat(Number(Math.random()).toFixed(10));
  return (B - A) * num + A;
}