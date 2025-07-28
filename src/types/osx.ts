export type LanguageType = "CSharp" | "VisualBasic" | string;

export interface BusinessRule {
  name: string;
  isEncrypted?: boolean | string; // fast-xml-parser may give strings
  sourceCode: string;
  businessRuleType: string;
  businessRuleLanguageType: LanguageType;
}

export interface BusinessRulesNode {
  businessRule?: BusinessRule | BusinessRule[];
}

export interface ApplicationWorkspacesRoot {
  businessRules?: BusinessRulesNode;
  workspaces?: {
    workspace?: Workspace | Workspace[];
  };
}

export interface OneStreamXF {
  // Any other roots you care about can be added here:
  extensibilityRulesRoot?: { businessRule?: BusinessRule | BusinessRule[] };
  applicationDashboardsRoot?: { businessRules?: BusinessRulesNode };
  cubeViewsRoot?: { businessRules?: BusinessRulesNode };
  dataSourcesRoot?: { businessRules?: BusinessRulesNode };
  metadataRoot?: { businessRules?: BusinessRulesNode };
  smartIntegrationRulesRoot?: { businessRule?: BusinessRule | BusinessRule[] };
  transformationRulesRoot?: { businessRules?: BusinessRulesNode };

  // New one you asked for
  applicationWorkspacesRoot?: ApplicationWorkspacesRoot;
}

export interface ParsedXML {
  OneStreamXF?: OneStreamXF;
}

/** ----- Workspaces ----- */

export interface Workspace {
  ["@_name"]?: string; // when attributes are preserved
  name?: string; // sometimes parser maps attribute to plain field
  maintenanceUnits?: {
    maintenanceUnit?: MaintenanceUnit | MaintenanceUnit[];
  };
}

export interface MaintenanceUnit {
  workspaceAssemblies?: {
    workspaceAssembly?: WorkspaceAssembly | WorkspaceAssembly[];
  };
}

export interface WorkspaceAssembly {
  ["@_name"]?: string;
  name?: string;
  files?: FilesNode;
}

export interface FilesNode {
  file?: FileNode | FileNode[];
  folder?: FolderNode | FolderNode[];
}

export interface FolderNode {
  ["@_name"]?: string;
  name?: string;
  file?: FileNode | FileNode[];
  folder?: FolderNode | FolderNode[];
}

export interface FileNode {
  ["@_name"]?: string;
  name?: string;
  sourceCode?: string | { ["#text"]: string };
  // other attributes you may want to type
}

/** ----- Utilities ----- */
export type Progress = { current: number; total: number };
export type ProgressCb = (current: number, total: number) => void;
