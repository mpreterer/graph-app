import PositionElements from "../../interfaces/PositionElements";

import Edge from "../../interfaces/Edge";
import Node from "../../interfaces/Node";

function setTranslate(el: HTMLElement, x: number, y: number) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}

function drawLine(
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  cxt: CanvasRenderingContext2D,
  widthGraph: number
) {
  cxt.beginPath();
  cxt.moveTo(x1 + widthGraph / 2, y1 + widthGraph / 2);
  cxt.lineTo(x2 + widthGraph / 2, y2 + widthGraph / 2);
  cxt.stroke();
}

function drawGrid(
  gridSize: number,
  cellSize: number,
  color: any,
  ctx: CanvasRenderingContext2D
) {
  ctx.strokeStyle = color;

  // Горизонтальные линии
  for (let y = 0; y <= gridSize; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gridSize, y);
    ctx.stroke();
  }

  // Вертикальные линии
  for (let x = 0; x <= gridSize; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridSize);
    ctx.stroke();
  }
}

function calculatePosition(nodes: Node[], edges: Edge[], sizeMissing: number) {
  let res: { [id: number]: PositionElements } = {};
  let startNodes: Node[] = [];
  let tempNodes: Node[] = [];
  let nextNode: Node[] = [];
  let posX = 50;
  let posY = 50;
  let quantityColumns = 1;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (!edges.some((obj) => obj.toId === node.id)) {
      startNodes.push(node);
    }
  }

  startNodes.forEach((item: Node, indx) => {
    res[indx] = {
      ...nodes[item.id],
      x: posX,
      y: posY,
      quantityColumns: quantityColumns,
    };
    posY += sizeMissing;
  });

  for (let i = 0; i < nodes.length; i++) {
    const element = nodes[i];

    if (startNodes.every((obj) => obj.id !== element.id)) {
      tempNodes.push(element);
    }
  }

  const enumerationNodes = (beforeNodes: Node[], afterNode: Node[]) => {
    let connects = [];
    let countConnects = 0;
    posY = 50;
    posX += sizeMissing;
    quantityColumns++;

    beforeNodes.forEach((itemParent) => {
      connects = afterNode.filter((item) => {
        if (
          edges.some(
            (obj) => obj.fromId === itemParent.id && item.id === obj.toId
          )
        ) {
          return item;
        }
      });

      connects.forEach((item) => {
        const index = Object.keys(res).length;
        let resInArr = Object.values(res);

        if (resInArr.filter((obj) => obj.id === item.id).length === 0) {
          res[index] = {
            ...nodes[item.id],
            x: posX,
            y: posY,
            quantityColumns: quantityColumns,
          };
          posY += sizeMissing;
          nextNode.push(nodes[item.id]);

          countConnects++;
        }
      });
    });

    beforeNodes = Object.values(res).slice(beforeNodes.length);
    afterNode = [];

    for (let i = 0; i < nodes.length; i++) {
      const element = nodes[i];

      if (!beforeNodes.some((obj) => obj.id === element.id)) {
        afterNode.push(element);
      }
    }

    if (Object.values(res).length === nodes.length) {
      return;
    }

    enumerationNodes(beforeNodes, afterNode);
  };

  enumerationNodes(startNodes, tempNodes);

  return Object.values(res);
}

function sizeCanvas(
  obj: { [id: number]: PositionElements },
  widthContainer: number,
  heightContainer: number,
  innerWidth: number
) {
  let arr: number[] = Object.values(obj).map((item) => item.quantityColumns);
  let count: any = {};
  let columns = 0;
  let result: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    let element = arr[i];

    if (count[element] === undefined) {
      count[element] = 1;
    } else {
      count[element]++;
    }
  }

  // кол-во повторяющихся элементов это то кол-во строк
  for (let key in count) {
    if (count.hasOwnProperty(key) && count[key] > 1) {
      columns++;
    }
  }

  // кол-во столбцов
  result = Object.keys(count).map((item: string) => Number(item));

  return {
    width:
      widthContainer * result.length - 1 < innerWidth
        ? innerWidth
        : widthContainer * result.length - 1,
    height: columns === 0 ? heightContainer * 1.4 : columns * heightContainer,
  };
}

function connectGraphs(
  elements: { [x: string]: { y: number; x: number } },
  context: CanvasRenderingContext2D,
  widthCanvas: number,
  heightCanvas: number,
  widthGraph: number,
  edges: Edge[]
) {
  context.clearRect(0, 0, widthCanvas, heightCanvas);

  for (let i = 0; i < edges.length - 1; i++) {
    const withElements = edges.filter((item) => i === item.fromId);

    withElements.forEach((item) => {
      drawLine(
        elements["graph" + item.fromId].x,
        elements["graph" + item.toId].x,
        elements["graph" + item.fromId].y,
        elements["graph" + item.toId].y,
        context,
        widthGraph
      );
    });
  }
}

function sortGraphs(graphs: PositionElements[], edges: Edge[]) {
  const res = graphs;

  graphs.forEach((itemParent, index) => {
    let connectsItemNow: number[] = [];
    let connectsEdgesAfter: number[] = [];
    let connectsEdgesBefore: number[] = [];

    edges.filter((item) => {
      if (itemParent.id === item.fromId) {
        connectsItemNow.push(item.toId);
        return item;
      }
    });

    if (graphs[index + 1]?.quantityColumns === itemParent.quantityColumns) {
      edges.filter((item) => {
        if (graphs[index + 1].id === item.fromId) {
          connectsEdgesAfter.push(item.toId);
          return item;
        }
      });
      edges.filter((item) => {
        if (graphs[index + 1].id === item.fromId) {
          connectsEdgesBefore.push(item.toId);
          return item;
        }
      });
    }

    if (
      connectsItemNow.length > 1 &&
      connectsItemNow[0] === connectsEdgesAfter[0]
    ) {
      res.forEach((item) => {
        if (connectsItemNow[0] === item.id) {
          item.y += 100;
        }
        if (connectsItemNow[1] === item.id) {
          item.y -= 100;
        }
      });
    }

    if (
      connectsEdgesBefore.length > 1 &&
      connectsItemNow[0] === connectsEdgesBefore[0]
    ) {
    }
  });
}

export {
  setTranslate,
  drawLine,
  drawGrid,
  calculatePosition,
  sizeCanvas,
  connectGraphs,
  sortGraphs,
};
