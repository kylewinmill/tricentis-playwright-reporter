import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";
import { TestRun, TricentisReport } from "./tricentisReport";
import { envSchema } from "../envSchema";
import axios from "axios";
require("dotenv").config();

let env = envSchema.parse(process.env);
let cycleName;
class TricentisReporter implements Reporter {
  report: TricentisReport;
  constructor() {
    // if env.CYCLE is not empty use it, else use env.PROJECT_NAME
    cycleName = env.CYCLE || (env.PROJECT_NAME + new Date().toLocaleString());
    console.log(`Beginning Cycle ${cycleName}`);
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
    this.report = {
      version: env.VERSION || undefined,
      cycleName: cycleName,
      includeAttachments: false,
      testRuns: [],
    };
  }

  onTestBegin(test: TestCase) {
    //console.log(`Starting test ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // get the playwright project name
    const projectName = test.parent.project()?.name;
    console.log(
      `Finished test ${test.title} - ${projectName}: ${result.status}`
    );
    const key = test.annotations.find(
      (obj) => obj.type === "jiraKey"
    )?.description;
    // if no jiraKey annotation, log it and return
    if (!key) {
      console.log(`No Jira Key found for test ${test.title}`);
      return;
    }
    // add result.duration to result.startTime to get plannedEndDate
    const plannedEndDate = new Date(
      result.startTime.getTime() + result.duration
    );
    console.log(result.status)
    const testRun: TestRun = {
      testCaseKey: key,
      status: this.formatStatus(result.status),
      name: `${test.title} - ${projectName}`,
      priority: "Medium",
      testCategory: "Functional",
      testType: "Automated",
      plannedStartDate: result.startTime,
      plannedEndDate: plannedEndDate,
      automation: {
        id: key,
        name: test.title,
        content: test.annotations.values().toString(),
      },
      description: test.id,
    };
    this.report.testRuns.push(testRun);

    // if test failed, print test details to console
    if (result.status === "failed") {
      console.log(
        `Test ${test.title} - ${projectName} failed with error:\n${result.error}`
      );
    }
  }
  async onEnd(result: FullResult) {
    const createTestRunUrl = `https://api.ttm4j.tricentis.com/v1/projects/${env.PROJECT_KEY}/test-runs`;
    // axios post with params project-key and json body authed with Jira API token, handle response with console.log, handle error with console.log
    await axios
      .post(createTestRunUrl, this.report, {
        headers: {
          "Content-Type": "application/json",
          Authorization: env.JIRA_KEY,
        },
      })
      .then((response) => {
        console.log(
          `Test run created with name: ${response.data[0].cycle.name}`
        );
      })
      .catch((error) => {
        console.log(`Failed to report test run to Jira\n${error.toJSON()}`);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });

    console.log(`Finished the run. Status: ${result.status}`);
  }
  formatStatus(status: string): string {
    // if status is passed or failed, capitalize the whole string
    if (status === "passed" || status === "failed") {
      return status.toUpperCase();
    }
    // if status is skipped, return it as UNEXECUTED
    else if (status === "skipped") {
      return "UNEXECUTED";
    } else {
      return "FAILED";
    }
  }
}
export default TricentisReporter;
