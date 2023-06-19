import { FC } from "react";

import GraphList from "./components/GraphList/GraphList";

const App: FC = () => {
  return (
    <div className="app">
      <h1 className="app__title">Graph Application</h1>
      <GraphList />
    </div>
  );
};

export default App;
