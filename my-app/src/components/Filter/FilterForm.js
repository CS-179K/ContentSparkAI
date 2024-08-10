import React from "react";
import { Form, Select, Button, Card, Row, Col } from "antd";

const { Option } = Select;

const FilterForm = ({ onSave }) => {
  const [form] = Form.useForm();

  const handleSave = (values) => {
    onSave(values, true);
  };

  const handleChange = (values) => {
    onSave(values, false);
  };

  return (
    <Card
      title="Content Generation Filters"
      style={{ maxHeight: "calc(100vh - 104px)", overflow: "auto" }}
    >
      <Form form={form} onFinish={handleSave} onValuesChange={handleChange} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contentType" label="Type of Content" required>
              <Select placeholder="Select content type" showSearch>
                <Option value="blog Posts">Blog Posts</Option>
                <Option value="ad Campaigns">Ad Campaigns</Option>
                <Option value="social Media Posts">Social Media Posts</Option>
                <Option value="product Descriptions">
                  Product Descriptions
                </Option>
                <Option value="email Newsletters">Email Newsletters</Option>
                <Option value="press Releases">Press Releases</Option>
                <Option value="white Papers">White Papers</Option>
                <Option value="video Scripts">Video Scripts</Option>
                <Option value="podcast Outlines">Podcast Outlines</Option>
                <Option value="landing Pages">Landing Pages</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="industry" label="Industry/Category" required>
              <Select placeholder="Select industry" showSearch>
                <Option value="technology">Technology</Option>
                <Option value="fashion">Fashion</Option>
                <Option value="foodBeverage">Food & Beverage</Option>
                <Option value="healthcare">Healthcare</Option>
                <Option value="finance">Finance</Option>
                <Option value="education">Education</Option>
                <Option value="entertainment">Entertainment</Option>
                <Option value="travel">Travel & Tourism</Option>
                <Option value="automotive">Automotive</Option>
                <Option value="realEstate">Real Estate</Option>
                <Option value="sports">Sports & Fitness</Option>
                <Option value="beauty">Beauty & Cosmetics</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ageRange" label="Age Range of Audience">
              <Select placeholder="Select age range" showSearch>
                <Option value="under 13">Under 13</Option>
                <Option value="13-17">13-17</Option>
                <Option value="18-24">18-24</Option>
                <Option value="25-34">25-34</Option>
                <Option value="35-44">35-44</Option>
                <Option value="45-54">45-54</Option>
                <Option value="55+">55+</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="interests" label="Audience Interests">
              <Select mode="multiple" placeholder="Select interests" showSearch>
                <Option value="gaming">Gaming</Option>
                <Option value="travel">Travel</Option>
                <Option value="fitness">Fitness</Option>
                <Option value="technology">Technology</Option>
                <Option value="cooking">Cooking</Option>
                <Option value="fashion">Fashion</Option>
                <Option value="music">Music</Option>
                <Option value="movies">Movies & TV</Option>
                <Option value="books">Books & Literature</Option>
                <Option value="sports">Sports</Option>
                <Option value="art">Art & Design</Option>
                <Option value="photography">Photography</Option>
                <Option value="diy">DIY & Crafts</Option>
                <Option value="gardening">Gardening</Option>
                <Option value="investing">Investing</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="Gender">
              <Select placeholder="Select gender" showSearch>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="all">All</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="incomeLevel" label="Income Level">
              <Select placeholder="Select income level" showSearch>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tone" label="Tone of Content">
              <Select placeholder="Select tone" showSearch>
                <Option value="professional">Professional</Option>
                <Option value="casual">Casual</Option>
                <Option value="humorous">Humorous</Option>
                <Option value="inspirational">Inspirational</Option>
                <Option value="formal">Formal</Option>
                <Option value="friendly">Friendly</Option>
                <Option value="authoritative">Authoritative</Option>
                <Option value="empathetic">Empathetic</Option>
                <Option value="urgent">Urgent</Option>
                <Option value="nostalgic">Nostalgic</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="themes" label="Themes/Keywords">
              <Select
                mode="tags"
                placeholder="Enter themes or keywords"
                showSearch
              >
                <Option value="sustainability">Sustainability</Option>
                <Option value="innovation">Innovation</Option>
                <Option value="community">Community</Option>
                <Option value="wellness">Wellness</Option>
                <Option value="digitalTransformation">
                  Digital Transformation
                </Option>
                <Option value="diversity">Diversity & Inclusion</Option>
                <Option value="artificialIntelligence">
                  Artificial Intelligence
                </Option>
                <Option value="customerExperience">Customer Experience</Option>
                <Option value="remoteWork">Remote Work</Option>
                <Option value="cybersecurity">Cybersecurity</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contentGoal" label="Content Goal">
              <Select placeholder="Select content goal" showSearch>
                <Option value="brandAwareness">Brand Awareness</Option>
                <Option value="leadGeneration">Lead Generation</Option>
                <Option value="educational">Educational</Option>
                <Option value="entertainment">Entertainment</Option>
                <Option value="customerRetention">Customer Retention</Option>
                <Option value="productLaunch">Product Launch</Option>
                <Option value="thoughtLeadership">Thought Leadership</Option>
                <Option value="salesConversion">Sales Conversion</Option>
                <Option value="communityEngagement">
                  Community Engagement
                </Option>
                <Option value="customerSupport">Customer Support</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxContentLength"
              label="Content Length (max words)"
            >
              <Select placeholder="Select Max Content Length" showSearch>
                <Option value="short">Short</Option>
                <Option value="medium">Medium</Option>
                <Option value="long">Long</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="language" label="Language">
          <Select placeholder="Select language" showSearch>
            <Option value="Arabic (ar)">Arabic (ar)</Option>
            <Option value="Bengali (bn)">Bengali (bn)</Option>
            <Option value="Bulgarian (bg)">Bulgarian (bg)</Option>
            <Option value="Chinese (zh)">
              Chinese (Simplified and Traditional) (zh)
            </Option>
            <Option value="Croatian (hr)">Croatian (hr)</Option>
            <Option value="Czech (cs)">Czech (cs)</Option>
            <Option value="Danish (da)">Danish (da)</Option>
            <Option value="Dutch (nl)">Dutch (nl)</Option>
            <Option value="English (en)">English (en)</Option>
            <Option value="Estonian (et)">Estonian (et)</Option>
            <Option value="Finnish (fi)">Finnish (fi)</Option>
            <Option value="French (fr)">French (fr)</Option>
            <Option value="German (de)">German (de)</Option>
            <Option value="Greek (el)">Greek (el)</Option>
            <Option value="Hebrew (iw)">Hebrew (iw)</Option>
            <Option value="Hindi (hi)">Hindi (hi)</Option>
            <Option value="Hungarian (hu)">Hungarian (hu)</Option>
            <Option value="Indonesian (id)">Indonesian (id)</Option>
            <Option value="Italian (it)">Italian (it)</Option>
            <Option value="Japanese (ja)">Japanese (ja)</Option>
            <Option value="Korean (ko)">Korean (ko)</Option>
            <Option value="Latvian (lv)">Latvian (lv)</Option>
            <Option value="Lithuanian (lt)">Lithuanian (lt)</Option>
            <Option value="Norwegian (no)">Norwegian (no)</Option>
            <Option value="Polish (pl)">Polish (pl)</Option>
            <Option value="Portuguese (pt)">Portuguese (pt)</Option>
            <Option value="Romanian (ro)">Romanian (ro)</Option>
            <Option value="Russian (ru)">Russian (ru)</Option>
            <Option value="Serbian (sr)">Serbian (sr)</Option>
            <Option value="Slovak (sk)">Slovak (sk)</Option>
            <Option value="Slovenian (sl)">Slovenian (sl)</Option>
            <Option value="Spanish (es)">Spanish (es)</Option>
            <Option value="Swahili (sw)">Swahili (sw)</Option>
            <Option value="Swedish (sv)">Swedish (sv)</Option>
            <Option value="Thai (th)">Thai (th)</Option>
            <Option value="Turkish (tr)">Turkish (tr)</Option>
            <Option value="Ukrainian (uk)">Ukrainian (uk)</Option>
            <Option value="Vietnamese (vi)">Vietnamese (vi)</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Filters
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FilterForm;
