// src/schemas/osx.ts
import { z } from "zod";

/** ---------------------- Helpers ---------------------- **/

const OneOrMany = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]);

/** ---------------------- File Structure ---------------------- **/

export const FileNodeSchema = z.object({
  name: z.string().optional(),
  sourceCode: z.string().optional(),
  fileType: z.string().optional(),
  businessRuleType: z.string().optional(),
  compilerActionType: z.string().optional(),
  isEncrypted: z.string().optional(),
});

export const FolderNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().optional(),
    file: OneOrMany(FileNodeSchema).optional(),
    folder: OneOrMany(FolderNodeSchema).optional(),
  })
);

export const FilesNodeSchema = z.object({
  file: OneOrMany(FileNodeSchema).optional(),
  folder: OneOrMany(FolderNodeSchema).optional(),
});

/** ---------------------- Workspace Hierarchy ---------------------- **/

export const WorkspaceAssemblySchema = z.object({
  name: z.string().optional(),
  files: FilesNodeSchema.optional(),
});

export const MaintenanceUnitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  workspaceAssemblies: z
    .union([
      z.object({
        workspaceAssembly: OneOrMany(WorkspaceAssemblySchema),
      }),
      z.any(), // fallback for string or malformed
    ])
    .optional(),
});

export const WorkspaceSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  accessGroup: z.string().optional(),
  maintenanceUnits: z
    .union([
      z.object({
        maintenanceUnit: OneOrMany(MaintenanceUnitSchema),
      }),
      z.any(),
    ])
    .optional(),
});

const BusinessRuleSchema = z.object({
  name: z.string(),
  sourceCode: z.string().optional(),
  businessRuleType: z.string().optional(),
  businessRuleLanguageType: z.string().optional(),
  isEncrypted: z.union([z.string(), z.boolean()]).optional(),
});

const BusinessRulesNodeSchema = z.object({
  businessRule: OneOrMany(BusinessRuleSchema),
});

export const ApplicationWorkspacesRootSchema = z.object({
  businessRules: z
    .object({
      businessRule: OneOrMany(BusinessRuleSchema),
    })
    .optional(),

  workspaces: z
    .union([
      z.object({
        workspace: OneOrMany(WorkspaceSchema),
      }),
      OneOrMany(WorkspaceSchema), // <-- handles the "raw array" fallback
    ])
    .optional(),
});

export const OneStreamXFSchema = z.object({
  applicationWorkspacesRoot: ApplicationWorkspacesRootSchema.optional(),
  extensibilityRulesRoot: z
    .object({ businessRule: OneOrMany(BusinessRuleSchema) })
    .optional(),
  applicationDashboardsRoot: z
    .object({ businessRules: BusinessRulesNodeSchema })
    .optional(),
  cubeViewsRoot: z
    .object({ businessRules: BusinessRulesNodeSchema })
    .optional(),
  dataSourcesRoot: z
    .object({ businessRules: BusinessRulesNodeSchema })
    .optional(),
  metadataRoot: z.object({ businessRules: BusinessRulesNodeSchema }).optional(),
  smartIntegrationRulesRoot: z
    .object({ businessRule: OneOrMany(BusinessRuleSchema) })
    .optional(),
  transformationRulesRoot: z
    .object({ businessRules: BusinessRulesNodeSchema })
    .optional(),
});

export const ParsedXMLSchema = z.object({
  OneStreamXF: OneStreamXFSchema,
});

/** ---------------------- Types ---------------------- **/

export type FileNode = z.infer<typeof FileNodeSchema>;
export type FolderNode = z.infer<typeof FolderNodeSchema>;
export type FilesNode = z.infer<typeof FilesNodeSchema>;
export type WorkspaceAssembly = z.infer<typeof WorkspaceAssemblySchema>;
export type MaintenanceUnit = z.infer<typeof MaintenanceUnitSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;
export type ParsedXML = z.infer<typeof ParsedXMLSchema>;
export type OneStreamXF = z.infer<typeof OneStreamXFSchema>;
