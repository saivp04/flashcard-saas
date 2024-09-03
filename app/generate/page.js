'use client';

import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { db } from "../../firebase";
import {
  writeBatch,
  doc,
  getDoc,
  collection,
  setDoc,
} from "firebase/firestore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useMediaQuery, useTheme } from "@mui/material";

export default function Generate() {
  const [flipped, setFlipped] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const router = useRouter();
  const { userId } = useAuth();

  const steps = ["Enter Text", "Generate Flashcards", "Review and Save"];
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialSeen");
    if (tutorialSeen) {
      setShowTutorial(false);
    }
  }, []);

  const handleSubmit = async () => {
    console.log("Button clicked"); // Debugging statement

    if (text.trim().length === 0) {
      setError("Please enter some text to generate flashcards.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No flashcards generated. Please try again.");
      }

      setFlashcards(data);
      setActiveStep(1);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(
        error.message || "Failed to generate flashcards. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcards = async () => {
    if (!name) {
      setError("Please enter a name for your flashcard set.");
      return;
    }
    if (!userId) {
      setError("You must be logged in to save flashcards.");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);

      let collections = [];
      if (docSnap.exists()) {
        collections = docSnap.data().flashcards || [];
        if (collections.includes(name)) {
          setError("A flashcard set with that name already exists.");
          setLoading(false);
          return;
        }
      }

      collections.push(name);
      await setDoc(userDocRef, { flashcards: collections }, { merge: true });

      const colRef = collection(userDocRef, name);
      const batchSize = 450; // Firestore limit is 500, leaving some room for safety
      for (let i = 0; i < flashcards.length; i += batchSize) {
        const batch = writeBatch(db);
        flashcards.slice(i, i + batchSize).forEach((flashcard) => {
          const cardDocRef = doc(colRef);
          batch.set(cardDocRef, flashcard);
        });
        await batch.commit();
      }

      handleClose();
      router.push("/flashcards");
    } catch (error) {
      console.error("Error saving flashcards:", error);
      setError(`Failed to save flashcards: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("tutorialSeen", "true");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Generate Flashcards
          <Tooltip title="How to use this page">
            <IconButton onClick={() => setShowTutorial(true)}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ mb: 4 }}
          orientation={isSmallScreen ? "horizontal" : "horizontal"}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter text"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ height: 56 }}
            fullWidth
            disabled={loading || text.trim().length === 0}
          >
            {loading ? <CircularProgress size={24} /> : "GENERATE FLASHCARDS"}
          </Button>
        </Paper>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Flashcards Preview
          </Typography>
          <Grid container spacing={3}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleCardClick(index)}>
                    <CardContent>
                      <Box
                        sx={{
                          perspective: "1000px",
                          "& > div": {
                            transition: "transform 0.6s",
                            transformStyle: "preserve-3d",
                            position: "relative",
                            width: "100%",
                            height: "250px",
                            backgroundColor: "#f6fcff",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            transform: flipped[index]
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          },
                          "& > div > div": {
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 2,
                            boxSizing: "border-box",
                          },
                          "& > div > div:nth-of-type(2)": {
                            transform: "rotateY(180deg)",
                          },
                        }}
                      >
                        <div>
                          <div>
                            <Typography variant="h5" component="div">
                              {flashcard.front}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="h5" component="div">
                              {flashcard.back}
                            </Typography>
                          </div>
                        </div>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              fullWidth
            >
              Save Flashcards
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for your flashcard set:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveFlashcards} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Snackbar open={Boolean(error)} autoHideDuration={6000}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      <Dialog
        open={showTutorial}
        onClose={closeTutorial}
        aria-labelledby="tutorial-dialog-title"
      >
        <DialogTitle id="tutorial-dialog-title">Welcome to Flashcard Generator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Here is a brief tutorial on how to use this page...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTutorial} color="primary">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
