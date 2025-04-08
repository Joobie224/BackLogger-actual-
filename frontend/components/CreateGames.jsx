import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  List,
  ListItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Listt from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import SimpleImage from "@editorjs/simple-image";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const CreateGames = ({ games, setGames }) => {
  const [open, setOpen] = useState(false);
  const [gameName, setGameName] = useState("");

  const editorInstances = useRef({});

  const MyEditor = ({ gameId }) => {
    const editorRef = useRef(null);
    const [noteContent, setNoteContent] = useState(null);

    useEffect(() => {
      const holderId = `editorjs-${gameId}`;

      if (!editorRef.current) {
        const editor = new EditorJS({
          holder: holderId,
          tools: {
            header: Header,
            list: Listt,
            checklist: Checklist,
            simpleimage: SimpleImage,
          },
          onReady: () => {
            console.log("editorjs ready");
            fetchNoteData();
          },
          onChange: () => {
            console.log("editorjs edited");
          },
          placeholder:
            "Notes here! Add a simple image by copying an image and pasting here.",
        });
        editorInstances.current[gameId] = editor;
        editorRef.current = editor;
      }

      return () => {
        if (editorRef.current) {
          if (typeof editorRef.current.clear === "function") {
            editorRef.current
              .clear()
              .catch((error) => console.error("error clearing editor:", error));
          }
          editorRef.current = null;
          delete editorInstances.current[gameId];
        }
      };
    }, [gameId]);

    const fetchNoteData = async () => {
      try {
        const response = await fetch(`${baseURL}/games/${gameId}/notes`);
        const data = await response.json();
        if (data && data.length > 0) {
          setNoteContent(data[0].content);
        }
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
      if (noteContent && editorRef.current) {
        const editor = editorRef.current;

        editor.isReady
          .then(() => editor.render(noteContent))
          .then(() => {
            console.log("note rednered in the editor");
          })
          .catch((error) => {
            console.error("failed to render note:", error);
          });
      }
    }, [noteContent]);

    return (
      <div
        id={`editorjs-${gameId}`}
        className="w-full block bg-white rounded-xl"
      />
    );
  };

  const saveData = async (gameId) => {
    const editor = editorInstances.current[gameId];

    if (!editor) {
      console.error(`Editor.js instance not found for gameId: ${gameId}`);
      return;
    }

    await editor.isReady;

    try {
      const savedData = await editor.save();

      const response = await fetch(`${baseURL}/games/${gameId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: savedData }),
      });

      if (!response.ok) {
        throw new Error(`failed to save note, status code: ${response.status}`);
      }

      const textResponse = await response.text();
      console.log("raw response:", textResponse);

      const result = JSON.parse(textResponse);
      console.log("note saved successfully:", result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const Submit = async () => {
    try {
      const { data } = await axios.post(`${baseURL}/games`, {
        title: gameName,
      });

      setGames([...games, data]);
      handleClose();
    } catch (error) {
      console.error("error adding game");
    }
  };

  const Delete = async (gameId) => {
    console.log("deleting game with ID:", gameId);

    try {
      const response = await axios.delete(`${baseURL}/games/${gameId}`);
      console.log("game deleted successfully", response.data);
      setGames((prev) => prev.filter((game) => game.id !== gameId));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async (gameId) => {
    try {
      const { data } = await axios.patch(`${baseURL}/games/${gameId}/favorite`);

      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === data.id ? { ...game, favorite: data.favorite } : game
        )
      );
    } catch (error) {
      console.error("error toggling favorite:", error);
    }
  };

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const response = await axios.get(`${baseURL}/games`);
        setGames(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    window.addEventListener("gameslistshouldrefresh", handleRefresh);

    return () => {
      window.removeEventListener("gameslistshouldrefresh", handleRefresh);
    };
  }, [setGames]);

  const sortedGames = [...games].sort((a, b) => a.id - b.id);

  return (
    <>
      <div className="flex">
        <h1 className="font-[Pixelify_Sans] text-5xl px-4 my-2">Games</h1>
        <button
          className="flex bg-zinc-800 hover:bg-zinc-700 text-white font-[Pixelify_Sans] py-2 px-8 my-4 rounded ml-auto mx-8 rounded-xl"
          onClick={handleOpen}
        >
          Add Game
        </button>
      </div>
      <List>
        {sortedGames.map((game) => (
          <ListItem key={game.id}>
            <Accordion
              sx={{
                width: "100%",
                bgcolor: "#F5F5F5",
                borderRadius: "30px",
                boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.2)",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Pixelify Sans",
                      fontSize: "20px",
                    }}
                  >
                    {game.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails className="w-full p-0">
                <MyEditor className="w-full" gameId={game.id} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button
                    sx={{
                      display: "flex",
                      alignContent: "center",
                      width: "auto",
                      backgroundColor: "#27272A",
                      borderRadius: "10px",
                      fontFamily: "Pixelify Sans",
                      color: "white",
                    }}
                    onClick={() => Delete(game.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    sx={{
                      display: "flex",
                      alignContent: "center",
                      width: "auto",
                      backgroundColor: "#27272A",
                      borderRadius: "10px",
                      fontFamily: "Pixelify Sans",
                      color: "white",
                      ml: "1rem",
                    }}
                    onClick={() => toggleFavorite(game.id)}
                  >
                    {game.favorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button
                    sx={{
                      display: "flex",
                      alignContent: "center",
                      width: "auto",
                      backgroundColor: "#27272A",
                      borderRadius: "10px",
                      fontFamily: "Pixelify Sans",
                      color: "white",
                      ml: "1rem",
                    }}
                    onClick={() => saveData(game.id)}
                  >
                    Save
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          </ListItem>
        ))}
      </List>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            height: "35vh",
            bgcolor: "#F9FAFB",
            color: "#27272A",
            border: "2px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: 20,
            p: 4,
            backdropFilter: "blur(10px)",
          }}
        >
          <h1 className="font-[Pixelify_Sans] text-4xl mb-8">Add New Game</h1>
          <TextField
            fullWidth
            label="Game Name"
            variant="filled"
            value={gameName}
            onChange={(event) => setGameName(event.target.value)}
            sx={{
              input: {
                fontFamily: "Roboto, sans-serif",
                fontWeight: 200,
              },
              label: {
                fontFamily: "Roboto, sans-serif",
                fontSize: "1.1rem",
                fontWeight: 200,
              },
            }}
          />

          <Button
            variant="contained"
            sx={{
              position: "absolute",
              bottom: "35px",
              right: "60px",
              fontFamily: "Pixelify Sans",
              bgcolor: "#27272A",
              width: "10rem",
              height: "3rem",
              fontSize: "20px",
            }}
            onClick={Submit}
          >
            Create
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default CreateGames;
