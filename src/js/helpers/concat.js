export default (...args) => {
  return args
  	.slice(0, -1)
    .join('');
}
