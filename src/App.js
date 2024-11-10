import styles from "./styles.module.scss";
import {
  Button,
  Input,
  notification,
  Space,
  Spin,
  Tag,
  Upload,
  message,
  Modal,
  Result,
  Empty,
} from "antd";
import { getInfoFromCv, getJobDetail, submitCV, uploadFile } from "./service";
import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import {
  InboxOutlined,
  LinkedinOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import Tour from "reactour";

const tourStyles = {
  width: "500px !important",
};

function App() {
  const [jobDetail, setJobDetail] = useState();
  const [csvDetail, setCsvDetail] = useState();
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);
  const [loadingGenDataCsv, setLoadingGenDataCsv] = useState(false);
  const [currentFileId, setCurrentFileId] = useState();
  const [urlLinkedin, setUrlLinkedin] = useState();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [openModalSucess, setOpenModalSuccess] = useState(false);
  const [screenShotUid, setScreenShowUid] = useState();
  const canNotReview =
    localStorage.getItem("canNotReview") === "true" ? true : false;
  const [run, setRun] = useState(canNotReview ? false : true);

  const isLinkedInUrl = (url) => {
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/;
    return linkedInRegex.test(url);
  }

  const props = {
    name: "file",
    multiple: true,
    accept: "application/pdf",
    onChange(info) {
      const { status, response } = info.file;
      if (status === "done") {
        message.success("Update File Success");
      } else if (status === "error") {
        message.error("Update File Fail");
      }
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        let formData = new FormData();
        formData.append("file", file);
        const { data } = await uploadFile(formData);
        setCurrentFileId(data?.data?.file_uid?.split(".pdf")[0]);
        setCsvDetail();
        notification.success({
          message: "Update File Success",
        });
      } catch (error) {
        console.log("error upload image: ", error);
        onError(error);
      }
    },
    fileList: [],
  };

  const handleGetJobDetail = async () => {
    if(!urlLinkedin) {
      notification.error({
        message: "Please type Linkedin url"
      })
      return
    }
    if(!isLinkedInUrl(urlLinkedin)) {
      notification.error({
       message: "Url is not Linkedin"
      })
      return
    }
    setLoadingJobDetail(true);
    try {
      const { data } = await getJobDetail({
        url: urlLinkedin,
      });
      setLoadingJobDetail(false);
      setJobDetail(data);
    } catch (e) {
      setLoadingJobDetail(false);
      notification.error({
        message: "Errors !!! Please try again",
      });
    }
  };

  const runGetCSVData = async () => {
    setLoadingGenDataCsv(true);
    try {
      const { data } = await getInfoFromCv(currentFileId);
      setLoadingGenDataCsv(false);
      setCsvDetail(data?.data);
    } catch (e) {
      setLoadingGenDataCsv(false);
      notification.error({
        message: "Errors !!! Please try again",
      });
    }
  };

  const handleSubmitSv = async () => {
    if(!urlLinkedin) {
      notification.error({
        message: "Please type Linkedin url"
      })
      return
    }

    if (!isLinkedInUrl(urlLinkedin)) {
      notification.error({
        message: "Url is not Linkedin"
      })
      return
    }

    if(!currentFileId) {
      notification.error({
        message: "Please select your CV"
      })
      return
    }
    if(!jobDetail) {
      notification.error({
        message: "Please press the Submit Job URL button"
      })
      return
    }
    if(!jobDetail?.easy_apply) {
      notification.error({
        message: "Unable to apply for this job because it does not have easy apply"
      })
      return
    }
    try {
      setLoadingSubmit(true);
      const payload = {
        cv_id: currentFileId,
        job_url: urlLinkedin,
      };
      const data = await submitCV(payload);
      setScreenShowUid(data?.screenshot_uid);
      notification.success({
        message: "Success",
      });
      setLoadingSubmit(false);
      setOpenModalSuccess(true);
    } catch (e) {
      const errText = e?.response?.data?.detail?.message;
      const regex = /'message': '([^']+)'/;
      const match = errText.match(regex);
      const message = match[1];
      setLoadingSubmit(false);
      notification.error({
        message: message,
      });
    }
  };

  const steps = [
    {
      selector: ".my-first-step",
      position: "top",
      content: (
        <div style={{ width: "800px" }}>
          Hello, this is the user guide for the website.
          <div style={{ marginTop: "10px" }}></div>
          You are using an application that automatically applies CVs to
          LinkedIn job postings 🎉.
          <div style={{ marginTop: "10px" }}></div>
          In this application, you can retrieve data from LinkedIn Jobs and
          automate the process of sending your CV using my Bot 🤖
        </div>
      ),
    },
    {
      selector: ".second-step",
      content: (
        <div>
          First, enter the job URL you want to apply to here
          <div style={{ marginTop: "10px" }}></div>
          For example:{" "}
          <a href="https://www.linkedin.com/jobs/search/?currentJobId=4059005351">
            https://www.linkedin.com/jobs/search/?currentJobId=4059005351
          </a>
        </div>
      ),
    },
    {
      selector: ".third-step",
      content: (
        <div>
          Then, click Submit.
          <div style={{ marginTop: "10px" }}></div>
          We will retrieve the job information and display it for you.
        </div>
      ),
    },
    {
      selector: ".four-step",
      content: (
        <div>The data of the job you selected will be displayed here.</div>
      ),
    },
    {
      selector: ".five-step",
      content: (
        <div>
          Then, select your CV.
          <div style={{ marginTop: "10px" }}></div>
          Once selected, your CV file will be stored in our system, and you can
          download it next to the file.
          <div style={{ marginTop: "10px" }}></div>
          After that, you can click the button below [{" "}
          <span style={{ fontWeight: "800" }}>Generate info from CV</span> ] to
          generate data about your skills from the CV.
        </div>
      ),
    },
    {
      selector: ".six-step",
      content: <div>The data of your CV will be displayed here.</div>,
    },
    {
      selector: ".seven-step",
      content: (
        <div>
          Click the Apply Now button, and our BOT will automatically submit your
          CV to the job (after completing all required forms).
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ marginTop: "20px" }}>
              <Button
                onClick={() => {
                  setRun(false);
                  localStorage.setItem("canNotReview", true);
                }}
                type="primary"
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div style={{fontSize: "30px", textAlign: "center", marginTop: "20px", marginBottom: "20px"}}>
        LINKEDIN JOB BOT 🤖
      </div>
      <div style={{fontSize: "13px", fontStyle: "italic", textAlign: "center", marginBottom: "20px", color: "grey"}}>
        An automated LinkedIn Job application system, this system uses my cookies to perform actions for retrieving job data and submitting CVs.
      </div>
      <div style={{display: "flex", justifyContent: "center", marginTop: "30px", marginBottom: "20px"}}>
        <Button type="primary" onClick={() => setRun(true)} className={styles.baseButton}>View the user guide</Button>
      </div>
      <div className="first-step" style={{ width: "100%" }}></div>
      <div className={styles.pageContent}>
        <div>
          <Space.Compact style={{ width: "100%" }}>
            <div className="second-step" style={{ width: "100%" }}>
              <Input
                placeholder="Input your LinkedIn Job URL"
                onChange={(e) => setUrlLinkedin(e.target.value)}
                className={styles.inputCss}
              />
            </div>
            <div className="third-step">
              <Button
                loading={loadingJobDetail}
                className={styles.baseButton}
                onClick={handleGetJobDetail}
                type="primary"
              >
                Confirm
              </Button>
            </div>
          </Space.Compact>
        </div>
        {jobDetail && (
          <div>
            <div className={styles.jobDataGroup}>
              {loadingJobDetail ? (
                <Spin></Spin>
              ) : (
                <div>
                  <div className={styles.jobHeader}>
                    <img src={jobDetail?.company_img_url}></img>
                    <div className={styles.jobInfo}>
                      <a
                        href={jobDetail?.job_url}
                        target="_blank"
                        className={styles.jobName}
                      >
                        {jobDetail?.job_title}
                      </a>
                      <div className={styles.companyName}>
                        <div className={styles.label}>Company: </div>
                        <a
                          href={jobDetail?.company_url}
                          target="_blank"
                          className={styles.link}
                        >
                          {jobDetail?.company_url}
                        </a>
                      </div>
                      <div className={styles.companyName}>
                        <div className={styles.label}>Job Id: </div>
                        <div>{jobDetail?.jobId}</div>
                      </div>
                      <div className={styles.companyName}>
                        <div className={styles.label}>Location: </div>
                        <div>{jobDetail?.location}</div>
                      </div>
                      <div className={styles.companyName}>
                        <div className={styles.label2}>
                          Skill (generate by Gemini AI):{" "}
                        </div>
                        <div>
                          {jobDetail?.skills?.skills?.map((item) => (
                            <Tag style={{ marginTop: "5px" }} color="blue">
                              {item}
                            </Tag>
                          ))}
                        </div>
                      </div>
                      <div className={styles.companyName}>
                        <div className={styles.label}>Easy Apply: </div>
                        <div>
                          {jobDetail?.easy_apply && (
                            <Button type="primary">Easy Apply</Button>
                          )}
                        </div>
                      </div>
                      <div className={styles.description}>
                        <div className={styles.label}>Description: </div>
                        <div
                          className={styles.stepDesc}
                          dangerouslySetInnerHTML={{
                            __html: jobDetail?.description_raw,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {!jobDetail && (
          <div
            className="four-step"
            style={{
              marginTop: "20px",
              boxShadow: "0px 4px 12px 4px rgba(0, 0, 0, 0.05)",
              borderRadius: "0px",
              padding: "20px"
            }}
          >
            <Empty />
          </div>
        )}
        <div className={styles.uploadCsv}>
          <div className={styles.groupCsv}>
            <div className="five-step">
              <Upload {...props}>
                <Button  className={styles.inputCss} icon={<UploadOutlined />}>
                  Click to upload your CV (PDF)
                </Button>
              </Upload>
            </div>
            {currentFileId && (
              <div>
                {currentFileId === "False" ? (
                  <div className={styles.successText}>
                    <a>Err</a>
                  </div>
                ) : (
                  <div className={styles.successText}>
                    <a
                      href={`${process.env.REACT_APP_API_KEY}/download/${currentFileId}`}
                    >{`${currentFileId}.pdf`}</a>
                  </div>
                )}
              </div>
            )}
          </div>
          {currentFileId && (
            <div className={styles.btnGenPdf}>
              <Button
                onClick={runGetCSVData}
                className={styles.inputCss}
                type="primary"
                loading={loadingGenDataCsv}
              >
                Generate info from CV
              </Button>
            </div>
          )}

          {csvDetail && (
            <div>
              <div className={styles.jobDataGroup}>
                {loadingGenDataCsv ? (
                  <Spin></Spin>
                ) : (
                  <div>
                    <div className={styles.cvName}>
                      Hi <span>{csvDetail?.username}</span>, below are some
                      skills that we generated using AI based on your CV.
                    </div>
                    <div>
                      {csvDetail?.skills?.map((item) => (
                        <Tag style={{ marginTop: "5px" }} color="blue">
                          {item}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!csvDetail && (
            <div
              className="six-step"
              style={{
                marginTop: "20px",
                boxShadow: "0px 4px 12px 4px rgba(0, 0, 0, 0.05)",
                borderRadius: "0px",
                padding: "20px"
              }}
            >
              <Empty />
            </div>
          )}
        </div>
        {!loadingSubmit ? (
          <div className={`${styles.applyGroup} seven-step`}>
            <Button
              loading={false}
              onClick={handleSubmitSv}
              className={styles.applyBtn}
              type="primary"
            >
              Apply now
            </Button>
          </div>
        ) : (
          <div>
            <div style={{fontSize: "13px", fontStyle: "italic", textAlign: "center", marginTop: "20px", color: "grey"}}>Please wait a moment; the completion speed depends on the number of questions in the application form that the bot needs to complete.</div>
            <div className={styles.loaderCompo}>
              <div className={styles.loader}></div>
            </div>
          </div>
        )}
        <Modal
          open={openModalSucess}
          width={1000}
          footer={false}
          onCancel={() => setOpenModalSuccess(false)}
          onOk={() => setOpenModalSuccess(false)}
        >
          <Result
            status="success"
            title="Successfully Apply Job"
            subTitle="View your apply capture"
            extra={[
              <div>
                <img
                  style={{
                    width: "900px",
                  }}
                  src={`${process.env.REACT_APP_API_KEY}/capture/${screenShotUid}`}
                />
              </div>,
            ]}
          />
        </Modal>
      </div>
      {(!canNotReview || run) && (
        <Tour
          steps={steps}
          isOpen={run}
          onRequestClose={() => {
            setRun(false);
            localStorage.setItem("canNotReview", true);
          }}
          styles={tourStyles}
          className={styles.reactour_helper_large}
        />
      )}
      <div></div>
    </div>
  );
}

export default App;
