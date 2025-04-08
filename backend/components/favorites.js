const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

router.patch("/:id/favorite", async (req, res, next) => {
    try {
        const { id } = req.params;

        const game = await prisma.game.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        const updatedGame = await prisma.game.update({
            where: {
                id: parseInt(id)
            },
            data: {
                favorite: game.favorite === 1 ? 0 : 1
            },
        })

        res.json(updatedGame);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "failed to update game" })
    }
})

router.get("/favorites", async (req, res, next) => {
    try {
        const favoriteGames = await prisma.game.findMany({
            where: {
                favorite: 1
            }
        })

        res.send(favoriteGames);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "failed to fetch games" })
    }
})

module.exports = router;