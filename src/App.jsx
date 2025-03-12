import Signin from "./components/Signin";

import { UserAuth } from "./context/AuthContext";

function App() {
  // const { user } = UserAuth();

  return (
    <>
      <Signin />
    </>
  );
}

export default App;