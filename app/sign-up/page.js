'use client';
import React from "react";
import { Container, Box, Typography, AppBar, Toolbar, Button } from "@mui/material";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <>
      <AppBar position="static" sx={{ width: "100%" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <Button color="inherit">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="sm"
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', my: 4 }}
      >
        <Box
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <SignUp />
        </Box>
      </Container>
    </>
  );
}
