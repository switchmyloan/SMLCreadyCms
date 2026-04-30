import React, { useEffect, useState, useMemo, useRef } from "react";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import { maskPhone } from "../../../utils/maskPhone";
import {
  getCreditCardClicks,
  getAllCreditCardClicks,
  getAllCreditCardsMaster,
} from "../../../api-services/Modules/CreditCardClickApi";
import {
  Search,
  Download,
  RefreshCcw,
  MousePointerClick,
  Users,
  UserCheck,
  Ghost,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Filter,
} from "lucide-react";

const imageUrl = import.meta.env.VITE_IMAGE_URL;

const BANK_THEMES = {
  sbm: { from: "#4f46e5", to: "#7c3aed", glow: "rgba(99,102,241,0.4)" },
  "indian overseas": { from: "#0f766e", to: "#14b8a6", glow: "rgba(20,184,166,0.4)" },
  hdfc: { from: "#dc2626", to: "#f97316", glow: "rgba(239,68,68,0.4)" },
  cready: { from: "#d97706", to: "#f59e0b", glow: "rgba(251,191,36,0.4)" },
};
const DEFAULT_THEME = { from: "#6366f1", to: "#8b5cf6", glow: "rgba(99,102,241,0.3)" };
const getBankTheme = (bank) => {
  if (!bank) return DEFAULT_THEME;
  const b = bank.toLowerCase();
  const key = Object.keys(BANK_THEMES).find((k) => b.includes(k));
  return key ? BANK_THEMES[key] : DEFAULT_THEME;
};

