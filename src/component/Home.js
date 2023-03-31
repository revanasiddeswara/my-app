import { useState, useEffect } from "react";
import { UploadOutlined,CloseOutlined } from "@ant-design/icons";
import { Button, message, Progress, Upload } from "antd";
import axios from "axios";

const Home = () => {
  const [status, setStatus] = useState("ready");
  const [progress, setProgress] = useState("");
  const [videoUrls, setVideoUrls] = useState([]);
  const [uploadingFile, setUploadingFile] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setStatus("uploading");
    const filename = file.name;
    const fileType = file.type;
    const metadata = {
      contentType: fileType,
    };

    // Get pre-signed URL from Lambda function
    try {
      const response = await axios({
        method: "GET",
        url: "https://75pdvhhn5j.execute-api.ap-southeast-2.amazonaws.com/test/getvideosignedurl",
      });
      const { uploadURL } = response.data;

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadURL, true);
      xhr.setRequestHeader("Content-Type", fileType);

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percentCompleted = Math.round(
            (event.loaded * 100) / event.total
          );
          setProgress(percentCompleted);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          setStatus("done");
          message.success(`${filename} uploaded successfully`);
          setVideoUrls([...videoUrls, uploadURL.split("?")[0]]);
        } else {
          setStatus("error");
          console.error("Error uploading file:", xhr.statusText);
          message.error(`${filename} upload failed`);
        }
      };

      xhr.onerror = function () {
        setStatus("error");
        console.error("Error uploading file:", xhr.statusText);
        message.error(`${filename} upload failed`);
      };

      xhr.send(file);
    } catch (error) {
      setStatus("error");
      console.error("Error getting pre-signed URL:", error);
    }
  };

  const handleStopUpload = () => {
    setUploading(false);
    setProgress(0);
  };
  const handleBeforeUpload = (file) => {
    setStatus("ready");
    setProgress(0);
    setUploading(false);
    setUploadingFile(file.name);
    handleUpload(file);
    return false; // disable automatic uploading
  };

  useEffect(() => {
    const storedUrls = localStorage.getItem("videoUrls");
    if (storedUrls) {
      setVideoUrls(JSON.parse(storedUrls));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("videoUrls", JSON.stringify(videoUrls));
  }, [videoUrls]);

  return (
    <div style={{ marginTop: "10%" }}>
      <h2 style={{ color: "#fff" }}>Uploaded Videos:</h2>
      <div
        style={{
          height: "150px",
          display: "inline-block",
          overflow: "auto",
          borderRadius: "2%",
          background: "#fff",
        }}
      >
        {videoUrls.length > 0 && (
          <div>
            <ul>
              {videoUrls.map((url, index) => (
                <li key={index}>
                  <video controls style={{ width: "40%", background: "#fff" }}>
                    <source src={url} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Upload.Dragger
        name="file"
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        style={{
          background: "#fff",
          padding: "2%",
          minWidth:"550px",
          width: "100%",
          height: "150px",
        }}
        className={status === "uploading" ? "ant-upload-drag-uploading" : ""}
      >
        <Button className="primary" icon={<UploadOutlined />}>
          Upload File
        </Button>
        {status === "ready" && (
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
        )}
        {status === "uploading" && (
           <div style={{ boxShadow: "3px 3px 3px 3px #9E9E9E",marginTop: "10px", display: "flex" }}>
           <div style={{ flexGrow: 1 }}>
             <p>{uploadingFile} Uploading...</p>
             <Progress
              percent={progress}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              style={{
                // position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progress}%`,
                lineHeight: "28px",
                textAlign: "center",
              }}
            >{`${progress}%`}
            </Progress>
           </div>
           <div>
             <Button icon={<CloseOutlined />} onClick={handleStopUpload} />
           </div>
         </div>
        )}
        {status === "done" && (
          <div>
            <p className="ant-upload-text">Upload successful!</p>
          </div>
        )}
        {status === "error" && (
          <div>
            <p className="ant-upload-text">Upload failed</p>
            <Button icon={<UploadOutlined />} danger>
              Try Again
            </Button>
          </div>
        )}
      </Upload.Dragger>
    </div>
  );
};

export default Home;
