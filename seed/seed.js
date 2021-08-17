const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');


mongoose.connect('mongodb://localhost:27017/YelpCamp', {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', () => {
    console.log('Database connected');
})

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];


const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        let rand = Math.floor(Math.random() * 1000)
        const c = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            // price:,
            // description:,
            location: `${cities[rand].city}, ${cities[rand].state}`
        });
        await c.save();
    }

}

seedDB().then(() => {
    db.close();
});