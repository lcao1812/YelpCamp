const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const Campground = require('./models/campground')

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

const app = express();
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

/* HOME -> "/"  */
app.get('/', (req, res) => {
    res.render('home', { title: 'Yelp Camp' });
})

/* INDEX -> "/campgrounds" */
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { title: 'Index', campgrounds });
})

/* CREATE */
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', { title: 'New campground' });
})

app.post('/campgrounds', async (req, res) => {
    const { title, location } = req.body.campground;
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

/* SHOW -> "/campgrounds/<id>" */
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { title: `${campground.title}`, campground });
})

/* EDIT -> "/campgrounds/<id>/edit" */
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { title: `${campground.title}`, campground });
})

app.put('/campgrounds/:id', async (req, res) => {

    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})

/* DELETE -> "/campgrounds/<id>" */
app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds')
})

app.listen(3000, function () {
    console.log("SERVING ON PORT 3000");
})