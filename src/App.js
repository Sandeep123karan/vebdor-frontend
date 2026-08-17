import Auth from "./pages/Auth";
import VendorLayout from "./pages/VendorLayout";
import './App.css';

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      {token ? <VendorLayout /> : <Auth />}
    </>
  );
}

export default App;
