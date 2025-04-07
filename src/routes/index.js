
const authRouter = require('./auth');
const adminRouter = require('./admin');
function route(app) {

   app.use('/admin', adminRouter);
   app.use('/auth', authRouter);


}

module.exports = route;