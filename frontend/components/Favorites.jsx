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

const editorInstances = {};

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
          fetchNoteData(gameId);
        },
        onChange: () => {
          console.log("editorjs edited");
        },
        placeholder: "Notes here! Add a simple image by copying and pasting.",
      });
      editorInstances[gameId] = editor;
      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current
          .clear()
          .catch((error) => console.error("error clearing editor:", error));
        editorRef.current = null;
        delete editorInstances[gameId];
      }
    };
  }, [gameId]);

  const fetchNoteData = async (gameId) => {
    try {
      const response = await axios.get(`${baseURL}/games/${gameId}/notes`);
      const data = response.data;
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
  const editor = editorInstances[gameId];

  if (!editor) {
    console.error("editor instance not found for gameId");
    return;
  }

  try {
    const outputData = await editor.save();
    console.log("editor data:", outputData);

    await axios.post(`${baseURL}/games/${gameId}/notes`, {
      content: outputData,
    });

    console.log("note saved successfully");
  } catch (error) {
    console.error(error);
  }
};

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios
      .get(`${baseURL}/games/favorites`)
      .then((response) => setFavorites(response.data))
      .catch((error) => console.error("error fetching favorites", error));
  }, []);

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

      if (!data.favorite) {
        setFavorites((prevFavorites) =>
          prevFavorites.filter((game) => game.id !== gameId)
        );

        window.dispatchEvent(new Event("gameslistshouldrefresh"));
      } else {
        setFavorites((prevFavorites) =>
          prevFavorites.map((game) =>
            game.id === data.id ? { ...game, favorite: data.favorite } : game
          )
        );
      }
    } catch (error) {
      console.error("error toggling favorite:", error);
    }
  };

  return (
    <div>
      <h2 className="font-[Pixelify_Sans] text-5xl px-4 my-2">
        Favorited Games
      </h2>
      <ul>
        {favorites.map((game) => (
          <List key={game.id}>
            <ListItem>
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
          </List>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
