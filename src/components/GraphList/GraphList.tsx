import { FC, useEffect, useState } from "react";

import Graph from "../Graph/Graph";
import IGraph from "../../interfaces/IGraph";

import styles from "./GraphList.module.css";

const GraphList: FC = () => {
  const [graphs, setGraphs] = useState<number[]>([]);
  const [selectedGraph, setSelectedGraph] = useState("");
  const [graphData, setGraphData] = useState<IGraph | null>(null);

  const fetchGraph = async () => {
    await fetch(`/api/graphs/${selectedGraph}`)
      .then((response) => response.json())
      .then((data) => {
        setGraphData(data);
      })
      .catch((error) =>
        console.error(`Error fetching graph ${selectedGraph} data:`, error)
      );
  };

  const fetchGraphs = async () => {
    await fetch("/api/graphs")
      .then((response) => response.json())
      .then((data) => {
        setGraphs(data);
        setSelectedGraph("0");
      })
      .catch((error) => console.error("Error fetching graphs:", error));
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  useEffect(() => {
    if (selectedGraph) {
      fetchGraph();
    }
  }, [selectedGraph]);

  return (
    <div className={styles.graphList}>
      <select
        className={styles.graphListSelect}
        value={selectedGraph}
        onChange={(e) => setSelectedGraph(e.target.value)}
        role="combobox"
      >
        {graphs.length !== 0 &&
          graphs.map((graphId) => (
            <option key={graphId} value={graphId} role="option">
              {`Graph ${graphId}`}
            </option>
          ))}
      </select>
      {graphData !== null && selectedGraph && (
        <Graph key={+new Date()} data={graphData} />
      )}
      <div className={styles.graphListContainerDraw}>
        <div className={styles.graphListContainer} />
        {!graphData ? <p>Loading graphs...</p> : ""}
        <canvas id={styles.graphListCanvas} />
        <canvas id={styles.graphListCanvasBackground} />
      </div>
    </div>
  );
};

export default GraphList;
