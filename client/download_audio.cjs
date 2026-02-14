const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Utilizing project dependency

// Ensure assets directory exists
const assetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const files = [
    {
        url: 'https://www.myinstants.com/media/sounds/jarvis-welcome-home-sir.mp3',
        dest: path.join(assetsDir, 'jarvis.mp3'),
        name: 'Jarvis Voice'
    },
    {
        url: 'https://www.myinstants.com/media/sounds/iron-man-suit-up.mp3',
        dest: path.join(assetsDir, 'suitup.mp3'),
        name: 'Suit Up SFX'
    }
];

const downloadFile = async (file) => {
    try {
        console.log(`Starting download: ${file.name}`);
        const response = await axios({
            method: 'get',
            url: file.url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(file.dest);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Successfully downloaded ${file.name}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading ${file.name}:`, error.message);
        throw error;
    }
};

(async () => {
    try {
        await Promise.all(files.map(downloadFile));
        console.log('All downloads completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Download process failed.', error);
        process.exit(1);
    }
})();