const CreditCardClicks = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [masterCards, setMasterCards] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ limit: 10, page_no: 1 });

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCard, setFilterCard] = useState("");
  const [filterType, setFilterType] = useState("");

  // Drawer state
  const [selectedCard, setSelectedCard] = useState(null);
  const drawerRef = useRef(null);

  const fetchClicks = async () => {
    setLoading(true);
    try {
      const [pageRes, allRes, masterRes] = await Promise.all([
        getCreditCardClicks(query.page_no, query.limit),
        allData.length === 0 ? getAllCreditCardClicks() : Promise.resolve(null),
        masterCards.length === 0 ? getAllCreditCardsMaster() : Promise.resolve(null),
      ]);
      if (pageRes?.data?.success) {
        const rows = pageRes.data.data.rows;
        setData(Array.isArray(rows) ? rows : []);
        setTotalDataCount(pageRes.data.data.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching credit card clicks");
        setData([]);
      }
      if (allRes?.data?.success) setAllData(allRes.data.data.rows || []);
      if (masterRes?.data?.success) setMasterCards(masterRes.data.data.rows || []);
    } catch (error) {
      console.error("Error fetching:", error);
      ToastNotification.error("Failed to fetch credit card clicks");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClicks(); }, [query.page_no]);

  const masterLookup = useMemo(() => {
    const map = {};
    masterCards.forEach((mc) => { map[mc.name?.toLowerCase()] = mc; });
    return map;
  }, [masterCards]);

  const analytics = useMemo(() => {
    if (!allData.length) return { cardStats: [], totalClicks: 0, uniqueUsers: 0, anonymousUsers: 0 };
    let totalClicks = 0, uniqueUsers = 0, anonymousUsers = 0;
    const cardMap = {};
    allData.forEach((row) => {
      if (row.principal_xid) uniqueUsers++; else anonymousUsers++;
      (row.clicked_cards || []).forEach((card) => {
        totalClicks++;
        const key = `${card.card_name}___${card.bank}`;
        if (!cardMap[key]) cardMap[key] = { card_name: card.card_name, bank: card.bank, count: 0, users: new Set() };
        cardMap[key].count++;
        cardMap[key].users.add(row.principal_xid || row.ipAddress);
      });
    });
    const cardStats = Object.values(cardMap).map((c) => ({ ...c, uniqueUsers: c.users.size })).sort((a, b) => b.count - a.count);
    return { cardStats, totalClicks, uniqueUsers, anonymousUsers };
  }, [allData]);

  // Filtered table data
  const filteredData = useMemo(() => {
    let rows = data;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter((row) => {
        const name = `${row.principal?.firstName || ""} ${row.principal?.lastName || ""}`.toLowerCase();
        const email = (row.principal?.emailAddress || "").toLowerCase();
        const phone = (row.principal?.phoneNumber || "").toLowerCase();
        const ip = (row.ipAddress || "").toLowerCase();
        return name.includes(term) || email.includes(term) || phone.includes(term) || ip.includes(term);
      });
    }
    if (filterCard) {
      rows = rows.filter((row) => (row.clicked_cards || []).some((c) => c.card_name === filterCard));
    }
    if (filterType === "logged_in") {
      rows = rows.filter((row) => row.principal_xid);
    } else if (filterType === "anonymous") {
      rows = rows.filter((row) => !row.principal_xid);
    }
    return rows;
  }, [data, searchTerm, filterCard, filterType]);

  const uniqueCardNames = useMemo(() => {
    const names = new Set();
    allData.forEach((row) => (row.clicked_cards || []).forEach((c) => names.add(c.card_name)));
    return [...names].sort();
  }, [allData]);

  const handleExport = () => {
    if (!allData.length) return;
    const csvRows = [["Name", "Email", "Phone", "IP Address", "Card Name", "Bank", "Clicked At"]];
    allData.forEach((row) => {
      const name = `${row.principal?.firstName || ""} ${row.principal?.lastName || ""}`.trim() || "Anonymous";
      const email = row.principal?.emailAddress || "";
      const phone = row.principal?.phoneNumber || "";
      const ip = row.ipAddress || "";
      (row.clicked_cards || []).forEach((card) => {
        csvRows.push([name, email, phone, ip, card.card_name, card.bank, card.clicked_at || ""]);
      });
    });
    const csvContent = csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credit-card-clicks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getUsersForCard = (cardName) => {
    const users = [];
    allData.forEach((row) => {
      const clicks = (row.clicked_cards || []).filter((c) => c.card_name === cardName);
      if (clicks.length > 0) {
        users.push({
          principal: row.principal,
          principal_xid: row.principal_xid,
          ipAddress: row.ipAddress,
          clickCount: clicks.length,
          lastClickedAt: clicks[clicks.length - 1]?.clicked_at,
          allClicks: clicks,
        });
      }
    });
    return users.sort((a, b) => b.clickCount - a.clickCount);
  };

  const maxClicks = analytics.cardStats.length > 0 ? analytics.cardStats[0].count : 1;
  const onPageChange = (pageNo) => setQuery((prev) => ({ ...prev, page_no: pageNo }));
  const totalPages = Math.ceil(totalDataCount / query.limit);
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, query.page_no - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const formatDate = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
  const formatTime = (d) => d ? new Date(d).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
  const formatShortDate = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short" }) : "";
  const getCardImage = (n) => { const mc = masterLookup[n?.toLowerCase()]; return mc?.cardImage ? `${imageUrl}${mc.cardImage}` : null; };
  const getCardMaster = (n) => masterLookup[n?.toLowerCase()] || null;
  const hasActiveFilters = searchTerm || filterCard || filterType;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setSelectedCard(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const drawerUsers = selectedCard ? getUsersForCard(selectedCard.card_name) : [];
  const drawerTheme = selectedCard ? getBankTheme(selectedCard.bank) : DEFAULT_THEME;
  const drawerImg = selectedCard ? getCardImage(selectedCard.card_name) : null;

  return (
    <div className="space-y-6">
      <Toaster />

      {/* ═══════ Page Header ═══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Credit Card Click Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time engagement tracking across your credit card products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchClicks()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={!allData.length}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* ═══════ Stats Cards ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<MousePointerClick size={20} />} label="Total Clicks" value={analytics.totalClicks} color="indigo" />
        <StatCard icon={<CreditCard size={20} />} label="Total Records" value={totalDataCount} color="violet" />
        <StatCard icon={<UserCheck size={20} />} label="Logged-in Users" value={analytics.uniqueUsers} color="emerald" />
        <StatCard icon={<Ghost size={20} />} label="Anonymous" value={analytics.anonymousUsers} color="amber" />
      </div>

      {loading && allData.length === 0 ? (
        <div className="flex justify-center items-center h-52">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ═══════ Card-wise Performance ═══════ */}
          {analytics.cardStats.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Card-wise Performance</h2>
                <p className="text-xs text-gray-400 hidden sm:block">Click on a card to see user details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {analytics.cardStats.map((card, idx) => {
                  const master = getCardMaster(card.card_name);
                  const cardImg = getCardImage(card.card_name);
                  const theme = getBankTheme(card.bank);
                  const pct = Math.round((card.count / maxClicks) * 100);
                  const isVertical = master && master.intrinsicHeight > master.intrinsicWidth;
                  const isSelected = selectedCard?.card_name === card.card_name;

                  return (
                    <div
                      key={`${card.card_name}-${card.bank}`}
                      onClick={() => setSelectedCard(card)}
                      className={`group relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-indigo-300 ring-2 ring-indigo-100 shadow-lg"
                          : "border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Rank badge */}
                      {idx < 3 && (
                        <div className="absolute top-3 left-3 z-20">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shadow ${
                            idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-gray-400" : "bg-amber-700"
                          }`}>{idx + 1}</div>
                        </div>
                      )}

                      {/* Card image area */}
                      <div
                        className="relative flex items-center justify-center py-6 px-4"
                        style={{ background: `linear-gradient(145deg, ${theme.from}06, ${theme.to}04)`, minHeight: isVertical ? 200 : 160 }}
                      >
                        <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                          {cardImg ? (
                            <img src={cardImg} alt={card.card_name} className="object-contain rounded-lg"
                              style={{ maxHeight: isVertical ? 170 : 120, width: "auto", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))" }} />
                          ) : (
                            <FallbackCard name={card.card_name} bank={card.bank} theme={theme} />
                          )}
                        </div>

                        {/* Click count badge */}
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm">
                          <MousePointerClick size={11} style={{ color: theme.from }} />
                          <span className="text-xs font-bold" style={{ color: theme.from }}>{card.count}</span>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-all duration-200 pointer-events-none">
                          <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <Eye size={12} />
                            View {card.uniqueUsers} user{card.uniqueUsers !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Info section */}
                      <div className="px-4 py-3 border-t border-gray-50">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{card.card_name}</h3>
                        <div className="flex items-center gap-2 mt-1 mb-2.5">
                          <span className="text-xs text-gray-400">{card.bank}</span>
                          {master?.network && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-gray-200" />
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.from }}>{master.network}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users size={12} className="text-gray-400" />
                            <span className="font-semibold text-gray-700">{card.uniqueUsers}</span> users
                          </div>
                          {master?.joiningFee && (
                            <span className="text-xs text-emerald-600 font-medium">{master.joiningFee}</span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-400">{pct}% of top</span>
                          {master?.tags && Array.isArray(master.tags) && (
                            <div className="flex gap-1">
                              {master.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${theme.from}08`, color: theme.from }}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════ User Click Details ═══════ */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">All Click Details</h2>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">{totalDataCount} total</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Card filter */}
                  <select
                    value={filterCard}
                    onChange={(e) => setFilterCard(e.target.value)}
                    className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white max-w-[180px]"
                  >
                    <option value="">All Cards</option>
                    {uniqueCardNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>

                  {/* User type */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white"
                  >
                    <option value="">All Users</option>
                    <option value="logged_in">Logged-in</option>
                    <option value="anonymous">Anonymous</option>
                  </select>

                  {/* Clear */}
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setSearchTerm(""); setFilterCard(""); setFilterType(""); }}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={12} />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredData && filteredData.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80">
                        {["#", "User", "Phone", "IP Address", "Clicks", "Cards Clicked", "Date"].map((h, i) => (
                          <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 ${i === 4 ? "text-center" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredData.map((row, index) => (
                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-400 font-mono">{String((query.page_no - 1) * query.limit + index + 1).padStart(2, "0")}</td>
                          <td className="px-4 py-3">
                            {row.principal ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${getBankTheme(row.clicked_cards?.[0]?.bank).from}, ${getBankTheme(row.clicked_cards?.[0]?.bank).to})` }}>
                                  {(row.principal.firstName || "U")[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">{row.principal.firstName || ""} {row.principal.lastName || ""}</p>
                                  <p className="text-xs text-gray-400 truncate">{row.principal.emailAddress || ""}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                  <Ghost size={14} />
                                </div>
                                <span className="text-gray-400 text-sm">Anonymous</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.principal?.phoneNumber ? maskPhone(row.principal.phoneNumber) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded font-mono">{row.ipAddress || "-"}</code>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">{row.clicked_cards?.length || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {row.clicked_cards?.map((card, i) => {
                                const ci = getCardImage(card.card_name);
                                const t = getBankTheme(card.bank);
                                return (
                                  <div key={i} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 border bg-gray-50 border-gray-100"
                                    title={`${card.card_name} (${card.bank}) - ${formatDate(card.clicked_at)}`}>
                                    {ci ? (
                                      <img src={ci} alt="" className="w-6 h-4 object-contain rounded" />
                                    ) : (
                                      <div className="w-6 h-4 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
                                        <CreditCard size={8} className="text-white" />
                                      </div>
                                    )}
                                    <span className="text-[10px] font-medium text-gray-600 max-w-[80px] truncate">{card.card_name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Showing {(query.page_no - 1) * query.limit + 1}-{Math.min(query.page_no * query.limit, totalDataCount)} of {totalDataCount}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPageChange(query.page_no - 1)}
                        disabled={query.page_no === 1}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {getPageNumbers().map((page) => (
                        <button key={page} onClick={() => onPageChange(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            query.page_no === page
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}>{page}</button>
                      ))}
                      <button
                        onClick={() => onPageChange(query.page_no + 1)}
                        disabled={query.page_no === totalPages}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : !loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                  <CreditCard size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No click data found</p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSearchTerm(""); setFilterCard(""); setFilterType(""); }}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════ Slide-Over Panel ═══════ */}
      {selectedCard && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedCard(null)} />

          <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-[slideIn_0.25s_ease-out]">
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

            {/* Header */}
            <div className="relative overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${drawerTheme.from}, ${drawerTheme.to})` }}>
              <button onClick={() => setSelectedCard(null)} className="absolute top-3 right-3 z-30 w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <X size={14} />
              </button>

              <div className="relative z-10 px-5 pt-5 pb-4 flex items-center gap-4">
                <div className="shrink-0">
                  {drawerImg ? (
                    <img src={drawerImg} alt="" className="h-20 w-auto object-contain rounded-lg" style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))" }} />
                  ) : (
                    <div className="w-24 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-white/50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-base leading-snug line-clamp-2">{selectedCard.card_name}</h3>
                  <p className="text-white/60 text-sm mt-0.5">{selectedCard.bank}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-md">{selectedCard.count} clicks</span>
                    <span className="bg-white/10 text-white/80 text-xs font-medium px-2 py-0.5 rounded-md">{selectedCard.uniqueUsers} users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Users who clicked this card ({drawerUsers.length})
                </p>

                {drawerUsers.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-10">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {drawerUsers.map((user, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
                        {user.principal ? (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: `linear-gradient(135deg, ${drawerTheme.from}, ${drawerTheme.to})` }}>
                            {(user.principal.firstName || "U")[0].toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <Ghost size={14} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {user.principal
                                ? `${user.principal.firstName || ""} ${user.principal.lastName || ""}`.trim() || "Unknown"
                                : "Anonymous"
                              }
                            </p>
                            {user.clickCount > 1 && (
                              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                {user.clickCount}x
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {user.principal?.emailAddress || user.ipAddress || "-"}
                          </p>
                          {user.principal?.phoneNumber && (
                            <p className="text-xs text-gray-400 truncate">
                              {maskPhone(user.principal.phoneNumber)}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 text-right">
                          {user.allClicks.map((click, ci) => (
                            <p key={ci} className="text-[10px] text-gray-400 leading-relaxed">
                              <span className="font-medium text-gray-500">{formatShortDate(click.clicked_at)}</span>
                              {" "}
                              <span className="text-gray-300">{formatTime(click.clicked_at)}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-3 border-t border-gray-100">
              <button onClick={() => setSelectedCard(null)} className="w-full py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════ Sub-components ═══════ */

const COLOR_MAP = {
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  icon: "bg-indigo-100 text-indigo-600" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  icon: "bg-violet-100 text-violet-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100 text-emerald-600" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   icon: "bg-amber-100 text-amber-600" },
};

const StatCard = ({ icon, label, value, color }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>{icon}</div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${c.text} leading-none mt-0.5`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

const FallbackCard = ({ name, bank, theme }) => (
  <div className="w-44 h-28 rounded-xl flex flex-col justify-between p-3 relative overflow-hidden"
    style={{ background: `linear-gradient(145deg, ${theme.from}, ${theme.to})`, boxShadow: `0 12px 24px ${theme.glow}` }}>
    <div className="flex justify-between items-start relative z-10">
      <div className="w-8 h-5 rounded bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner" />
      <span className="text-[7px] text-white/40 font-bold uppercase tracking-wider">Credit</span>
    </div>
    <div className="relative z-10">
      <p className="text-[8px] text-white/30 font-mono tracking-widest">**** **** **** ****</p>
      <p className="text-[10px] text-white font-bold mt-0.5 truncate">{name}</p>
      <p className="text-[8px] text-white/40">{bank}</p>
    </div>
  </div>
);

export default CreditCardClicks;
