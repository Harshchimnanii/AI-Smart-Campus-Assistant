const https = require('https');

console.log("Fetching public IP address...");

https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const ip = JSON.parse(data).ip;
            console.log(`\nYour Public IP Address is: ${ip}`);
            console.log("Please make sure this IP is whitelisted in MongoDB Atlas or allow 0.0.0.0/0 (Anywhere).");
        } catch (e) {
            console.error("Error parsing IP response:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Error fetching IP:", err.message);
});
