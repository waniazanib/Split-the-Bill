import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import Screen1 from './screens/Screen1Landing';
import Screen2 from './screens/Screen2OCR';
import Screen3 from './screens/Screen3EditItems';
import Screen4 from './screens/Screen4AddPeople';
import Screen5 from './screens/Screen5AssignItems';
import Screen6 from './screens/Screen6WhoPaid';
import Screen7 from './screens/Screen7SettleUp';


function AppContent() {
  const { state } = useApp();
  const renderScreen = () => {
    switch (state.currentScreen) {
      case 1:
        return <Screen1 />;
      case 2:
        return <Screen2 />;
      case 3:
        return <Screen3 />;
      case 4:
        return <Screen4 />;
      case 5:
        return <Screen5 />;
      case 6:
        return <Screen6 />;
      case 7:
        return <Screen7 />;
      default:
        return <Screen1 />;
    }
  };

  return renderScreen();
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
