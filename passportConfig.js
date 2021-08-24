const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport){
    const authenticatUser = (email, password, done) => {

        pool.query(
            'SELECT * FROM users WHERE email = $1', // select all from users where email equal to the external var [email]
            [email],
            (err, results) => {
                if(err) {
                    throw err;
                }
            
                console.log(results.rows);

                if (results.rows.length > 0){ // founed a user in db

                    const user = results.rows[0]; // the user var will become the user object that return from database
                    bcrypt.compare(password, user.password, (err, isMatch) => { // cmpare the pass from login to the pass of the object
                        if ( err ) {
                            throw err;
                        }
                        if ( isMatch ) {
                            return done(null, user); // reurn no err with the user
                        } else {
                            return done(null, false, {message: "Password or Email is not correct"}); 
                        }
                    });
                                    //"Password or Email" will prevent an attacker from knowing which one is not in the database
                    } else {
                    return done(null, false, {message: "Password or Email is not correct"});
                }
            }
        );
    };

    passport.use(
        new LocalStrategy(
            {
            usernameField: "email",
            passwordField: "password"
            },
        authenticatUser // הפונקציה הזאת או שתחזיר שקר או את פרטי המתשמש
        )
    );

    passport.serializeUser((user, done) => done(null, user.id)); // לוקח לי את המידע מבסיס הנתונים ומזין אותו בsession 
    passport.deserializeUser((id, done) =>{
        pool.query(
            'SELECT * FROM users WHERE id = $1', [id], (err, results) => { // לוקח את המידע מהסשאן ושולף לפי התז את המתשמש שלך
                if (err) {
                    throw err;
                }
                return done(null, results.rows[0]);
        });
    });
}


module.exports = initialize;