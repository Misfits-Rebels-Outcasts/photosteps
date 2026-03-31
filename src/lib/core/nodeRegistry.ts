import catalogData from "@/lib/schema/nodes.full.json";
import { NodeCatalogDocument, NodeDefinition } from "@/lib/core/types";

const catalog = catalogData as NodeCatalogDocument;

const byName = new Map<string, NodeDefinition>();
for (const node of catalog.nodes) {
  byName.set(node.name, node);
}

export function getNodeCatalog(): NodeCatalogDocument {
  return catalog;
}

export function getNodeDefinition(nodeName: string): NodeDefinition | undefined {
  return byName.get(nodeName);
}

export function listNodeNames(): string[] {
  return catalog.nodes.map((node) => node.name);
}

export function getNodeIntentAliases(nodeName: string): string[] {
  const node = getNodeDefinition(nodeName);
  return node?.semantic?.intentAliases ?? [];
}
