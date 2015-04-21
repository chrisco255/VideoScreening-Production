'use strict';

console.log('NODE_ENV: '+ process.env.NODE_ENV);

if (process.env.NODE_ENV !== 'test') {
  console.log("Woops, you want NODE_ENV=test before you try this again!");
  process.exit(1);
}
