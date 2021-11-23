/*!

=========================================================
* Argon Dashboard React - v1.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useState, useRef, useEffect } from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  UncontrolledTooltip,
  CardFooter,
} from "reactstrap";

// // core components
import { useKeySetData } from "../../KeySetProvider";
import { useSwissArmyData } from "../SwissArmyProvider";
import { useStopwatch } from "react-timer-hook";
import { InputLabel, MenuItem, Select } from "@material-ui/core";

const MessageGenerator = () => {
  const keySetContext = useKeySetData();
  const swissArmyContext = useSwissArmyData();

  console.log("MessageGenerator keySetContext: ", keySetContext);
  console.log("MessageGenerator swissArmyContext: ", swissArmyContext);

  const messageDefault = JSON.stringify({
    "count": "#counter#",
    "title": "Ground control to Major Tom - #counter#",
    "body": "This is ground control to Major Tom.",
    "tasks": [
      { "task": "Take your protein pills.", "priority": 1 },
      { "task": "Put your helmet on.", "priority": 2 }
    ]
  }, null, 2);


  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  
  const SINGLE = 10;
  const FILE = 20;
  const [messageStrategy, setMessageStrategy] = useState(10);
  const [sourceData, setSourceData] = useState([]);
  const [messagePayload, setMessagePayload] = useState(messageDefault);

  const [recordCount, setRecordCount] = useState(0);
  const [requestDelay, setRequestDelay] = useState(10);
  
  const [channelStrategy, setChannelStrategy] = useState(10);
  const [targetChannels, setTargetChannels] = useState("");
  const channelList = useRef([]);

  const RANDOM = 10;
  const RROBIN = 11;
  const EXTRACT = 20;
  const [uuidStrategy, setUuidStrategy] = useState(10);
  const [senderUuids, setSenderUuids] = useState("");
  const [senderUuidKey, setSenderUuidKey] = useState();
  const uuidList = useRef([]);

  const counter = useRef(0);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });


  useEffect(() => {
    var estMilli = recordCount * 150 + requestDelay * recordCount;
    setEstimatedTime(new Date(estMilli).toISOString().slice(11, 19));
  });

  const openFile = (theFile) => {
    if (theFile == null) return;

    const propFileReader = new FileReader();

    propFileReader.onload = function (e) {
      const data = JSON.parse(e.target.result);
      setSourceData(data);
      setRecordCount(data.length);
    };

    propFileReader.readAsText(theFile);
  }

  const pickTargetChannel = (i) => {
    if (channelStrategy === RANDOM) {
      return channelList.current[(Math.floor(Math.random() * (channelList.current.length)))];
    }
    else { // RROBIN
      const rem = (i + 1) % channelList.current.length;
      return channelList.current[rem];
    }
  }

  const createChannelList = () => {
    console.log("createChannelList");
    let tmp = targetChannels.replaceAll("\n", ",").replaceAll(" ", "");
    setTargetChannels(tmp);
    channelList.current = tmp.split(",").filter(Boolean);;
    console.log("    channelList:", channelList.current);
  }

  const pickSenderUuid = (i) => {
    if (uuidStrategy === RANDOM) {
      return uuidList.current[(Math.floor(Math.random() * (uuidList.current.length)))];
    }
    else if (uuidStrategy === RROBIN) {
      const rem = (i + 1) % uuidList.current.length;
      return uuidList.current[rem];
    }
    else // EXTRACT from message
      return sourceData[i][senderUuidKey];
  }

  const createUuidList = () => {
    console.log("createUuidList");
    let tmp = senderUuids.replaceAll("\n", ",").replaceAll(" ", "");
    setSenderUuids(tmp);
    uuidList.current = tmp.split(",").filter(Boolean);;
    console.log("    uuidList:", uuidList.current);
  }

  const generateMessages = async () => {
    console.log("generateMessages - setTimeout");

    setSuccessCount(0);
    setFailCount(0);
    setProgress(0);
    let i = 0

    createChannelList(targetChannels);
    createUuidList(senderUuids);

    console.log("    start timer");
    reset();
    start();

    console.log("    processMessage (first)");
    sendMessageUri(i);
  }

  const sendMessageUri = async (i) => {
    console.log("sendMessageeUri, index=", i);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const message = encodeURI(JSON.stringify(sourceData[i]));

    const channel = pickTargetChannel(i);
    console.log("    target channel: ", channel);

    const uuid = pickSenderUuid(i);
    console.log("    sender uuid: ", uuid);

    const publishUrl = `https://ps.pndsn.com/publish/${keySetContext.pubKey}/${keySetContext.subKey}/0/${channel}/0/${message}?uuid=${uuid}&pnsdk=the-toolbox-v0.2.0`;
    console.log("    pub url: ", publishUrl);

    if (i < recordCount) {
      setTimeout(async function () {
        try {
          const response = await fetch(publishUrl, { signal: controller.signal });
          console.log("response", response);

          if (!response.ok) {
            const status = `${response.status}`;
            throw new Error(status);
          }

          const result = await response.json();
          console.log("result", result);

          console.log("  success");
          setProgress((prevProgress) => (prevProgress + 1));
          setSuccessCount((prevSuccessCount) => (prevSuccessCount + 1));
        }
        catch (status) {
          console.log("  fail", JSON.stringify(status));
          setProgress((prevProgress) => (prevProgress + 1));
          setFailCount((prevFailCount) => (prevFailCount + 1));
        }
        finally {
          sendMessageUri(++i);
        }
      }, requestDelay);
    }
    else {
      console.log("    the end");
      pause();
    }
  }

  async function sendMessage(i) {
    console.log("sendMessage ", i);

    const msg = sourceData[i];

    if (i < recordCount) {
      setTimeout(async function () {
        try {
          const result = await keySetContext.pubnub.publish({
            channel: pickTargetChannel(),
            message: msg,
          });

          console.log("  success");
          setProgress((prevProgress) => (prevProgress + 1));
          setSuccessCount((prevSuccessCount) => (prevSuccessCount + 1));
        }
        catch (status) {
          console.log("  fail", JSON.stringify(status));
          setProgress((prevProgress) => (prevProgress + 1));
          setFailCount((prevFailCount) => (prevFailCount + 1));
        }
        finally {
          sendMessage(++i);
        }
      }, requestDelay);
    }
    else {
      console.log("    pause timer");
      pause();
    }
  }

  return (
    <>
      <Container className="mt--7" fluid>
        <Row className="mt-0">
          <Col className="order-xl-2">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Message Generator</h3>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col>
                      <FormGroup>
                        <InputLabel id="label-select-message-strategy"><u>Messages Source Strategy</u></InputLabel>
                        <UncontrolledTooltip
                          delay={500}
                          placement="top"
                          target="label-select-message-strategy"
                        >
                          Provide a source for the messages you want to generate:
                          1) Message File - upload a file that contains an array of JSON message payloads.
                          2) Input Message - provide a single JSON payload to be used for every published message.
                        </UncontrolledTooltip>
                        <Select
                          labelId="label-select-message-strategy"
                          id="label-select-message-strategy"
                          value={messageStrategy}
                          label="Message Payload"
                          onChange={(e) => setMessageStrategy(e.target.value)}
                        >
                          <MenuItem value={FILE}>Messages File</MenuItem>
                          <MenuItem value={SINGLE}>Input Message</MenuItem>
                        </Select>
                      </FormGroup>
                      <FormGroup>
                        {messageStrategy === FILE &&
                          <>
                            <InputLabel
                              id="label-message-file"
                              className="form-control-label"
                              htmlFor="button-open-file"
                            >
                              <u>Messages File</u>
                            </InputLabel>
                            <UncontrolledTooltip
                              delay={500}
                              placement="top"
                              target="label-message-file"
                            >
                              Upload a file that contains an array of JSON message payloads.
                            </UncontrolledTooltip>
                            <Input
                              id="button-open-file"
                              type="file"
                              onChange={(e) => openFile(e.target.files[0])}
                            />
                            <Input
                              className="form-control-alternative"
                              id="input-message-file-content"
                              type="textarea"
                              rows="17"
                              disabled
                              value={JSON.stringify(sourceData, null, 2)}
                              onChange={(e) => setMessagePayload(e.target.value)}
                            />
                          </>
                        }
                      </FormGroup>
                      <FormGroup>
                        {messageStrategy === SINGLE &&
                          <>
                            <InputLabel
                              id="label-message-entry"
                              className="form-control-label"
                              htmlFor="input-message-entry"
                            >
                              <u>Messages Payload</u>
                            </InputLabel>
                            <UncontrolledTooltip
                              delay={500}
                              placement="top"
                              target="label-message-entry"
                            >
                              Provide a single JSON payload to be used for every published message.
                            </UncontrolledTooltip>
                            <Input
                              className="form-control-alternative"
                              id="input-message-entry"
                              type="textarea"
                              rows="19"
                              value={messagePayload}
                              onChange={(e) => setMessagePayload(e.target.value)}
                            />
                          </>
                        }
                      </FormGroup>
                    </Col>
                    <Col>
                      <Row>
                        <Col>
                          <FormGroup>
                            <InputLabel
                              className="form-control-label"
                              htmlFor="input-record-count"
                            >
                              # Messages to Generate
                            </InputLabel>
                            <Input
                              className="form-control-alternative"
                              id="input-record-count"
                              type="text"
                              value={recordCount}
                              onChange={(e) => setRecordCount(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col>
                          <FormGroup>
                            <InputLabel
                              className="form-control-label"
                              htmlFor="input-request-delay"
                            >
                              Request Interval Delay (ms)
                            </InputLabel>
                            <Input
                              className="form-control-alternative"
                              id="input-request-delay"
                              type="text"
                              value={requestDelay}
                              onChange={(e) => setRequestDelay(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <FormGroup>
                            <InputLabel id="label-select-uuid-strategy"><u>Sender UUID Strategy</u></InputLabel>
                            <Select
                              labelId="label-select-uuid-strategy"
                              id="label-select-uuid-strategy"
                              value={uuidStrategy}
                              label="Sender UUID Strategy"
                              onChange={(e) => setUuidStrategy(e.target.value)}
                            >
                              <MenuItem value={RANDOM}>List - Random</MenuItem>
                              <MenuItem value={RROBIN}>List - Round Robin</MenuItem>
                              <MenuItem value={EXTRACT}>Extract from Message</MenuItem>
                            </Select>
                            <UncontrolledTooltip
                              delay={500}
                              placement="top"
                              target="label-select-uuid-strategy"
                            >
                              Choose the way sender UUID will be provided:<br />
                              1) List - Random (random selection from provided list)<br />
                              2) List - Round Robin (ordered selection from provided list),<br />
                              3) Extract from Message - specific key name in the provided messages JSON file.
                            </UncontrolledTooltip>
                          </FormGroup>
                          <FormGroup>
                            {(uuidStrategy === RANDOM || uuidStrategy === RROBIN) &&
                              <>
                                <InputLabel id="label-sender-uuids-list" className="form-control-label" htmlFor="input-sender-uuids">
                                  <u>Sender UUIDs List</u>
                                </InputLabel>
                                <UncontrolledTooltip
                                  delay={500}
                                  placement="top"
                                  target="label-sender-uuids-list"
                                >
                                  Enter the UUIDs (comma-delimited or 1 per line) you would
                                  like to be used as the sender UUID (i.e. the publisher's PubNub UUID).
                                </UncontrolledTooltip>
                                <Input
                                  className="form-control-alternative"
                                  id="input-sender-uuids"
                                  type="textarea"
                                  rows="4"
                                  value={senderUuids}
                                  onChange={(e) => setSenderUuids(e.target.value)}
                                />
                              </>
                            }
                          </FormGroup>
                          <FormGroup>
                            {uuidStrategy === EXTRACT &&
                              <>
                                <InputLabel id="label-sender-uuid-key" className="form-control-label" htmlFor="input-sender-uuid-key">
                                  <u>Enter Sender UUID JSON Key</u>
                                </InputLabel>
                                <UncontrolledTooltip
                                  delay={500}
                                  placement="top"
                                  target="label-sender-uuid-key"
                                >
                                  Enter the JSON key in the provided messages JSON file (first level only).
                                </UncontrolledTooltip>
                                <Input
                                  className="form-control-alternative"
                                  id="input-sender-uuid-key"
                                  type="text"
                                  placeholder=""
                                  value={senderUuidKey}
                                  onChange={(e) => setSenderUuidKey(e.target.value)}
                                />
                              </>
                            }
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <FormGroup>
                            <InputLabel id="label-select-channel-strategy"><u>Target Channel Strategy</u></InputLabel>
                            <Select
                              labelId="label-select-channel-strategy"
                              id="label-select-channel-strategy"
                              value={channelStrategy}
                              label="Target Channel Strategy"
                              onChange={(e) => setChannelStrategy(e.target.value)}
                            >
                              <MenuItem value={RANDOM}>List - Random</MenuItem>
                              <MenuItem value={RROBIN}>List - Round Robin</MenuItem>
                              {/* <MenuItem value={20}>Extract from Message</MenuItem> */}
                            </Select>
                            <UncontrolledTooltip
                              delay={500}
                              placement="top"
                              target="label-select-channel-strategy"
                            >
                              Choose the way target channel will be provided:<br />
                              1) List - Random (random selection from provided list)<br />
                              2) List - Round Robin (ordered selection from provided list)<br />
                              {/* 3) Extract from Message - specific key name in the provided messages JSON file. */}
                            </UncontrolledTooltip>
                          </FormGroup>
                          <FormGroup>
                            {(channelStrategy === RANDOM || channelStrategy === RROBIN) &&
                              <>
                                <InputLabel
                                  id="label-target-channels-list"
                                  className="form-control-label"
                                  htmlFor="input-target-channels"
                                >
                                  <u>Target Channels</u>
                                </InputLabel>
                                <UncontrolledTooltip
                                  delay={0}
                                  placement="top"
                                  target="label-target-channels-list"
                                >
                                  Enter the channels (comma-delimited or 1 per line) you would like send messages.
                                </UncontrolledTooltip>
                                <Input
                                  className="form-control-alternative"
                                  id="input-target-channels"
                                  type="textarea"
                                  rows="4"
                                  value={targetChannels}
                                  onChange={(e) => setTargetChannels(e.target.value)}
                                />
                              </>
                            }
                          </FormGroup>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
              <CardFooter>
                <Row>
                  <Col className="text-right">
                    <Button
                      color="danger"
                      onClick={generateMessages}
                      disabled={keySetContext.pubnub == null || targetChannels == null || targetChannels === ""}
                    >
                      Generate Messages
                    </Button>
                  </Col>
                  <Col lg="3" className="text-center">
                  </Col>
                </Row>
              </CardFooter>
              <p />
              <CardHeader>
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Process Report</h3>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col>
                    <div className="pl-lg-4">
                      <Row>
                        <InputLabel className="form-control-label" htmlFor="total-records">
                          Total
                        </InputLabel>
                      </Row>
                      <Row>
                        {progress}
                      </Row>
                    </div>
                  </Col>
                  <Col>
                    <div className="pl-lg-4">
                      <Row>
                        <InputLabel className="form-control-label" htmlFor="success-records">
                          Successes
                        </InputLabel>
                      </Row>
                      <Row>
                        {successCount}
                      </Row>
                    </div>
                  </Col>
                  <Col>
                    <div className="pl-lg-4">
                      <Row>
                        <InputLabel className="form-control-label" htmlFor="fail-records">
                          Fails
                        </InputLabel>
                      </Row>
                      <Row>
                        {failCount}
                      </Row>
                    </div>
                  </Col>
                  <Col>
                    <div className="pl-lg-4">
                      <Row>
                        <InputLabel className="form-control-label" htmlFor="elapsed-time">
                          Elapsed Time
                        </InputLabel>
                      </Row>
                      <Row>
                        {hours}h {minutes}m {seconds}s
                      </Row>
                    </div>
                  </Col>
                  <Col>
                    <div className="pl-lg-4">
                      <Row>
                        <InputLabel id="label-estimated-time" className="form-control-label" htmlFor="estimated-time">
                          <u>Estimated Time</u>
                        </InputLabel>
                        <UncontrolledTooltip
                          delay={0}
                          placement="top"
                          target="label-estimated-time"
                        >
                          Assumes an average execution time of (150ms * # of records) + (request delay * # of records).
                        </UncontrolledTooltip>
                      </Row>
                      <Row>
                        {estimatedTime}
                      </Row>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>

              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default MessageGenerator;