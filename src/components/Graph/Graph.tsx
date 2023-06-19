import { useEffect, FC } from "react";

import PositionElements from "../../interfaces/PositionElements";
import IGraph from "../../interfaces/IGraph";
import {
  calculatePosition,
  connectGraphs,
  drawGrid,
  setTranslate,
  sizeCanvas,
  sortGraphs,
} from "./helpers";

import styles from "./Graph.module.css";
import stylesGraphList from "../GraphList/GraphList.module.css";

type Props = {
  data: IGraph;
};

const Graph: FC<Props> = ({ data }) => {
  const renderGraphs = () => {
    const NODES = data.nodes;
    const EDGES = data.edges;
    const canvas = document.getElementById(
      `${stylesGraphList.graphListCanvas}`
    ) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const graphList = document.body.querySelector(
      `.${stylesGraphList.graphListContainer}`
    ) as HTMLElement;
    const canvasBackground = document.getElementById(
      `${stylesGraphList.graphListCanvasBackground}`
    ) as HTMLCanvasElement;
    const ctxBackground = canvasBackground.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    const elements: {
      [key: string]: {
        x: number;
        y: number;
        startX: number;
        startY: number;
      };
    } = {};
    const widthGraph = 50;
    const sizeMissing = widthGraph + 50;
    const widthContainerGraphs = 120;
    const heightContainerGraphs = 120;

    let current: HTMLElement | null = null;
    let positions: PositionElements[] = calculatePosition(
      NODES,
      EDGES,
      sizeMissing
    );
    let sizesCanvas = sizeCanvas(
      positions,
      widthContainerGraphs,
      heightContainerGraphs,
      innerWidth
    );
    const widthCanvas = (canvas.width = sizesCanvas.width);
    const heightCanvas = (canvas.height = sizesCanvas.height);

    // распределение графов
    sortGraphs(positions, EDGES);

    graphList.innerHTML = "";

    positions.forEach((item) => {
      const element = document.createElement("div");
      element.innerHTML = `
        <span class="${styles.graphItemTxt}">${
        NODES[item.id].name.length > 6
          ? `${NODES[item.id].name.split("").slice(0, 5).join("")}...`
          : NODES[item.id].name
      }</span>
        <span class="${styles.graphItemId}">${NODES[item.id].id}</span>
        <span class="${styles.graphItemDesc}">${NODES[item.id].name}</span>`;

      element.addEventListener("pointerdown", handleGraphPointerDown);
      const id = "graph" + item.id;
      element.id = id;
      element.classList.add(styles.graphItem);
      element.setAttribute("data-col", String(item.quantityColumns));
      element.setAttribute("data-testid", NODES[item.id].name);
      element.setAttribute("role", "graph");
      graphList.prepend(element);

      elements[id] = {
        x: item.x,
        y: item.y,
        startX: 0,
        startY: 0,
      };

      setTranslate(element, elements[id].x, elements[id].y);
    });

    // соединяем линиями
    connectGraphs(
      elements,
      context,
      widthCanvas,
      heightCanvas,
      widthGraph,
      EDGES
    );

    // отрисовка сетки
    canvasBackground.width = widthCanvas;
    canvasBackground.height = heightCanvas;

    drawGrid(widthCanvas, 10, "rgba(0, 0, 0, 0.2)", ctxBackground);

    function handleGraphPointerDown(e: any) {
      e.preventDefault();
      elements[e.target.id].startX = e.x - elements[e.target.id].x;
      elements[e.target.id].startY = e.y - elements[e.target.id].y;

      current = e.target;

      document.body.addEventListener("pointermove", handleGraphPointerMove);
      document.body.addEventListener("pointerup", handleGraphPointerUp);
    }

    function handleGraphPointerMove(e: { x: number; y: number }) {
      if (current) {
        const x = (elements[current.id].x = e.x - elements[current.id].startX);
        const y = (elements[current.id].y = e.y - elements[current.id].startY);

        setTranslate(current, x, y);
        connectGraphs(
          elements,
          context,
          widthCanvas,
          heightCanvas,
          widthGraph,
          EDGES
        );
      }
    }

    function handleGraphPointerUp() {
      document.body.removeEventListener("pointermove", handleGraphPointerMove);
      document.body.removeEventListener("pointerup", handleGraphPointerUp);
    }
  };

  useEffect(() => {
    renderGraphs();
  }, []);

  return <div className={styles.graph}></div>;
};

export default Graph;
