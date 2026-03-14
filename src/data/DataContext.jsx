import { createContext, useContext, useState, useCallback } from "react";
import {
  defaultFeedPosts,
  defaultHappyJarItems,
  defaultGratitudeArchive,
  defaultGeneralNotes,
} from "./mockData";

const STORAGE_KEY_FEED = "dailyhug_feed";
const STORAGE_KEY_JAR = "dailyhug_jar";
const STORAGE_KEY_GRATITUDE = "dailyhug_gratitude";
const STORAGE_KEY_NOTES = "dailyhug_notes";

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return fallback;
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* quota exceeded — silently fail */ }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [feedPosts, setFeedPosts] = useState(
    () => loadFromStorage(STORAGE_KEY_FEED, defaultFeedPosts)
  );
  const [happyJarItems, setHappyJarItems] = useState(
    () => loadFromStorage(STORAGE_KEY_JAR, defaultHappyJarItems)
  );
  const [gratitudeArchive, setGratitudeArchive] = useState(
    () => loadFromStorage(STORAGE_KEY_GRATITUDE, defaultGratitudeArchive)
  );
  const [generalNotes, setGeneralNotes] = useState(
    () => loadFromStorage(STORAGE_KEY_NOTES, defaultGeneralNotes)
  );

  const sortedFeed = [...feedPosts].sort((a, b) => b.timestamp - a.timestamp);
  const latestDailyMessage = sortedFeed.find((p) => p.type === "daily-message") || null;
  const sortedGratitude = [...gratitudeArchive].sort((a, b) => b.timestamp - a.timestamp);
  // Notes preserve manual order (no auto-sort) to support reordering

  const addFeedPost = useCallback((post) => {
    setFeedPosts((prev) => {
      const next = [{ ...post, id: `p-${Date.now()}`, timestamp: Date.now() }, ...prev];
      saveToStorage(STORAGE_KEY_FEED, next);
      return next;
    });
  }, []);

  const addDailyMessage = useCallback((content, emoji) => {
    addFeedPost({ type: "daily-message", content, emoji });
  }, [addFeedPost]);

  const addHappyJarItem = useCallback((item) => {
    setHappyJarItems((prev) => {
      const next = [{ ...item, id: `hj-${Date.now()}` }, ...prev];
      saveToStorage(STORAGE_KEY_JAR, next);
      return next;
    });
  }, []);

  const deleteHappyJarItem = useCallback((id) => {
    setHappyJarItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToStorage(STORAGE_KEY_JAR, next);
      return next;
    });
  }, []);

  const addGratitudeEntry = useCallback((items) => {
    setGratitudeArchive((prev) => {
      const entry = { id: `g-${Date.now()}`, items, timestamp: Date.now() };
      const next = [entry, ...prev];
      saveToStorage(STORAGE_KEY_GRATITUDE, next);
      return next;
    });
  }, []);

  const updateGratitudeEntry = useCallback((id, items) => {
    setGratitudeArchive((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, items } : e));
      saveToStorage(STORAGE_KEY_GRATITUDE, next);
      return next;
    });
  }, []);

  const addGeneralNote = useCallback((text, color) => {
    setGeneralNotes((prev) => {
      const note = { id: `n-${Date.now()}`, text, color, timestamp: Date.now() };
      const next = [note, ...prev];
      saveToStorage(STORAGE_KEY_NOTES, next);
      return next;
    });
  }, []);

  const updateGeneralNote = useCallback((id, text, color) => {
    setGeneralNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, text, color } : n));
      saveToStorage(STORAGE_KEY_NOTES, next);
      return next;
    });
  }, []);

  const deleteGeneralNote = useCallback((id) => {
    setGeneralNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveToStorage(STORAGE_KEY_NOTES, next);
      return next;
    });
  }, []);

  const reorderGeneralNotes = useCallback((orderedIds) => {
    setGeneralNotes((prev) => {
      const map = new Map(prev.map((n) => [n.id, n]));
      const next = orderedIds.map((id) => map.get(id)).filter(Boolean);
      saveToStorage(STORAGE_KEY_NOTES, next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setFeedPosts(defaultFeedPosts);
    setHappyJarItems(defaultHappyJarItems);
    setGratitudeArchive(defaultGratitudeArchive);
    setGeneralNotes(defaultGeneralNotes);
    saveToStorage(STORAGE_KEY_FEED, defaultFeedPosts);
    saveToStorage(STORAGE_KEY_JAR, defaultHappyJarItems);
    saveToStorage(STORAGE_KEY_GRATITUDE, defaultGratitudeArchive);
    saveToStorage(STORAGE_KEY_NOTES, defaultGeneralNotes);
  }, []);

  return (
    <DataContext.Provider
      value={{
        feedPosts: sortedFeed,
        latestDailyMessage,
        happyJarItems,
        gratitudeArchive: sortedGratitude,
        generalNotes,
        addFeedPost,
        addDailyMessage,
        addHappyJarItem,
        deleteHappyJarItem,
        addGratitudeEntry,
        updateGratitudeEntry,
        addGeneralNote,
        updateGeneralNote,
        deleteGeneralNote,
        reorderGeneralNotes,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
