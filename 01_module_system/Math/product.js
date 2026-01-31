function product(...numbers) {
  return numbers.reduce((acc, curr) => acc * curr);
}

module.exports = product;
