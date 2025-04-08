const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());


router.get('/games', async (req, res, next) => {
    try {
        const games = await prisma.game.findMany();
        res.send(games);
    } catch (error) {
        next(error);
    }
})

router.post('/games', async (req, res, next) => {
    try {
        const game = await prisma.game.create({
            data: {
                title: req.body.title,
            }
        })

        res.status(201).send(game);
    } catch (error) {
        next(error);
    }
})

router.delete('/games/:id', async (req, res, next) => {
    let { id } = req.params;
    id = Number(id)

    try {
        const game = await prisma.game.findUnique({
            where: {
                id
            }
        })

        if (!game) {
            console.log("game not found:", id);
            return res.status(404).json({ message: "game not found"})
        }

        const deletedGame= await prisma.game.delete({
            where: {
                id
            }
        })

        console.log("game deleted successfully", deletedGame)
        res.status(204).send(game);
    } catch (error) {
        console.error("error deleting game:", error)
        res.status(500).json({message: "error deleting game", error: error.message})
    }
})

module.exports = router;