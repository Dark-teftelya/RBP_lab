import React from 'react';
import './App.css';
import EmployeeList from './components/EmployeeList';
import FilterComp from './components/FilterComp';
import ExportToWord from './components/ExportToWord';


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <EmployeeList />
                
            </header>
        </div>
    );
}

export default App;
