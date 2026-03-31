import { getNodeDefinition } from "@/lib/core/nodeRegistry";

export function getDefaultParams(nodeName: string): Record<string, unknown> {
  const node = getNodeDefinition(nodeName);
  if (!node?.params) return {};

  return node.params.reduce<Record<string, unknown>>((acc, param) => {
    if (param.default !== undefined) {
      acc[param.name] = param.default;
    }
    return acc;
  }, {});
}
