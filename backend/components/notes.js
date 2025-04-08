const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

router.post('/:gameId/notes', async (req, res, next) => {
    const { gameId } = req.params;
    const { content } = req.body;

    try {
        const game = await prisma.game.findUnique({
            where: {
                id: parseInt(gameId)
            }
        })

        const note = await prisma.note.create({
            data: {
                gameId: parseInt(gameId),
                content: JSON.stringify(content),
            }
        })

        res.status(201).json(note);
    } catch (error) {
        console.error("error saving note", error);
        res.status(500).json({ error: 'failed to save note' })
    }
})

router.get("/:gameId/notes", async (req, res, next) => {
    const { gameId } = req.params;

    if (!gameId || isNaN(parseInt(gameId))) {
        return res.status(400).json({error: "invalid or missing gameId"})
    }

    try {
        const notes = await prisma.note.findMany({
            where: {
                gameId: parseInt(gameId),
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const parsedNotes = notes.map((note) => ({
            ...note,
            content: JSON.parse(note.content),
        }));

        res.status(200).json(parsedNotes);
    } catch (error) {
        console.error("error fetching notes:", error);
        next(error);
    }
})

module.exports = router;