// 1. Function to find average of even numbers in an array.
// 2. Remove duplicate even numbers without inbuilt methods and with inbuilt methods.
// 3. Remove an array element without inbuilt methods and with inbuilt methods.

let arr = [2,4,3,6,2,5,7,9,8];
let unique = []
let free = {}


for(let i = 0; i < arr.length; i++){
    free[arr[i]] = (free[arr[i]] || 0)+1
}
for(let j = 0; j < arr.length; j++){
    if (arr[j] % 2 == 0 && free[arr[j]] < 2) {
        unique.push(arr[j])
    }
}

console.log(unique)