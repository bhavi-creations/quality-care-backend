const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require("passport");
const cookieSession = require("cookie-session");
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors package
require('dotenv').config();

// const beautyRoutes = require('./routes/beautyRoutes');
// const BabycareRoutes = require('./routes/BabycareRoutes');
// const foodRoutes = require('./routes/foodRoutes');
// const cleaningRoutes = require('./routes/cleaningRoutes');
// const healthRoutes = require('./routes/healthRoutes');
// const stationeryRoutes = require('./routes/stationeryRoutes');
// const greenPackaging = require('./routes/greenPackaging');
const categoryRoutes = require('./routes/categories');
const loginRoutes = require('./routes/login');
const subadminRoutes = require('./routes/subadmin');
const authRoutes = require('./routes/authRoutes');
const subCategoryRoutes = require('./routes/subcategories');
const productsRoutes = require('./routes/products');
const googleRoute = require("./routes/googleAuth");
const brandsRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRatingRoutes = require('./routes/productRatingRoutes');
const blogRoutes = require('./routes/blogRoutes');
const queryRoutes = require('./routes/queryRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const enquiryRoutes = require('./routes/enquiries');
const keyFactsRoutes = require('./routes/keyFactsRoutes');
const featureRoutes = require('./routes/featureRoutes');
const searchRoutes = require('./routes/searchRoutes');
const standeredOfferRoutes = require('./routes/offerRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const generalComments = require('./routes/generalComments');
const basicVichaarRoutes = require('./routes/basicVichaarRoutes');
const clinical_bio_chemistry = require('./routes/clinical_bio_chemistry');
const app = express();
const PORT = process.env.PORT || 3009;
const passportStrategy = require("./passport");

app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/googleauth", googleRoute);


// app.use(session({
//   secret: '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', // Change this to a random secret key
//   resave: false,
//   saveUninitialized: false
// }));

app.use(express.json());
app.use(cors());

app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/plugins', express.static(path.join(__dirname, '..', 'public', 'plugins')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/img', express.static(path.join(__dirname, '..', 'public', 'img')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.get('/js/script.js', function (req, res) {
  if (req.session.user)
    res.sendFile(__dirname + '/public/js/script.js');
});


// Allow direct access to the logo.svg file
app.get('/img/svg/logo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'img', 'svg', 'logo.svg'));
});
app.use('/api/auth', authRoutes);

function requireAuth(req, res, next) {
  if (!req.session.user && !(req.path === '/login' || req.path === '/signup' || req.path.startsWith('/api'))) {
    return res.redirect('/login');
  }
  next();
}

// Apply requireAuth middleware to every route except login and signup
app.use((req, res, next) => {
  // console.log(req.path);
  // if (req.path === '/login' || req.path === '/signup' || req.path.startsWith('/api')) {
  //   return next(); // Skip authentication check for login, signup, and login route in authRoutes
  // }
  requireAuth(req, res, next); // Apply requireAuth middleware for all other routes
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use('/api/beauty', beautyRoutes);
// app.use('/api/Babycare', BabycareRoutes);
// app.use('/api/cleaning', cleaningRoutes);
// app.use('/api/food', foodRoutes);
// app.use('/api/greenpackaging', greenPackaging);
// app.use('/api/health', healthRoutes);
// app.use('/api/stationery', stationeryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/user', loginRoutes);
app.use('/api/subadmin', subadminRoutes);
app.use('/api/recipies', recipeRoutes);
app.use('/api/sub-category', subCategoryRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product-ratings', productRatingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/basicVichaar', basicVichaarRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/keyfacts', keyFactsRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/generalComments', generalComments);
app.use('/api/search', searchRoutes);
app.use('/api/standarded-offers', standeredOfferRoutes);
app.use('api/clinical_bio_chemistry', clinical_bio_chemistry);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


app.get('/clinical_bio_chemistry', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/clinical_bio_chemistry.html'));
});
app.get('/hematology', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/hematology.html'));
});
app.get('/immunology_serology', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/immunology_serology.html'));
});
app.get('/molecular_biology', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/molecular_biology.html'));
});
app.get('/microbiology', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/microbiology.html'));
});
app.get('/histopathology_cytology', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/histopathology_cytology.html'));
});

