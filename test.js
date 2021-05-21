function factorial1(n, accumulator) {
  if (n == 0) return accumulator;
  return factorial1(n - 1, n * accumulator);
}

function factorial(n) {
  return factorial1(n, 1);
}

console.log(factorial(5));
