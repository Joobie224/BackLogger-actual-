const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const cors = require("cors");

app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }))


const games = require('./components/games')
const notes = require('./components/notes')
const favorites = require('./components/favorites')

app.use("/", games)
app.use("/games", notes)
app.use("/games", favorites)



app.listen(3000)