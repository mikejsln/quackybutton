const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  recipes: {
    carbonara: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
    pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    'lava-cake': 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80'
  },
  avatars: {
    chef_mike: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
    pizza_master: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    sweet_tooth: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'
  }
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath);
        response.pipe(writeStream);
        writeStream.on('finish', () => {
          writeStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}`));
      }
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  // Create directories if they don't exist
  const dirs = ['public/recipes', 'public/avatars'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Download recipe images
  for (const [name, url] of Object.entries(images.recipes)) {
    const filepath = path.join('public/recipes', `${name}.jpg`);
    console.log(`Downloading ${name} recipe image...`);
    await downloadImage(url, filepath);
  }

  // Download avatar images
  for (const [name, url] of Object.entries(images.avatars)) {
    const filepath = path.join('public/avatars', `${name}.jpg`);
    console.log(`Downloading ${name} avatar image...`);
    await downloadImage(url, filepath);
  }

  console.log('All images downloaded successfully!');
}

downloadAllImages().catch(console.error); 