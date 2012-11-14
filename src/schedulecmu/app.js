var app = require('express').createServer();
app.get('/', function(req, res) {
  res.send('<script>alert(\"Hello from ScheduleCMU!\")</script>');
});
/* AppFog will pass the listen port as an env var called VCAP_APP_PORT */
app.listen(process.env.VCAP_APP_PORT || 3000);
