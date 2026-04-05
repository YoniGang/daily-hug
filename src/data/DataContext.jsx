import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../api";
import {
  defaultFeedPosts,
  defaultHappyJarItems,
  defaultGratitudeArchive,
  defaultGeneralNotes,
} from "./mockData";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [feedPosts, setFeedPosts] = useState([]);
  const [happyJarItems, setHappyJarItems] = useState([]);
  const [gratitudeArchive, setGratitudeArchive] = useState([]);
  const [generalNotes, setGeneralNotes] = useState([]);

  // Fetch all data from the API on mount
  useEffect(() => {
    api.getFeed().then(setFeedPosts);
    api.getHappyJar().then(setHappyJarItems);
    api.getGratitude().then(setGratitudeArchive);
    api.getNotes().then(setGeneralNotes);
  }, []);

  // Feed is already sorted by the server (timestamp DESC)
  const latestDailyMessage = feedPosts.find((p) => p.type === "daily-message") || null;
  // Gratitude is already sorted by the server (timestamp DESC)
  // Notes are already sorted by the server (sort_order ASC)

  const addFeedPost = useCallback(async (post) => {
    const created = await api.addFeedPost(post);
    setFeedPosts((prev) => [created, ...prev]);
  }, []);

  const addDailyMessage = useCallback(async (content, emoji) => {
    await addFeedPost({ type: "daily-message", content, emoji });
  }, [addFeedPost]);

  const addHappyJarItem = useCallback(async (item) => {
    const created = await api.addHappyJarItem(item);
    setHappyJarItems((prev) => [created, ...prev]);
  }, []);

  const deleteHappyJarItem = useCallback(async (id) => {
    await api.deleteHappyJarItem(id);
    setHappyJarItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addGratitudeEntry = useCallback(async (items) => {
    const created = await api.addGratitudeEntry(items);
    setGratitudeArchive((prev) => [created, ...prev]);
  }, []);

  const updateGratitudeEntry = useCallback(async (id, items) => {
    await api.updateGratitudeEntry(id, items);
    setGratitudeArchive((prev) =>
      prev.map((e) => (e.id === id ? { ...e, items } : e))
    );
  }, []);

  const addGeneralNote = useCallback(async (text, color) => {
    const created = await api.addNote(text, color);
    setGeneralNotes((prev) => [created, ...prev]);
  }, []);

  const updateGeneralNote = useCallback(async (id, text, color) => {
    await api.updateNote(id, text, color);
    setGeneralNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text, color } : n))
    );
  }, []);

  const deleteGeneralNote = useCallback(async (id) => {
    await api.deleteNote(id);
    setGeneralNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const reorderGeneralNotes = useCallback(async (orderedIds) => {
    // Optimistically reorder in state
    setGeneralNotes((prev) => {
      const map = new Map(prev.map((n) => [n.id, n]));
      return orderedIds.map((id) => map.get(id)).filter(Boolean);
    });
    await api.reorderNotes(orderedIds);
  }, []);

  const resetToDefaults = useCallback(async () => {
    await api.resetAll({
      feedPosts: defaultFeedPosts,
      happyJarItems: defaultHappyJarItems,
      gratitudeArchive: defaultGratitudeArchive,
      generalNotes: defaultGeneralNotes,
    });
    // Re-fetch everything from the server after reset
    const [feed, jar, grat, notes] = await Promise.all([
      api.getFeed(),
      api.getHappyJar(),
      api.getGratitude(),
      api.getNotes(),
    ]);
    setFeedPosts(feed);
    setHappyJarItems(jar);
    setGratitudeArchive(grat);
    setGeneralNotes(notes);
  }, []);

  return (
    <DataContext.Provider
      value={{
        feedPosts,
        latestDailyMessage,
        happyJarItems,
        gratitudeArchive,
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
