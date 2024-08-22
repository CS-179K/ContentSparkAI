import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from 'antd';

const ReviewModal = ({ visible, title, response, onConfirm, onCancel }) => {
    const [updatedTitle, setUpdatedTitle] = useState(title);
    const [updatedResponse, setUpdatedResponse] = useState(response);

    useEffect(() => {
        setUpdatedTitle(title);
        setUpdatedResponse(response);
    }, [title, response]);  // Whenever title or response changes, update the state

    return (
        <Modal
            title="Review"
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => onConfirm(updatedTitle, updatedResponse)}>
                    Yes
                </Button>,
            ]}
        >
            <Input
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                placeholder="Title"
                style={{ marginBottom: '10px' }}
            />
            <Input.TextArea
                value={updatedResponse}
                onChange={(e) => setUpdatedResponse(e.target.value)}
                rows={6}
                placeholder="Response"
            />
        </Modal>
    );
};

export default ReviewModal;
