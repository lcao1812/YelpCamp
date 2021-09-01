const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const { campgroundValidationSchema } = require('./schemas')

const Campground = require('./models/campground')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

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


const validateCampground = (req, res, next) => {

    let { error } = campgroundValidationSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400)
    }

    next();
}


/* HOME -> "/"  */
app.get('/', (req, res) => {
    res.render('home', { title: 'Yelp Camp' });
})

/* INDEX -> "/campgrounds" */
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { title: 'Index', campgrounds });
}))

/* CREATE */
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', { title: 'New campground' });
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

/* SHOW -> "/campgrounds/<id>" */
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { title: `${campground.title}`, campground });
}))

/* EDIT -> "/campgrounds/<id>/edit" */
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { title: `${campground.title}`, campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

/* DELETE -> "/campgrounds/<id>" */
app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    res.status(err.status).render('error', { title: "Error", err });
})

app.listen(3000, function () {
    console.log("SERVING ON PORT 3000");
})