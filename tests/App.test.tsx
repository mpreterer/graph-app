import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import graphs from "../src/mocks/graphs";

beforeEach(async () => {
  render(<App />);
  await screen.findAllByRole("option");
});

test("App renders", async () => {
  await act(async () => {
    render(<App />);
  });
});

test("There is a dropdown with all the available graphs", async () => {
  const graphList = await screen.findByRole("combobox");
  const graphListOptions = await screen.findAllByRole("option");

  expect(graphList).not.toBeUndefined();
  expect(graphListOptions.length).toBe(graphs.length);
});

test("Graph selected by dropdown is rendered", async () => {
  const selectedGraph = 1;

  act(async () => {
    const selectElement = await screen.findByRole("combobox");
    await userEvent.selectOptions(selectElement, `${selectedGraph}`);
  });

  await waitFor(() => {
    for (let node of graphs[selectedGraph].nodes) {
      expect(screen.findByTestId(node.name)).not.toBeUndefined();
    }
  });
});
