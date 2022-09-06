const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const attendanceQueueRoutes = require('./api/routes/attendance/attendanceQueue')
const builderCommandsRoutes = require('./api/routes/builder/commands')
const contactsRoutes = require('./api/routes/contacts/info')
const repliesRoutes = require("./api/routes/replies/replies.js");
const ticketRoutes = require("./api/routes/tickets/ticket");

app.use("/attendance", attendanceQueueRoutes);
app.use('/builder', builderCommandsRoutes)
app.use('/contacts', contactsRoutes)
app.use("/replies", repliesRoutes);
app.use("/tickets", ticketRoutes);


app.get("/", (req, res) => {
    res.status(200).send({
        description: "General use API for the Take Blip's platform",
        version: "v0.0.3"
    });
})

module.exports = app