app.get('/add-services', (req, res) => {
  // if (req.session?.user?.vendorID) {
    res.sendFile(path.join(__dirname, '..', 'public', '/add-services.html'));
  // }
  // else {
  //   res.sendFile(path.join(__dirname, '..', 'public', '/add-services-admin.html'));
  // }
});








app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'signin.html'));
});

app.get('/brands', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/brands.html'));
});

app.get('/home/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home-page.html'));
});

app.get('/blogs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'blogs.html'));
});

app.get('/newproducts/:type/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'products-new.html'));
});

app.get('/add-blogs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'add-blog.html'));
});

app.get('/basic-vichaar', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'basic-vichaar.html'));
});

app.get('/add-basic-vichaar', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'add-basic-vichaar.html'));
});

app.get('/recipies', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'recipies.html'));
});

app.get('/home-main-categories/:id/:type', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home-main-categories.html'));
});

app.get('/add-recipe', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'add-recipe.html'));
});

app.get('/edit-recipe/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'edit-recipe.html'));
});

app.get('/edit-basic-vichaar/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'edit-basic-vichaar.html'));
});

app.get('/queries', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'queries.html'));
});

app.get('/edit-blogs/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'edit-blog.html'));
});

app.get('/add-brand', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'add-brand.html'));
});

app.get('/header', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/header.html'));
});

app.get('/products/:mcId/:productId', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-rating.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/orders.html'));
});

app.get('/access/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/admin-access.html'));
});

app.get('/sidebar', (req, res) => {
  if (req.session.user?.vendorID) {
    res.sendFile(path.join(__dirname, '..', 'public', '/sub-admin-sider.html'));
  }
  else {
    res.sendFile(path.join(__dirname, '..', 'public', '/sidebar.html'));
  }
});

app.get('/add-main-category', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-main-catagory.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/profile.html'));
});


app.get('/add-product/:type', (req, res) => {
  if (req.session?.user?.vendorID) {
    res.sendFile(path.join(__dirname, '..', 'public', '/add-product.html'));
  }
  else {
    res.sendFile(path.join(__dirname, '..', 'public', '/add-product-admin.html'));
  }
});

app.get('/add-key-fact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-key-fact.html'));
});

app.get('/edit-key-fact/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-key-fact.html'));
});

app.get('/keyfacts', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/keyfacts.html'));
});

app.get('/add-feature', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-feature.html'));
});

app.get('/edit-feature/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-feature.html'));
});

app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/features.html'));
});

app.get('/add-sub-category', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-sub-category.html'));
});

app.get('/edit-brand/:id', (req, res) => {
  const id = req.params.id;
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-brand.html'));
});

app.get('/clinical_bio_chemistry', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/clinical_bio_chemistry.html'));
});

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/users.html'));
});

app.get('/add-user', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-user.html'));
});

app.get('/edit-user/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-user.html'));
});

app.get('/admin-users', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/admin-users.html'));
});

app.get('/add-admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/add-admin.html'));
});

app.get('/edit-admin/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-admin.html'));
});

app.get('/edit-product/:type/:id', (req, res) => {
  if (req.session?.user?.vendorID) {
    const id = req.params.id;
    res.sendFile(path.join(__dirname, '..', 'public', '/edit-product.html'));
  }
  else {
    res.sendFile(path.join(__dirname, '..', 'public', '/edit-product-admin.html'));
  }
});

app.get('/edit-main-category/:id', (req, res) => {
  const id = req.params.id;
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-main-category.html'));
});

app.get('/edit-sub-category/:id', (req, res) => {
  const id = req.params.id;
  res.sendFile(path.join(__dirname, '..', 'public', '/edit-sub-category.html'));
});

app.get('/main-category', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/main_category.html'));
});

app.get('/standard-offer', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/standard-offer.html'));
});

app.get('/products/:type', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', '/products.html'));
});

app.get('/sub-category', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'sub_category.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
