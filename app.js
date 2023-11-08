const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const morgan = require('morgan');

const AppError = require('./AppError');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected!');
});

const app = express();

//Setup for ejs view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//Morgan middleware
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.render('home');
});

//Start Testing
const verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === 'fishsticks') {
    next();
  }
  throw new AppError('Password Required!', 401);
};

app.get('/secret', verifyPassword, (req, res) => {
  res.send(
    'My Secret Is: Sometimes I wear headphones in public so i dont have to talk to anyone'
  );
});
app.get('/error', (req, res) => {
  chicken.fly();
});

app.get('/admin', (req, res) => {
  throw new AppError('You are not an Admin!', 403);
});
//End Testing

//All Campgrounds
app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

//Create-New Campground
app.get('/campgrounds/new', async (req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

//Read-Show Campground
app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground });
});

//Update-Edit Campground
app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});

//Delete Campground
app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});

app.use((err, req, res, next) => {
  const { status = 500, message = 'Something went wrong!' } = err;
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log('Serving on port: 3000');
});
