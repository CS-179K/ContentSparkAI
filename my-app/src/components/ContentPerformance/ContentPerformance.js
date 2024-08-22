import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import moment from "moment";
import { RedditOutlined } from "@ant-design/icons";
import { useAuth } from "../Context/AuthContext";
import AppHeader from "../Header/AppHeader";

const ContentPerformance = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRedditLinked, setIsRedditLinked] = useState(false);
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

  const handlePostToReddit = async (contentId) => {
    setLoading(true);
    try {
      await api.post(`/post-to-reddit/${contentId}`);
      message.success("Content posted to Reddit successfully");
      fetchContent();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(
          "Reddit account not linked. Please link your account first."
        );
      } else {
        message.error("Failed to post content to Reddit");
      }
    } finally {
      setLoading(false);
    }
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
        <Button
          onClick={() => handlePostToReddit(record._id)}
          disabled={record.redditMetrics?.postId}
        >
          {record.redditMetrics?.postId ? "Posted" : "Post to Reddit"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <AppHeader />
      <div style={{ padding: "24px" }}>
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
        <Table
          columns={columns}
          dataSource={content}
          loading={loading}
          rowKey="_id"
          scroll={{ x: "max-content" }}
        />
      </div>
    </>
  );
};

export default ContentPerformance;
