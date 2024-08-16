import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Table,
  Space,
  Input,
  Select,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, StarOutlined } from "@ant-design/icons";
import { FixedSizeList as List } from "react-window";
import DynamicResponse from "../DynamicResponse/DynamicResponse";
import { useAuth } from "../Context/AuthContext";
import AppHeader from "../Header/AppHeader";

const { Paragraph, Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const History = () => {
  const [history, setHistory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const { api } = useAuth();

  const fetchHistory = useCallback(async () => {
    try {
      const response = await api.get("/get-history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/delete-content/${id}`);
      message.success(response.data.message);
      fetchHistory();
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error(error.response?.data?.message ?? "Deletion failed");
    }
  };

  const handleFavorite = async (id) => {
    // Implement favorite functionality
  };

  const showModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const columns = [
    {
      title: "Filter Name",
      dataIndex: "key",
      key: "key",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Filter Value",
      dataIndex: "value",
      key: "value",
      render: (value) => {
        if (Array.isArray(value)) {
          return (
            <Space wrap>
              {value.map((item, index) => (
                <Tag key={index} color="blue">
                  {item}
                </Tag>
              ))}
            </Space>
          );
        }
        return value;
      },
    },
  ];

  const formatFilterValue = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    return String(value);
  };

  const filteredAndSortedHistory = history
    .filter(
      (item) =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.response.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  const Row = ({ index, style }) => {
    const item = filteredAndSortedHistory[index];
    return (
      <div
        style={{ ...style, borderBottom: "1px solid #303030", padding: "16px" }}
      >
        <Card
          hoverable
          onClick={() => showModal(item)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          <Paragraph ellipsis={{ rows: 1, expandable: false }}>
            <Title level={2}>{item.title}</Title>
          </Paragraph>
          <Paragraph ellipsis={{ rows: 2, expandable: false }}>
            <Text strong>Response:</Text> {item.response}
          </Paragraph>
          <Space>
            <Button
              type="primary"
              icon={<StarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite(item._id);
              }}
            >
              Save to Favorite
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item._id);
              }}
            >
              Delete
            </Button>
          </Space>
        </Card>
      </div>
    );
  };

  return (
    <>
      <AppHeader />
      <div className="hstry-container" style={{ padding: "24px" }}>
        <Space style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Search in history"
            onSearch={setSearchTerm}
            style={{ width: 200 }}
          />
          <Select
            defaultValue="newest"
            style={{ width: 120 }}
            onChange={setSortOrder}
          >
            <Option value="newest">Newest</Option>
            <Option value="oldest">Oldest</Option>
          </Select>
        </Space>
        <List
          height={window.innerHeight - 200}
          itemCount={filteredAndSortedHistory.length}
          itemSize={264}
          width="100%"
        >
          {Row}
        </List>
        <Modal
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={
            selectedItem && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Button
                  type="primary"
                  icon={<StarOutlined />}
                  onClick={() => handleFavorite(selectedItem._id)}
                  style={{ marginRight: 8 }}
                >
                  Save to Favorite
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    handleDelete(selectedItem._id);
                    handleModalClose();
                  }}
                >
                  Delete
                </Button>
              </div>
            )
          }
          width={800}
          bodyStyle={{ maxHeight: "calc(60vh - 55px)", overflow: "auto" }}
        >
          {selectedItem && (
            <>
              <Title level={2}>{selectedItem.title}</Title>
              <Table
                columns={columns}
                dataSource={Object.entries(selectedItem.filters)
                  .filter(([_, value]) => value && value.length > 0)
                  .map(([key, value]) => ({
                    key,
                    value: formatFilterValue(value),
                  }))}
                pagination={false}
                size="small"
              />
              <Paragraph style={{ marginTop: "24px" }}>
                <Title level={3}>Prompt:</Title>
                <DynamicResponse content={selectedItem.prompt} />
              </Paragraph>
              <Title level={3}>Response:</Title>
              <DynamicResponse content={selectedItem.response} />
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default History;
