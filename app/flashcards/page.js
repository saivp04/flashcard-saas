'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../firebase";
import {
  Grid,
  Container,
  Typography,
  CardContent,
  Card,
  CircularProgress,
  Box,
} from "@mui/material";
import { collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcardSets() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(collection(db, "users"), user.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const collections = docSnap.data().flashcards || [];
          console.log("Fetched flashcard sets:", collections);
          setFlashcardSets(collections);
        } else {
          setFlashcardSets([]);
        }
      } catch (err) {
        console.error("Error fetching flashcard sets:", err);
        setError("Failed to fetch flashcard sets.");
      } finally {
        setLoading(false);
      }
    }

    getFlashcardSets();
  }, [user]);

  if (!isLoaded) {
    return <CircularProgress />;
  }

  if (!isSignedIn) {
    return <Typography variant="h6" align="center">Please sign in to view your flashcard sets.</Typography>;
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography variant="h6" color="error" align="center">{error}</Typography>;
  }

  const handleCardClick = (set) => {
    console.log("Card clicked:", set);
    router.push(`/flashcard?id=${typeof set === "string" ? set : set.name}`);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {flashcardSets.length > 0 ? (
          flashcardSets.map((set) => {
            const setName = typeof set === "string" ? set : set.name;
            return (
              <Grid item xs={12} sm={6} md={4} key={setName}>
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
                  onClick={() => handleCardClick(set)}
                >
                  <CardContent>
                    <Typography variant="h6">{setName}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6">No flashcard sets found.</Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
}
