const express = require("express");

const graphsJson = require("./graphs.json");
const app = express();
const port = 3001;
const graphs = JSON.parse(JSON.stringify(graphsJson)).data;

app.get("/api/graphs", (req, res) => {
  return res.json(graphs.map((_, idx) => idx));
});

app.get("/api/graphs/:id", (req, res) => {
  const { id } = req.params;
  const graph = graphs.find((_, gid) => gid === parseInt(id));
  if (graph) return res.json(graph);
  else return res.send(res.status(404), res.text("Not found"));
});

app.listen(port, () => {
  console.log(`Express server started on http://localhost:${port}`);
});
