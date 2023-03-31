import React from 'react';
// import FileDropZone from './component/Home';
import './App.css'; // Import a CSS file with global styles
import Home from './component/Home';
import background from "./Abstract-Network-Background_07.jpg";

const App = () => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  };

  const rootStyle = {
    backgroundImage: `url(${background})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    // height: '100%',
  };

  return (
    <div style={rootStyle}>
      <div style={containerStyle}>
        <Home style={{marginTop:"50%"}}/>
      </div>
    </div>
  );
};

export default App;
