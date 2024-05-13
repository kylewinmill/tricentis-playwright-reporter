export interface TricentisReport {
  version?: string;
  cycleName?: string;
  includeAttachments?: boolean;
  testRuns: TestRun[];
}

export interface TestRun {
  testCaseKey: string;
  status: string;
  name?: string;
  description?: string;
  priority: string;
  testCategory: string;
  testType: string;
  assignee?: string;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  components?: string[];
  labels?: string[];
  steps?: Step[];
  fields?: Field[];
  automation?: Automation;
  cycleName?: string;
}

export interface Automation {
  name?: string;
  id?: string;
  content: string;
}

export interface Field {
  schemeName: string;
  allowedValueName?: string;
  value?: string;
}

export interface Step {
  status: string;
  actualResult?: string;
  comment?: string;
  description?: string;
  expectedResult?: string;
}
