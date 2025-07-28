import JSZip from "jszip";
import { ruleTypeToFolderName } from "../config/folderStructure";
import { pathMap } from "../config/rulePathMap";
import type {
  BusinessRule,
  MaintenanceUnit,
  ParsedXML,
  Workspace,
  WorkspaceAssembly,
} from "../schemas/osx";
import { FileProcessingError } from "../types/errors";
import type { ProgressCb } from "../types/osx";
import { getValueByPath } from "../utils/getValueByPath";
import { logError } from "../utils/logError";
import { parseRulesFromXml } from "./parseRules";

/* ---------------------- Helpers ---------------------- */

// Convert a value to an array
function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export async function processSingleXml(
  file: File,
  onProgressUpdate?: ProgressCb
): Promise<Blob> {
  try {
    const text = await file.text();
    onProgressUpdate?.(0, 1);

    const zip = await parseRulesFromXml(text);
    onProgressUpdate?.(1, 1);

    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
  } catch (err) {
    throw new FileProcessingError(
      "Failed to process XML: " +
        (err instanceof Error ? err.message : String(err))
    );
  }
}

export async function processZipFile(
  file: File,
  onProgressUpdate?: ProgressCb
): Promise<Blob> {
  const zip = await JSZip.loadAsync(file);
  const newZip = new JSZip();

  const entries = Object.values(zip.files).filter((f) =>
    f.name.endsWith(".xml")
  );
  const total = entries.length;

  for (let i = 0; i < total; i++) {
    const entry = entries[i];
    try {
      const content = await entry.async("text");
      const processedZip = await parseRulesFromXml(content);
      processedZip.forEach((relativePath, zipObj) => {
        newZip.file(relativePath, zipObj.async("blob"));
      });
    } catch (err) {
      console.warn(`Skipping ${entry.name}: ${err}`);
    }
    onProgressUpdate?.(i + 1, total);
  }

  return await newZip.generateAsync({ type: "blob" });
}

/* ---------------------- Business Rules ---------------------- */

export function extractBusinessRules(parsed: ParsedXML, zip: JSZip) {
  const root = zip.folder("MyProject");
  if (!root) return;

  const xf = parsed.OneStreamXF;
  if (!xf) return;

  for (const [sourceKey, path] of Object.entries(pathMap)) {
    const rules = toArray<BusinessRule>(getValueByPath(xf, path));
    if (!rules.length) continue;

    rules.forEach((rule, idx) => {
      try {
        const ruleName = rule.name || `${sourceKey}_Rule_${idx}`;
        const ruleType = rule.businessRuleType || "Unknown";

        const folderName =
          ruleTypeToFolderName[ruleType as keyof typeof ruleTypeToFolderName] ??
          "99.Unknown";

        const folder = root.folder(folderName);
        folder?.file(`${ruleName}.txt`, rule.sourceCode || "");
      } catch (err) {
        logError(err, `Failed to process ${sourceKey} rule at index ${idx}`);
      }
    });
  }
}

/* ---------------------- Workspaces ---------------------- */

export function extractWorkspaces(parsed: ParsedXML, zip: JSZip) {
  const wsNode = parsed.OneStreamXF?.applicationWorkspacesRoot?.workspaces;
  if (!wsNode) return;

  let workspaces: Workspace[] = [];
  if (Array.isArray(wsNode)) {
    workspaces = wsNode;
  } else if (wsNode && typeof wsNode === "object" && "workspace" in wsNode) {
    const wsContainer = wsNode as { workspace?: Workspace | Workspace[] };
    workspaces = toArray(wsContainer.workspace);
  }

  if (workspaces.length === 0) return;

  const wsZipRoot = zip.folder("MyProject")?.folder("00.Workspaces");
  if (!wsZipRoot) return;

  workspaces.forEach((ws, wsIndex) => {
    try {
      const workspaceName = ws.name || `Workspace_${wsIndex}`;
      const wsFolder = wsZipRoot.folder(workspaceName);
      if (!wsFolder) return;

      const maintenanceUnits = toArray<MaintenanceUnit>(
        ws.maintenanceUnits?.maintenanceUnit
      );

      maintenanceUnits.forEach((mu, muIndex) => {
        try {
          const assemblies = toArray<WorkspaceAssembly>(
            mu.workspaceAssemblies?.workspaceAssembly
          );
          assemblies.forEach((assembly, asIndex) => {
            try {
              const assemblyName = assembly.name || `Assembly_${asIndex}`;
              const assemblyFolder = wsFolder.folder(assemblyName);
              if (!assemblyFolder) return;
              writeFilesTree(assembly.files, assemblyFolder);
            } catch (err) {
              logError(
                err,
                `Failed assembly index ${asIndex} in workspace ${workspaceName}`
              );
            }
          });
        } catch (err) {
          logError(
            err,
            `Failed maintenance unit ${muIndex} in workspace ${workspaceName}`
          );
        }
      });
    } catch (err) {
      logError(err, `Failed workspace index ${wsIndex}`);
    }
  });
}

/* ---------------------- File Writer ---------------------- */

function writeFilesTree(filesNode: any, zipFolder: JSZip) {
  if (!filesNode) return;

  const files = toArray(filesNode.file);
  files.forEach((file, index) => {
    try {
      const fileName = file.name || `File_${index}.txt`;
      zipFolder.file(fileName, file.sourceCode || "");
    } catch (err) {
      logError(err, `Failed to write file index ${index}`);
    }
  });

  const folders = toArray(filesNode.folder);
  folders.forEach((folder, index) => {
    try {
      const subFolder = zipFolder.folder(folder.name || `Folder_${index}`);
      if (subFolder) writeFilesTree(folder, subFolder);
    } catch (err) {
      logError(err, `Failed to write folder index ${index}`);
    }
  });
}
