#!/usr/bin/env node

// Test script to verify the feed position logic
function testFeedPositionLogic() {
  console.log('Testing feed position recalculation logic...\n');

  // Simulate the scenario
  const previouslyServedHashes = ['A', 'B', 'C'];
  const newSortedTransactions = [
    { hash: 'A', block: 100 },  // pos 0 - was served
    { hash: 'X', block: 99 },   // pos 1 - new transaction
    { hash: 'Y', block: 98 },   // pos 2 - new transaction  
    { hash: 'B', block: 97 },   // pos 3 - was served
    { hash: 'Z', block: 96 },   // pos 4 - new transaction
    { hash: 'C', block: 95 },   // pos 5 - was served
    { hash: 'W', block: 94 }    // pos 6 - new transaction
  ];

  console.log('Previously served hashes:', previouslyServedHashes);
  console.log('New sorted order:');
  newSortedTransactions.forEach((t, i) => {
    console.log(`  ${i}: ${t.hash} (block ${t.block}) - ${previouslyServedHashes.includes(t.hash) ? 'WAS SERVED' : 'new'}`);
  });

  // Old logic (broken)
  let oldFeedPosition = 0;
  for (let i = 0; i < newSortedTransactions.length; i++) {
    const currentHash = newSortedTransactions[i].hash;
    if (previouslyServedHashes.includes(currentHash)) {
      oldFeedPosition = i + 1;
    } else {
      // Once we hit a transaction that wasn't previously served, stop
      break;
    }
  }

  // New logic (fixed)
  let newFeedPosition = 0;
  let servedCount = 0;
  
  for (let i = 0; i < newSortedTransactions.length; i++) {
    const currentHash = newSortedTransactions[i].hash;
    if (previouslyServedHashes.includes(currentHash)) {
      servedCount++;
      newFeedPosition = i + 1;
    }
    
    // Stop when we've found all previously served transactions
    if (servedCount >= previouslyServedHashes.length) {
      break;
    }
  }

  console.log('\nResults:');
  console.log(`Old logic (broken): feedPosition = ${oldFeedPosition}`);
  console.log(`New logic (fixed):  feedPosition = ${newFeedPosition}`);
  console.log('\nExpected: feedPosition should be 6 (after A, X, Y, B, Z, C)');
  console.log(`Old logic result: ${oldFeedPosition === 6 ? 'CORRECT' : 'WRONG'}`);
  console.log(`New logic result: ${newFeedPosition === 6 ? 'CORRECT' : 'WRONG'}`);
}

testFeedPositionLogic();
