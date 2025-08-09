import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import store from '../store';
import Layout from '../components/layout/Layout';
import Dashboard from '../components/Dashboard/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../components/App.css';

function AppContent() {
  const darkMode = useSelector(state => state.coins.darkMode);

  useEffect(() => {
    const bodyClass = document.body.classList;
    darkMode ? bodyClass.add("dark") : bodyClass.remove("dark");
    return () => bodyClass.remove("dark");
  }, [darkMode]);

  return (
    <div className="App">
      <Layout >
        <Dashboard />
      </Layout>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;