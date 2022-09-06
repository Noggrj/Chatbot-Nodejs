const app = require('./app.js');
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`🔥 Server is up and running on port ${port}!`);
})
