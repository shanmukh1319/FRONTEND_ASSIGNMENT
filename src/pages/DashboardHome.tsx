import { Box, Card, CardContent, Typography, Container } from "@mui/material";

export const DashboardHome = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="md" sx={{ width: "100%" }}>
        <Card sx={{ mx: "auto" }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You have successfully logged in to your account.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
