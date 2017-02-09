const app = require('../server');
app.set('port', process.env.PORT || 3001);

app.listen(3001, () => {
  console.log('Api server listen port :', app.get('port'));
});