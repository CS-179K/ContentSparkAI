import React, { useState, useEffect } from "react";
import { Table, Button, message, Space, Typography } from "antd";
import moment from "moment";
import {
  RedditOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../Context/AuthContext";
import AppHeader from "../Header/AppHeader";
import ReviewModal from "./ReviewModal";

const { Text } = Typography;

const ContentPerformance = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRedditLinked, setIsRedditLinked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState({});
  const [lastFetchedTime, setLastFetchedTime] = useState(null);
  const { api } = useAuth();

  const checkRedditLinkStatus = async () => {
    try {
      const response = await api.get("/check-reddit-link");
      setIsRedditLinked(response.data.isLinked);
    } catch (error) {
      console.error("Failed to check Reddit link status:", error);
    }
  };

  useEffect(() => {
    fetchContent();
    checkRedditLinkStatus();
    const intervalId = setInterval(fetchContent, 120000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Call the API to update Reddit metrics
      await api.get("/update-reddit-metrics");

      // Once metrics are updated, fetch the updated content
      const response = await api.get("/get-history");
      setContent(response.data);
      setLastFetchedTime(new Date());
    } catch (error) {
      message.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };


  const handleLinkReddit = async () => {
    try {
      const response = await api.get("/reddit-auth");
      window.location.href = response.data.url;
    } catch (error) {
      message.error("Failed to initiate Reddit authentication");
    }
  };


  const showModal = (record) => {
    console.log("Selected Record:", record);
    setSelectedContent({
      _id: record._id,
      title: record.title,
      response: record.response,
    });
    setIsModalVisible(true);
  };

  const handleEditRedditPost = async (contentId) => {
    try {
      const contentToEdit = content.find((item) => item._id === contentId);
      setSelectedContent({
        _id: contentId,
        title: contentToEdit.title,
        response: contentToEdit.response,
        postId: contentToEdit?.redditMetrics?.postId,
      });
      setIsModalVisible(true);
    } catch (error) {
      message.error("Failed to edit Reddit post");
    }
  };

  const handleDeleteRedditPost = async (contentId) => {
    try {
      await api.delete(`/delete-reddit-post/${contentId}`);
      message.success("Post deleted from Reddit successfully");
      fetchContent();
    } catch (error) {
      message.error("Failed to delete post from Reddit");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const renderValue = (value) => value || "—";
  const renderValueNumber = (value) => value || 0;

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: renderValue,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      render: (value) =>
        value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "—",
    },
    {
      title: "Posted At Reddit", // New column for UpdatedAtReddit
      dataIndex: "UpdatedAtReddit",
      key: "UpdatedAtReddit",
      sorter: (a, b) =>
        moment(a.UpdatedAtReddit).unix() - moment(b.UpdatedAtReddit).unix(),
      render: (value) =>
        value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "—",
    },
    {
      title: "Upvotes",
      dataIndex: ["redditMetrics", "upvotes"],
      key: "upvotes",
      sorter: (a, b) =>
        (a.redditMetrics?.upvotes || 0) - (b.redditMetrics?.upvotes || 0),
      render: renderValueNumber,
    },
    {
      title: "Comments",
      dataIndex: ["redditMetrics", "comments"],
      key: "comments",
      sorter: (a, b) =>
        (a.redditMetrics?.comments || 0) - (b.redditMetrics?.comments || 0),
      render: renderValueNumber,
    },
    {
      title: "Content Type",
      dataIndex: ["filters", "contentType"],
      key: "contentType",
      sorter: (a, b) =>
        (a.filters?.contentType || "").localeCompare(
          b.filters?.contentType || ""
        ),
      render: renderValue,
    },
    {
      title: "Industry",
      dataIndex: ["filters", "industry"],
      key: "industry",
      sorter: (a, b) =>
        (a.filters?.industry || "").localeCompare(b.filters?.industry || ""),
      render: renderValue,
    },
    {
      title: "Age Range",
      dataIndex: ["filters", "ageRange"],
      key: "ageRange",
      sorter: (a, b) =>
        (a.filters?.ageRange || "").localeCompare(b.filters?.ageRange || ""),
      render: renderValue,
    },
    {
      title: "Interests",
      dataIndex: ["filters", "interests"],
      key: "interests",
      sorter: (a, b) =>
        (a.filters?.interests || [])
          .join(",")
          .localeCompare((b.filters?.interests || []).join(",")),
      render: (interests) =>
        interests.length > 0 ? interests.join(", ") : "—",
    },
    {
      title: "Gender",
      dataIndex: ["filters", "gender"],
      key: "gender",
      sorter: (a, b) =>
        (a.filters?.gender || "").localeCompare(b.filters?.gender || ""),
      render: renderValue,
    },
    {
      title: "Income Level",
      dataIndex: ["filters", "incomeLevel"],
      key: "incomeLevel",
      sorter: (a, b) =>
        (a.filters?.incomeLevel || "").localeCompare(
          b.filters?.incomeLevel || ""
        ),
      render: renderValue,
    },
    {
      title: "Tone",
      dataIndex: ["filters", "tone"],
      key: "tone",
      sorter: (a, b) =>
        (a.filters?.tone || "").localeCompare(b.filters?.tone || ""),
      render: renderValue,
    },
    {
      title: "Themes",
      dataIndex: ["filters", "themes"],
      key: "themes",
      sorter: (a, b) =>
        (a.filters?.themes || [])
          .join(",")
          .localeCompare((b.filters?.themes || []).join(",")),
      render: (themes) => (themes.length > 0 ? themes.join(", ") : "—"),
    },
    {
      title: "Content Goal",
      dataIndex: ["filters", "contentGoal"],
      key: "contentGoal",
      sorter: (a, b) =>
        (a.filters?.contentGoal || "").localeCompare(
          b.filters?.contentGoal || ""
        ),
      render: renderValue,
    },
    {
      title: "Max Content Length",
      dataIndex: ["filters", "maxContentLength"],
      key: "maxContentLength",
      sorter: (a, b) =>
        (a.filters?.maxContentLength || "").localeCompare(
          b.filters?.maxContentLength || ""
        ),
      render: renderValue,
    },
    {
      title: "Language",
      dataIndex: ["filters", "language"],
      key: "language",
      sorter: (a, b) =>
        (a.filters?.language || "").localeCompare(
          b.filters?.language || "English (en)"
        ),
      render: renderValue,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.redditMetrics?.postId ? (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEditRedditPost(record._id)}
                disabled={!isRedditLinked}
              >
                Edit
              </Button>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDeleteRedditPost(record._id)}
                disabled={!isRedditLinked}
              >
                Delete
              </Button>
            </>
          ) : (
            <Button
              onClick={() => showModal(record)}
              type="primary"
              disabled={!isRedditLinked}
            >
              Post to Reddit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getLastFetchedText = () => {
    if (!lastFetchedTime) return "Never";
    return moment(lastFetchedTime).fromNow();
  };

  return (
    <>
      <AppHeader />
      <div style={{ padding: "24px" }}>
        <Space style={{ marginBottom: "20px" }}>
          <Button
            type="primary"
            icon={<RedditOutlined />}
            onClick={handleLinkReddit}
            style={{
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
            disabled={isRedditLinked}
          >
            Link Reddit Account
          </Button>
          <Text>Last fetched: {getLastFetchedText()}</Text>
        </Space>
        <Table
          columns={columns}
          dataSource={content}
          loading={loading}
          rowKey="_id"
          scroll={{ x: "max-content" }}
        />
      </div>

      <ReviewModal
        visible={isModalVisible}
        title={selectedContent.title}
        response={selectedContent.response}
        onConfirm={handleEditRedditPost}
        onCancel={handleModalCancel}
        isExistingPost={!!selectedContent?.postId}
      />
    </>
  );
};

export default ContentPerformance;



