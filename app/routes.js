/*eslint-env node */
var Report = require('../app/models/report');
var User = require('../app/models/user');
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get('/doctor', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('doctor.ejs', { message: req.flash('doctorForm') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    /*app.post('/doctor', passport.authenticate('local-doctor', {
        successRedirect : '/doctor', // redirect to the secure profile section
    }));*/
    app.post('/doctor', function(req,res,done) {
      var newReport = new Report();
      newReport.name = req.body.name;
      newReport.patientID = req.body.patientID;
      newReport.age = req.body.age;
      newReport.height = req.body.height;
      newReport.weight = req.body.weight;
      newReport.symptoms = req.body.symptoms;
      newReport.medicines = req.body.medicines;
      newReport.diagnosis = req.body.diagnosis;
      newReport.created_at = Date();

      newReport.save(function(err) {
        if (err)
          throw err;
        return done(null,newReport);
      });
      //newReport.save;
      User.findOne({ 'local.userID' :  req.body.patientID }, function(err, user) {
            //if there are any errors, return the error
                if (err) {
                    return done(err);
            }

            // check to see if theres already a user with that ID
            if (user) {
                console.log(newReport._id);
                console.log(user.local.userID);
                user.local.reportID.push(newReport._id);
                user.save(function(err) {
                  if (err)
                    throw err;
                  return done(null,user);
                });

            } else {
                //Delete the report object created if Patient is not found.
            }
        });
      //res.status(200).end();
      //successRedirect : '/doctor' // redirect to the secure profile section
      res.render('doctor.ejs', { message: req.flash('doctorForm') });

    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
       res.render('profile.ejs', {
           user : req.user // get the user out of session and pass to template
       });
    });

   /*app.get('/profile', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('profile.ejs', { message: req.flash('signupMessage') });
    });*/


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
