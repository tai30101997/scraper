"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MediaItemDetail, PaginationData, QueueStats } from "./core/types";
import { api } from "./core/axios";

const limitPerPageOptions = [10, 20, 50, 100];

export default function MediaDashboard() {
  const [media, setMedia] = useState<MediaItemDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<"all" | "image" | "video">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(limitPerPageOptions[0]);

  const [urlInput, setUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "info" | "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  const [stats, setStats] = useState({ waiting: 0, active: 0 });

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/test/stats");
      setStats({ waiting: data.waiting, active: data.active });
    } catch (err) {
      console.error("Failed to fetch queue stats", err);
    }
  };

  const fetchMedia = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const { data } = await api.get("/media", {
        params: {
          page: currentPage,
          limit: limit,
          type: activeType !== "all" ? activeType : undefined,
          search: search || undefined,
        },
      });

      if (data?.success) {
        setMedia(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, activeType, search]);

  useEffect(() => {
    fetchMedia(true);
    fetchStats();

    const timer = setInterval(() => {
      fetchStats();
      setStats((current) => {
        if (current.active > 0 || current.waiting > 0) {
          fetchMedia();
        }
        return current;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchMedia]);

  const handleRunLoadTest = async () => {
    if (!confirm("Start 5,000 URL performance test?")) return;
    try {
      await api.post("/test/load-test");
      setMessage({ text: "Test triggered! 5,000 jobs enqueued.", type: "success" });
      fetchStats();
    } catch (err) {
      setMessage({ text: "Failed to trigger test.", type: "error" });
    }
  };

  const handleSubmitUrls = async () => {
    if (!urlInput.trim()) return;
    setIsSubmitting(true);
    setMessage({ text: "Submitting to engine...", type: "info" });
    try {
      const urls = urlInput.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
      await api.post("/sites/scrape", { urls });
      setMessage({ text: "Processing started!", type: "success" });
      setUrlInput("");
      fetchStats();
    } catch {
      setMessage({ text: "Submission failed.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto p-6">

        {/* TOP MONITORING BAR */}
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter italic bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex bg-white shadow-sm border border-slate-200 rounded-2xl p-1.5 items-center gap-6 px-6">
              <div className="text-center border-r border-slate-100 pr-6">
                <p className="text-[10px] font-black text-slate-400 uppercase">Waiting</p>
                <p className="text-xl font-black text-blue-600 tabular-nums">{stats.waiting.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Active</p>
                <p className={`text-xl font-black text-amber-500 tabular-nums ${stats.active > 0 ? "animate-pulse" : ""}`}>
                  {stats.active.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleRunLoadTest}
              className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              🔥 Run 5K Test
            </button>
          </div>
        </header>

        {/* INPUT AREA */}
        <section className="mb-8 group">
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200 transition-all focus-within:shadow-md focus-within:border-blue-400">
            <textarea
              rows={2}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URLs here..."
              className="w-full rounded-[1.5rem] border-none bg-slate-50 p-6 text-sm outline-none transition placeholder:font-bold placeholder:text-slate-300"
            />
            <div className="p-3 flex items-center justify-between">
              <span className="pl-4 text-[11px] font-black text-blue-500 uppercase">{message.text}</span>
              <button
                onClick={handleSubmitUrls}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-black text-xs shadow-lg transition disabled:bg-slate-200 active:scale-95 uppercase"
              >
                {isSubmitting ? "Processing..." : "Start Scrape"}
              </button>
            </div>
          </div>
        </section>

        {/* CONTROLS: SEARCH, FILTER, LIMIT */}
        <section className="flex flex-wrap gap-4 mb-8 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <span className="absolute left-4 top-3.5 text-lg opacity-20">🔍</span>
          </div>

          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1">
            {["all", "image", "video"].map((type) => (
              <button
                key={type}
                onClick={() => { setActiveType(type as any); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeType === type ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-1.5 gap-3 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Show</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer"
            >
              {limitPerPageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </section>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item, idx) => (
              <MediaCard key={idx} item={item} />
            ))}
          </div>
        )}

        {/* SMART PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4 bg-white w-fit mx-auto p-2.5 rounded-[2rem] shadow-xl border border-slate-100 font-bold">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full disabled:opacity-10 transition text-lg"
            >
              ‹
            </button>

            <div className="flex items-center gap-3 px-6 border-x border-slate-100">
              <span className="text-[10px] font-black text-slate-300 uppercase">Page</span>
              <input
                type="number"
                min={1}
                max={pagination.totalPages}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0 && val <= pagination.totalPages) setCurrentPage(val);
                }}
                className="w-14 h-9 bg-slate-100 border-none rounded-xl text-center font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
              />
              <span className="text-[10px] font-black text-slate-300 uppercase">of {pagination.totalPages}</span>
            </div>

            <button
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full disabled:opacity-10 transition text-lg"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItemDetail }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group hover:-translate-y-2">
      <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden">
        {item.type === "image" ? (
          <img src={item.url} alt="" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
          <video src={item.url} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
        )}
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-xl bg-white/80 backdrop-blur-md text-[8px] font-black text-slate-800 uppercase tracking-widest z-10 shadow-sm">
          {item.type}
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-[10px] font-black text-slate-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition leading-tight uppercase tracking-tight">
          {item.title}
        </h3>
        <p className="text-[8px] text-slate-400 font-bold truncate uppercase tracking-widest">{item.siteName}</p>
      </div>
    </div>
  );
}