export interface ModuleDefinition {
    category: string;
    enabled: boolean;
  }

type ScriptConfig = { [k: string]: ModuleDefinition };
export default ScriptConfig;