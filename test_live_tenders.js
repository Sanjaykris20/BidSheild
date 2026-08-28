async function testLiveTenders() {
  try {
    console.log("Fetching live tenders...");
    const res = await fetch('http://localhost:3000/api/tenders/live');
    const data = await res.json();
    console.log(`Success: ${data.success}`);
    if (data.tenders) {
      console.log(`Found ${data.tenders.length} tenders`);
      console.log(JSON.stringify(data.tenders.slice(0, 2), null, 2));
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error(err);
  }
}

testLiveTenders();
