const passport = require('passport');
const auth = require('./auth.js');

module.exports = function (app, myDataBase) {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/');
      };

  // Be sure to change the title
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });
  app.route('/auth/github/callback').get(passport.authenticate('github',{ failureRedirect: '/', }),(req, res) => {

    res.redirect('/profile');
  });

   app.route('/auth/github').get(passport.authenticate('github',{ failureRedirect: '/', }),(req, res) => {

 
  }); 
  app.route('/register')
  .post((req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.route('/login').post(passport.authenticate('local',{ failureRedirect: '/', }),(req, res) => {
    
    if (!bcrypt.compareSync(req.body.password, req.user.password)) { 
      return done(null, false);
    }
    // Change the response to render the Pug template
    res.redirect('/profile');
  });

  app.route('/profile').get(ensureAuthenticated,(req, res) => {
    // Change the response to render the Pug template
    res.render('profile', { username : req.user.username });
  });

  app.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
});

app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

}