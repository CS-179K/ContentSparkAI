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
import { DeleteOutlined, StarFilled } from "@ant-design/icons";
import { FixedSizeList as List } from "react-window";
import { useAuth } from "../Context/AuthContext";
import AppHeader from "../Header/AppHeader";

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const { api } = useAuth();

  const fetchFavourites = useCallback(async () => {
    try {
      const response = await api.get("/get-filters");
      setFavourites(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const handleUnfavorite = async (id) => {
    try {
      const response = await api.post(`/unfavorite-filter/${id}`);
      message.success(response.data.message);
      fetchFavourites();
    } catch (error) {
      console.error("Error unfavoriting item:", error);
      message.error(error.response?.data?.message ?? "Unfavorite failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/delete-filter/${id}`);
      message.success(response.data.message);
      fetchFavourites();
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error(error.response?.data?.message ?? "Deletion failed");
    }
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
      title: "Field",
      dataIndex: "key",
      key: "key",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
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

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredAndSortedFavourites = favourites
    .filter((item) => {
      const contentType = item.contentType?.toLowerCase() || "";
      const industry = item.industry?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();
      return contentType.includes(searchLower) || industry.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  const Row = ({ index, style }) => {
    const item = filteredAndSortedFavourites[index];
    return (
      <div
        style={{ ...style, borderBottom: "1px solid #303030", padding: "16px" }}
      >
        <Card
          hoverable
          onClick={() => showModal(item)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          <Title level={4}>{toTitleCase(item.contentType)}</Title>
          <Text>Industry: {toTitleCase(item.industry)}</Text>
          <br></br>
          <Space style={{ marginTop: 16 }}>
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
            <Button
              type="primary"
              icon={<StarFilled />}
              onClick={(e) => {
                e.stopPropagation();
                handleUnfavorite(item._id);
              }}
            >
              Unfavorite
            </Button>
          </Space>
        </Card>
      </div>
    );
  };

  return (
    <>
      <AppHeader />
      <div className="fav-container" style={{ padding: "24px" }}>
        <Space style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Search by content type or industry"
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
          itemCount={filteredAndSortedFavourites.length}
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
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    handleDelete(selectedItem._id);
                    handleModalClose();
                  }}
                  style={{ marginRight: 8 }}
                >
                  Delete
                </Button>
                <Button
                  type="primary"
                  icon={<StarFilled />}
                  onClick={() => handleUnfavorite(selectedItem._id)}
                >
                  Unfavorite
                </Button>
              </div>
            )
          }
          width={800}
          bodyStyle={{ maxHeight: "calc(60vh - 55px)", overflow: "auto" }}
        >
          {selectedItem && (
            <>
              <Title level={2}>{toTitleCase(selectedItem.contentType)}</Title>
              <Table
                columns={columns}
                dataSource={Object.entries(selectedItem)
                  .filter(([_, value]) => value && value.length > 0)
                  .map(([key, value]) => ({
                    key,
                    value: formatFilterValue(value),
                  }))}
                pagination={false}
                size="small"
              />
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Favourites;
