import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {
    // Function to fetch data from your localhost API
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/user/list');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error state or show an error message
      }
    };
    // Call the function when the component mounts
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        {data && (
          <div>
            <p>Fetched Data:</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
