import app from "./App";
const PORT = 3030;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log('Express server listening on ' + HOST + ":" + PORT);
});