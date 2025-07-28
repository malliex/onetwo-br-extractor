import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import { folderStructure } from "../config/folderStructure";
import { type ParsedXML, ParsedXMLSchema } from "../schemas/osx";
import {
  extractBusinessRules,
  extractWorkspaces,
} from "../services/fileProcessor";
import { logError } from "../utils/logError";

function logValidationError(error: any) {
  console.error("Validation errors (Zod):");
  console.error(error.errors); // Zod provides .errors array with detailed issues
}

export async function parseRulesFromXml(xmlContent: string): Promise<JSZip> {
  let raw: unknown;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    raw = parser.parse(xmlContent);
  } catch (err) {
    logError(err, "XML Parsing failed");
    return new JSZip();
  }

  // Validate using Zod
  const result = ParsedXMLSchema.safeParse(raw);

  if (!result.success) {
    logValidationError(result.error);
    return new JSZip();
  }

  const parsed = result.data as ParsedXML;
  const zip = new JSZip();

  // Create the base folder structure
  for (const [mainFolder, subFolders] of Object.entries(folderStructure)) {
    const mainFolderZip = zip.folder(mainFolder);
    subFolders.forEach((sf: string) => mainFolderZip?.folder(sf));
  }

  // Extract sections
  extractBusinessRules(parsed, zip);
  extractWorkspaces(parsed, zip);

  return zip;
}
