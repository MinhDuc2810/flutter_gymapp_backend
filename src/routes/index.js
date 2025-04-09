
const authRouter = require('./auth');
const adminRouter = require('./admin');
const userRouter = require('./user');
function route(app) {

   app.use('/user', userRouter);
   app.use('/admin', adminRouter);
   app.use('/auth', authRouter);
  


}

module.exports = route;