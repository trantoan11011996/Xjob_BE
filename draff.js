// const a = new Date();
// console.log(a);
// console.log(typeof a.toISOString());
// console.log(a.toUTCString());
// console.log(a.toLocaleDateString());
// console.log(a.toLocaleString());

// const a = new Date(2022, 11, 22);
// const b = new Date(2022, 11, 30);
// console.log(a.toLocaleDateString(), b.toLocaleDateString());

// console.log(1);
// const a = () => {
//   console.log("a");
//   setTimeout(() => {
//     b();
//   }, 500);
//   console.log("a lan 2");
// };
// const b = () => {
//   console.log("b");
// };
// a();
// console.log(4);

// const a = new Date(2022, 10, 30);
// const b = "11/30/2022";
// const obj = {
//   status: "active",
//   startAt: a.toLocaleDateString(),
//   deadline: b,
// };
// const check = () => {
//   const today = new Date();
//   if (b == today.toLocaleDateString()) {
//     obj.status = "disable";
//   } else {
//     return;
//   }
// };
// check();
// console.log(obj);

const a = new Date(2022, 11, 11).toLocaleDateString();
const b = new Date(2022, 11, 11).toLocaleDateString();
console.log(a);
console.log(b);
console.log(a === b);
