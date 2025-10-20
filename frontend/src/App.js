import { useState, useEffect } from 'react';
import './App.css';
import LenisWrapper from './components/LenisWrapper';
import Sidebar from './components/Sidebar';
import NotebookManager from './components/NotebookManager';
import Dashboard from './components/Dashboard';
import TodoSystem from './components/TodoSystem';
import { loadData, saveData, calculateAnalytics, getInitialData } from './utils/storage';
import { Menu, X, CheckSquare } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState('notebooks');
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const storedData = loadData();
    setData(storedData);
  }, []);

  useEffect(() => {
    // Listen for web capture messages from Chrome extension
    const handleMessage = (event) => {
      if (event.data.type === 'CONTENT_CAPTURE') {
        handleWebCapture(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [data]);

  const handleWebCapture = (payload) => {
    if (!data) return;

    const targetNotebook = data.notebooks.find(nb => nb.isTarget);
    if (!targetNotebook) {
      alert('Please set a target notebook first');
      return;
    }

    // Append captured content to target notebook
    const capturedContent = `\n\n---\n**Captured from ${payload.sourceDomain}**\n${payload.sourceUrl}\n\n${payload.selectedHTML}`;
    
    const updatedData = {
      ...data,
      notebooks: data.notebooks.map(nb =>
        nb.id === targetNotebook.id
          ? { 
              ...nb, 
              content: nb.content + capturedContent,
              lastModified: new Date().toISOString(),
              wordCount: nb.wordCount + payload.selectedText.split(/\s+/).filter(Boolean).length,
              characterCount: nb.characterCount + payload.selectedText.length,
            }
          : nb
      ),
    };

    updatedData.analytics = calculateAnalytics(updatedData);
    updatedData.analytics.webCaptures = (updatedData.analytics.webCaptures || 0) + 1;
    
    setData(updatedData);
    saveData(updatedData);

    // Show success message
    alert(`✅ Captured from ${payload.sourceDomain}`);
  };

  const handleCreateNotebook = (name) => {
    const newNotebook = {
      id: `nb_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isTarget: data.notebooks.length === 0,
      content: '',
      wordCount: 0,
      characterCount: 0,
    };

    const updatedData = {
      ...data,
      notebooks: [...data.notebooks, newNotebook],
    };

    updatedData.analytics = calculateAnalytics(updatedData);
    setData(updatedData);
    saveData(updatedData);
  };

  const handleSelectNotebook = (notebook) => {
    setSelectedNotebook(notebook);
    setCurrentView('editor');
  };

  const handleDeleteNotebook = (notebookId) => {
    if (window.confirm('Are you sure you want to delete this notebook?')) {
      const updatedData = {
        ...data,
        notebooks: data.notebooks.filter(nb => nb.id !== notebookId),
      };

      updatedData.analytics = calculateAnalytics(updatedData);
      setData(updatedData);
      saveData(updatedData);
      
      // If deleted notebook was selected, go back to notebooks
      if (selectedNotebook?.id === notebookId) {
        setCurrentView('notebooks');
        setSelectedNotebook(null);
      }
    }
  };

  const handleSetTarget = (notebookId) => {
    const updatedData = {
      ...data,
      notebooks: data.notebooks.map(nb => ({
        ...nb,
        isTarget: nb.id === notebookId,
      })),
    };

    setData(updatedData);
    saveData(updatedData);

    // Send message to Chrome extension
    window.postMessage({
      type: 'TARGET_NOTEBOOK_UPDATED',
      notebookId,
    }, '*');
  };

  const handleSaveNotebook = (notebookId, content, wordCount, characterCount) => {
    const updatedData = {
      ...data,
      notebooks: data.notebooks.map(nb =>
        nb.id === notebookId
          ? { 
              ...nb, 
              content,
              lastModified: new Date().toISOString(),
              wordCount,
              characterCount,
            }
          : nb
      ),
    };

    updatedData.analytics = calculateAnalytics(updatedData);
    setData(updatedData);
    saveData(updatedData);
  };

  const handleUpdateTodos = (todoSystem) => {
    const updatedData = {
      ...data,
      todoSystem,
    };

    // Recalculate analytics to update streak
    updatedData.analytics = calculateAnalytics(updatedData);
    
    setData(updatedData);
    saveData(updatedData);
  };

  const handleBackToNotebooks = () => {
    setCurrentView('notebooks');
    setSelectedNotebook(null);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <LenisWrapper>
      <div className="min-h-screen bg-black">
        {/* Top Navigation Bar */}
        <div className={`fixed top-0 right-0 h-16 bg-[#0A0A0A] border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-6 z-40 transition-all duration-300 ${
          showSidebar ? 'left-80' : 'left-0'
        }`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-full bg-[#1C1C1E] hover:bg-[#262626] transition-all"
            >
              {showSidebar ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <h1 className="text-white font-bold text-xl">CopyDock</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('notebooks')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  currentView === 'notebooks'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Notebooks
              </button>
              <button
                onClick={() => setCurrentView('todos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  currentView === 'todos'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Todo System
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Left Side */}
        {showSidebar && (
          <Sidebar
            analytics={data.analytics}
            onSearch={(query) => console.log('Search:', query)}
          />
        )}

        {/* Main Content */}
        <div className={`pt-16 transition-all duration-300 ${showSidebar ? 'ml-80' : 'ml-0'}`}>
          {currentView === 'notebooks' && (
            <NotebookManager
              notebooks={data.notebooks}
              onCreateNotebook={handleCreateNotebook}
              onSelectNotebook={handleSelectNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onSetTarget={handleSetTarget}
            />
          )}

          {currentView === 'editor' && selectedNotebook && (
            <Dashboard
              notebook={selectedNotebook}
              notes={data.notes.filter(n => n.notebookId === selectedNotebook.id)}
              onBack={handleBackToNotebooks}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentView === 'todos' && (
            <TodoSystem
              todoData={data.todoSystem}
              onUpdateTodos={handleUpdateTodos}
              onBack={handleBackToNotebooks}
            />
          )}
        </div>
      </div>
    </LenisWrapper>
  );
}

export default App;
