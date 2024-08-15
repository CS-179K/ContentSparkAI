import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FixedSizeList as List } from 'react-window';
import DynamicResponse from '../DynamicResponse/DynamicResponse';
import './Modal.css'; // Import the CSS for the modal (if using external styles)

const History = () => {
  const [history, setHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-content`) // Adjust the endpoint if needed
      .then(response => {
        console.log(response.data); // Log the fetched data to ensure it's correct
        setHistory(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const formatFilters = (filters) => {
    return Object.entries(filters)
      .filter(([key, value]) => value && typeof value === 'string')
      .map(([key, value]) => (
        <div key={key} style={{ whiteSpace: 'pre-wrap' }}>{`${key}: ${value}`}</div>
      ));
  };

  const formatPrompt = (prompt) => {
    return prompt.split('\n').map((item, index) => (
      <li key={index} style={{ listStyleType: 'disc', marginBottom: '5px' }}>{item}</li>
    ));
  };

  const handleRowClick = (index) => {
    setModalContent(history[index]);
    setIsModalOpen(true);
  };

  const Row = ({ index, style }) => (
    <div
      style={{ ...style, display: 'flex', borderBottom: '1px solid white', color: 'white', cursor: 'pointer' }}
      onClick={() => handleRowClick(index)}
    >
      <div style={{ width: '20%', padding: '10px' }}>
        {formatFilters(history[index].filters)}
      </div>
      <div style={{ width: '40%', padding: '10px' }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>{formatPrompt(history[index].prompt)}</ul>
      </div>
      <div style={{ width: '30%', padding: '10px', overflowX: 'auto' }}>
        <DynamicResponse content={history[index].response} />
      </div>
      <div style={{ width: '10%', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <button className="delete-btn" onClick={(e) => handleDelete(e, index)}>Delete</button>
        <button className="favorite-btn" onClick={(e) => handleFavorite(e, index)}>Save to Favorite</button>
      </div>
    </div>
  );
  
  const handleDelete = async (e, index) => {
    e.stopPropagation();
    try {
      const itemToDelete = history[index];
      const itemId = itemToDelete?._id;
      if (!itemId) {
        console.error('No valid ID found for item:', itemToDelete);
        return;
      }
      
      // Remove the duplicate '/api' if it exists in your base URL
      const baseUrl = process.env.REACT_APP_API_BASE_URL.endsWith('/api') 
        ? process.env.REACT_APP_API_BASE_URL.slice(0, -4) 
        : process.env.REACT_APP_API_BASE_URL;
      
      const response = await axios.delete(`${baseUrl}/api/delete-content/${itemId}`);
      
      if (response.status === 200) {
        const updatedHistory = history.filter((item) => item._id !== itemId);
        setHistory(updatedHistory);
        console.log('Item deleted successfully:', response.data);
      } else {
        console.error('Failed to delete item:', response.data);
      }
    } catch (error) {
      console.error('Error deleting item:', error.response?.data || error.message);
    }
  };
  
  
  const handleFavorite = (e, index) => {

    // Logic to mark the item as favorite
  
  };
  


const CustomModal = ({ content, onClose }) => {
  if (!content) return null;

  const { filters, prompt, response } = content;

  const formatFilters = (filters) => {
    return (
      <table className="filters-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(filters)
            .filter(([key, value]) => value && typeof value === 'string')
            .map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  const formatPrompt = (prompt) => {
    return prompt.split('\n').map((item, index) => (
      <li key={index} style={{ listStyleType: 'disc', marginBottom: '5px' }}>{item}</li>
    ));
  };

  const handleDeleteFromModal = async () => {
    try {
      const itemId = content?._id;
      if (!itemId) {
        console.error('No valid ID found for item:', content);
        return;
      }
  
      const response = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/delete-content/${itemId}`);
  
      if (response.status === 200) {
        const updatedHistory = history.filter(item => item._id !== itemId);
        setHistory(updatedHistory);
        onClose(); // Close the modal after deletion
        console.log('Item deleted successfully:', response.data);
      } else {
        console.error('Failed to delete item:', response.data);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  

  const handleFavoriteFromModal = () => {
    // Logic to save the item to favorites, similar to the Row's handleFavorite function

  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Details</h2>
          <button onClick={onClose} className="modal-close-button">Close</button>
        </div>
        <div className="modal-body">
          <div>
            <strong>Filters:</strong>
            {formatFilters(filters)}
          </div>
          <div>
            <strong>Prompt:</strong>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>{formatPrompt(prompt)}</ul>
          </div>
          <div>
            <strong>Response:</strong>
            <div className="modal-response">
              <DynamicResponse content={response} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="delete-btn" onClick={handleDeleteFromModal}>Delete</button>
          <button className="favorite-btn" onClick={handleFavoriteFromModal}>Save to Favorite</button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className='hstry-container'>
      <div style={{ display: 'flex', borderBottom: '2px solid white', color: 'white', fontWeight: 'bold' }}>
        <div style={{ width: '25%', padding: '10px' }}>Filters</div>
        <div style={{ width: '45%', padding: '10px' }}>Prompt</div>
        <div style={{ width: '30%', padding: '10px' }}>Response</div>
      </div>
      <List
        height={400} // Adjust the height as needed
        itemCount={history.length}
        itemSize={120} // Adjusted height of each row to accommodate content
        width={'100%'}
      >
        {Row}
      </List>

      {isModalOpen && <CustomModal content={modalContent} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default History;
