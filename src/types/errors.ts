export class XMLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "XMLParseError";
  }
}

export class XMLValidationError extends Error {
  issues: string[];
  constructor(issues: string[]) {
    super("XML validation failed");
    this.name = "XMLValidationError";
    this.issues = issues;
  }
}

export class FileProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileProcessingError";
  }
}
