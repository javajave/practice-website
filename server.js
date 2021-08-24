const express = require('express')
const app = express()
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const initializePassport = require("./passportConfig");
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const csrfProtection = csrf({ cookie: true });

app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
initializePassport(passport);

app.set("view engine", "ejs"); //set the ejs as the view engine value

app.use(
    session({
        secret: 'Hello_Moti',
        resave: false,
        saveUninitialized: true,
        cookie : {
   sameSite: 'lax'          // controls when cookies are sent //xsrf protection
        }
    })
);

app.use(flash());
app.use(express.static('public')); // for bashboard.js
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection); //requires inspection of the csrf

            //****\\

app.get('/', (req, res) => {
    res.render('index', { csrfToken: req.csrfToken() });
    console.log(req.query.id);
})

app.get ('/register', checkAuthenticated, (req, res) => {
    res.render("register", { csrfToken: req.csrfToken() });
});

app.get ('/login', checkAuthenticated, (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
});

app.get ('/dashboard', checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.name, csrfToken: req.csrfToken() }); //set the name as a value in the user object 
});

app.get('/logout',(req,res)=>{
    req.session.destroy(function (err) {
      res.redirect('/login'); //Inside a callback… bulletproof!
     });
  })

// To enter information from the database into allfoods.ejs
var obj = {};
app.get('/allfoods', checkNotAuthenticated,(req, res) => {

    pool.query('SELECT * FROM food', function(err, result) {
        if(err){
            throw err;
        } else {
            res.render('allfoods', { user: req.user.name, members: result.rows, csrfToken: req.csrfToken() });  //set all resultes as a value in the members object               
        }
    });
});
    
            //****\\

app.post('/dashboard', async (req, res) => {
    let name 
    let food = req.body;
    name = { user: req.user.name};
    console.log({
        user: req.user.name,
        food,
    });
    let errors = [];

    if (!name || !food) {
        errors.push({ massage: "Pleas enter all fields" });
    }
        pool.query( 
            'SELECT * FROM food WHERE name = $1', // select all from food where name equal to the external var [name]
            [name.user],
            (err, results) => { 
                if (err) {
                    throw err;
                }

                console.log(results.rows); //display the results

                if(results.rows.length > 0){ // length > 0 --> there is a results
                    pool.query(
                        'UPDATE food SET food=$2 WHERE name = $1', // replaces the new food with the old food, according to the username
                        [name.user, food.food], (err, results)=>{
                            if (err){
                                throw err;
                            }
                            res.redirect('/allfoods');
                        }
                    );
                }else{ //no user in database -->  enter the results
                    pool.query(            
                        'INSERT INTO food (name, food) VALUES ($1, $2)', // insert the external variables into name&food colems in food table
                        [name.user, food.food], (err, results)=>{
                            if (err){
                                throw err;
                            }
                        res.redirect('/allfoods'); 
                        }
                    );
                }
            }           
        ); 
});

app.post('/allfoods', async (req, res) => {
    let name 
    let food = req.body;
    name = { user: req.user.name};
    console.log({
        user: req.user.name,
        food,
    });
    let errors = [];

    if (!name || !food) {
        errors.push({ massage: "Pleas enter all fields" });
    }
        pool.query( 
            'SELECT * FROM food WHERE name = $1', // select all from food where name equal to the external var [name]
            [name.user],
            (err, results) => { 
                if (err) {
                    throw err;
                }

                console.log(results.rows); //display the results

                if(results.rows.length > 0){ // length > 0 --> there is a results
                    pool.query(
                        'UPDATE food SET food=$2 WHERE name = $1', // replaces the new food with the old food, according to the username
                        [name.user, food.food], (err, results)=>{
                            if (err){
                                throw err;
                            }
                            pool.query('SELECT * FROM food', function(err, result) {
                                if(err){
                                    throw err;
                                } else {
                                    res.render('allfoods', { user: req.user.name, members: result.rows, csrfToken: req.csrfToken() });  //set all resultes as a value in the members object               
                                }
                            });
                        }
                    );
                }else{ //no user in database -->  enter the results
                    pool.query(            
                        'INSERT INTO food (name, food) VALUES ($1, $2)', // insert the external variables into name&food colems in food table
                        [name.user, food.food], (err, results)=>{
                            if (err){
                                throw err;
                            }
                            pool.query('SELECT * FROM food', function(err, result) {
                                if(err){
                                    throw err;
                                } else {
                                    res.render('allfoods', { user: req.user.name, members: result.rows, csrfToken: req.csrfToken() });  //set all resultes as a value in the members object               
                                }
                            }); 
                        }
                    );
                }
            }           
        ); 
});


app.post('/register', async (req, res) => {
    let { name, email, password, password2 } = req.body;
    console.log({
        name,
        email,
        password,
        password2
    });

    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ massage: "Pleas enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ massage: "Password shoule be at least 6 characters" });
    }

    if (password != password2) {
        errors.push({ massage: "Password do not match" });
    }
 
    if (errors.length > 0) {
        res.render('register', { errors });
    } else {                
        //bcrypt is a password-hashing function
        //insert asalt //considered slow
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query( 
            'SELECT * FROM users WHERE email = $1', // select all from users where email equal to the external var [email]
            [email],
            (err, results) => { 
                if (err) { 
                    throw err;
                }
                console.log(results.rows);  //display the results

                if(results.rows.length > 0){ // length > 0 --> there is a results
                    errors.push({message: "Email already registered"});
                    res.render('register', { errors });
                }else{ 
                    pool.query(
                        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password',
                        [name, email, hashedPassword], (err, results)=>{ // insert external values
                            if (err){
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash('seccess_msg', "You are mow registered. Please log in");
                            res.redirect("/login");
                        }
                    );
                }
            }
            
        );
    }

});



app.post("/login", passport.authenticate("local", {// check for error messages in the initialize finction in passportConfig.js
        successRedirect: '/dashboard',
        failureRedirect: "/login",
        failureFlash: true
}));

            //****\\

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
    next();
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
 }

app.listen(PORT, ()=>{
    console.log('server running on port '+PORT); 
});
 

