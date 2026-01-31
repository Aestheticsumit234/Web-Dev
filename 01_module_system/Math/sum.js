function sum(...numbers) {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

module.exports = sum;
