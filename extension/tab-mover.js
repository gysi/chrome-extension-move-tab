export function positionFromCommand(command) {
  const match = /^move-to-([1-9]|10)$/.exec(command);
  return match ? Number(match[1]) : null;
}

export function planMoves(tabs, activeId, position, swap) {
  const ordered = [...tabs].sort((a, b) => a.index - b.index);
  const source = ordered.find((tab) => tab.id === activeId);
  if (!source || !Number.isInteger(position) || position < 1 || position > 10) return [];
  const destination = ordered[Math.min(position, ordered.length) - 1];
  // Preserve Chrome's pinned boundary; never silently pin or unpin a tab.
  if (source.id === destination.id || source.pinned !== destination.pinned) return [];
  const moves = [{ id: source.id, index: destination.index }];
  if (swap) moves.push({ id: destination.id, index: source.index });
  return moves;
}

export async function moveActiveTab(api, command, tabId) {
  const position = positionFromCommand(command);
  if (position === null || tabId === undefined) return;
  const source = await api.tabs.get(tabId);
  const [tabs, { swap = false }] = await Promise.all([
    api.tabs.query({ windowId: source.windowId }),
    api.storage.local.get({ swap: false }),
  ]);
  const moves = planMoves(tabs, source.id, position, swap === true);
  for (const move of moves) {
    await api.tabs.move(move.id, { windowId: source.windowId, index: move.index });
  }
}
