import { useState, useMemo, useEffect, useCallback } from "react";
import {
  fetchCustomers,
  fetchDeleted,
  addCustomer,
  updateCustomer,
  softDeleteCustomer,
  restoreCustomer,
  purgeCustomer,
  restoreAll,
  purgeAll,
  readCache,
  isCacheFresh,
  writeCache,
  clearCache,
  fetchPlans,
  readPlanCache,
  fetchCustomerRecharges,
  recordRecharge,
  markRechargePaid,
  fetchPendingRecharges,
  setManualStatus,
} from "./lib/db";
import { searchCustomers } from "./lib/search";
import { buildDictionary } from "./lib/translit";
import { useSession, useOnline, signOut } from "./lib/auth";
import Login from "./components/Login";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import EmptyState from "./components/EmptyState";
import CustomerDetail from "./components/CustomerDetail";
import CustomerSheet from "./components/CustomerSheet";
import CustomerForm from "./components/CustomerForm";
import ConfirmDialog from "./components/ConfirmDialog";
import TrashPanel from "./components/TrashPanel";
import Toast from "./components/Toast";
import Tabs from "./components/Tabs";
import RechargeSheet from "./components/RechargeSheet";
import HistorySheet from "./components/HistorySheet";
import ExpiringView from "./components/ExpiringView";
import PendingView from "./components/PendingView";
import { Plus, Spinner, WifiOff, User } from "./components/icons";
import { daysUntil, EXPIRING_SOON_DAYS } from "./lib/subscription";

export default function App() {
  const { session, loading: authLoading } = useSession();
  const online = useOnline();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [stale, setStale] = useState(false);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [formState, setFormState] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [trashOpen, setTrashOpen] = useState(false);
  const [trash, setTrash] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashBusyId, setTrashBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(null); // null | 'restore' | 'purge'

  // ── Phase 1: subscriptions ──
  const [plans, setPlans] = useState(() => readPlanCache() || []);
  const [tab, setTab] = useState("search"); // search | expiring | pending
  const [rechargeFor, setRechargeFor] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyBusyId, setHistoryBusyId] = useState(null);
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingBusyId, setPendingBusyId] = useState(null);

  // Live = we're online AND not showing a stale cached list.
  const live = online && !stale;
  const canEdit = live;

  // ── load ────────────────────────────────────────────────────
  const load = useCallback(
    async ({ silent = false, force = false } = {}) => {
      // Fresh cache → render instantly, skip the network entirely.
      if (!force && !silent) {
        const cached = readCache();
        if (cached) {
          setCustomers(cached);
          setLoading(false);
          if (isCacheFresh() && online) {
            setStale(false);
            return;
          }
        }
      }

      if (silent || customers.length > 0) setRefreshing(true);
      else setLoading(true);
      setLoadError("");

      try {
        const { list, stale: isStale } = await fetchCustomers();
        setCustomers(list);
        setStale(isStale);
      } catch {
        const cached = readCache();
        if (cached) {
          setCustomers(cached);
          setStale(true);
        } else {
          setLoadError(
            online
              ? "Could not load customers. Check your connection and try again."
              : "You’re offline and no saved list is on this device yet.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [online],
  );

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Connection came back while we were stale → quietly re-sync.
  useEffect(() => {
    if (session && online && stale) load({ silent: true, force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  const results = useMemo(
    () => searchCustomers(customers, query),
    [customers, query],
  );
  const hasQuery = query.trim().length > 0;

  // Name dictionary, learned from the customers already on file.
  // Rebuilt on every change, so it improves with every customer added.
  const dict = useMemo(() => buildDictionary(customers), [customers]);

  // ── Phase 1: plans, helpers, derived counts ──
  useEffect(() => {
    if (!session) return;
    fetchPlans()
      .then(setPlans)
      .catch(() => {
        /* cache fallback already handled in fetchPlans */
      });
  }, [session]);

  const planById = useMemo(() => {
    const m = new Map();
    for (const p of plans) m.set(p.id, p);
    return m;
  }, [plans]);

  const planNameOf = useCallback(
    (c) => (c?.planId ? planById.get(c.planId)?.name || null : null),
    [planById],
  );

  const expiringCount = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.manualStatus !== "suspended" &&
          c.planId &&
          c.expiryDate &&
          daysUntil(c.expiryDate) !== null &&
          daysUntil(c.expiryDate) <= EXPIRING_SOON_DAYS,
      ).length,
    [customers],
  );

  const tabCounts = useMemo(
    () => ({ expiring: expiringCount, pending: pending.length }),
    [expiringCount, pending.length],
  );

  const outstandingTotal = useMemo(
    () => pending.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [pending],
  );

  // Load pending recharges when that tab is opened (online only).
  const loadPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      setPending(await fetchPendingRecharges());
    } catch (err) {
      setToast(err?.message || "Could not load pending payments.");
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session && tab === "pending" && live) loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, session, live]);

  const copy = useCallback(async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    setToast(label || "Copied");
  }, []);

  // Keep local state + cache in step after a write, instead of refetching.
  const commit = useCallback((next) => {
    setCustomers(next);
    writeCache(next);
  }, []);

  // A row from Pending/Expiring may be a stripped-down object (the pending
  // query only joins a few columns). Resolve the FULL customer from the main
  // list by id so plan/expiry data is present on the profile.
  const selectFull = useCallback(
    (c) => {
      const full = customers.find((x) => x.id === c.id);
      setSelected(full || c);
    },
    [customers],
  );

  // ── Phase 1: recharge / history / pending / suspend ──
  function upsertCustomer(updated) {
    commit(
      customers.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
    if (selected?.id === updated.id) setSelected((s) => ({ ...s, ...updated }));
    if (rechargeFor?.id === updated.id)
      setRechargeFor((s) => ({ ...s, ...updated }));
  }

  async function handleRecharge(payload) {
    setSaving(true);
    try {
      const { customer: updated } = await recordRecharge(payload);
      upsertCustomer(updated);
      setRechargeFor(null);
      // If history is open for this customer, refresh it.
      if (historyFor?.id === updated.id) openHistory(updated, true);
      setToast(
        payload.paymentStatus === "paid"
          ? "Recharged · marked paid"
          : "Recharged · payment pending",
      );
    } catch (err) {
      setToast(err?.message || "Could not save recharge.");
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(customer, silent = false) {
    setHistoryFor(customer);
    if (!silent) setHistoryLoading(true);
    try {
      setHistory(await fetchCustomerRecharges(customer.id));
    } catch (err) {
      setToast(err?.message || "Could not load history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleMarkPaid(recharge, fromPending) {
    const today = new Date().toISOString().slice(0, 10);
    if (fromPending) setPendingBusyId(recharge.id);
    else setHistoryBusyId(recharge.id);
    try {
      const updated = await markRechargePaid(recharge.id, today);
      setHistory((h) => h.map((r) => (r.id === updated.id ? updated : r)));
      setPending((p) => p.filter((r) => r.id !== updated.id));
      setToast("Marked as paid");
    } catch (err) {
      setToast(err?.message || "Could not update.");
    } finally {
      setPendingBusyId(null);
      setHistoryBusyId(null);
    }
  }

  async function handleToggleSuspend(customer) {
    const next = customer.manualStatus === "suspended" ? null : "suspended";
    try {
      const updated = await setManualStatus(customer.id, next);
      upsertCustomer(updated);
      setToast(next ? "Customer suspended" : "Customer un-suspended");
    } catch (err) {
      setToast(err?.message || "Could not update.");
    }
  }

  const rechargeCountFor = useCallback(
    (c) => {
      // We don't keep a per-customer count in the list; show 1 if they have a
      // plan (the imported balance), refined once history is actually loaded.
      if (historyFor?.id === c?.id && history.length) return history.length;
      return c?.planId ? 1 : 0;
    },
    [historyFor, history],
  );

  // ── writes ──────────────────────────────────────────────────
  async function handleSave(data) {
    setSaving(true);
    try {
      if (formState?.mode === "edit") {
        const updated = await updateCustomer(formState.customer.id, data);
        commit(customers.map((c) => (c.id === updated.id ? updated : c)));
        if (selected?.id === updated.id) setSelected(updated);
        setToast("Customer updated");
      } else {
        const created = await addCustomer(data);
        commit(
          [...customers, created].sort((a, b) =>
            String(a.name).localeCompare(String(b.name)),
          ),
        );
        setToast("Customer added");
      }
      setFormState(null);
    } catch (err) {
      setToast(err?.message || "Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const target = confirm.customer;
    setSaving(true);
    try {
      await softDeleteCustomer(target.id);
      commit(customers.filter((c) => c.id !== target.id));
      setConfirm(null);
      setSelected(null);
      setToast("Moved to Recently deleted");
    } catch (err) {
      setToast(err?.message || "Could not delete. Try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── trash ───────────────────────────────────────────────────
  async function openTrash() {
    setTrashOpen(true);
    setTrashLoading(true);
    try {
      setTrash(await fetchDeleted());
    } catch (err) {
      setToast(err?.message || "Could not load deleted customers.");
      setTrashOpen(false);
    } finally {
      setTrashLoading(false);
    }
  }

  async function handleRestore(c) {
    setTrashBusyId(c.id);
    try {
      const restored = await restoreCustomer(c.id);
      commit(
        [...customers, restored].sort((a, b) =>
          String(a.name).localeCompare(String(b.name)),
        ),
      );
      setTrash((t) => t.filter((x) => x.id !== c.id));
      setToast(`${restored.name} restored`);
    } catch (err) {
      setToast(err?.message || "Could not restore.");
    } finally {
      setTrashBusyId(null);
    }
  }

  async function handlePurge() {
    const c = confirm.customer;
    setTrashBusyId(c.id);
    try {
      await purgeCustomer(c.id);
      setTrash((t) => t.filter((x) => x.id !== c.id));
      setConfirm(null);
      setToast("Deleted permanently");
    } catch (err) {
      setToast(err?.message || "Could not delete.");
    } finally {
      setTrashBusyId(null);
    }
  }

  async function handleRestoreAll() {
    setBulkBusy("restore");
    try {
      const restored = await restoreAll();
      commit(
        [...customers, ...restored].sort((a, b) =>
          String(a.name).localeCompare(String(b.name)),
        ),
      );
      setTrash([]);
      setToast(
        restored.length === 1
          ? "1 customer restored"
          : `${restored.length} customers restored`,
      );
    } catch (err) {
      setToast(err?.message || "Could not restore.");
    } finally {
      setBulkBusy(null);
    }
  }

  async function handlePurgeAll() {
    const count = trash.length;
    setBulkBusy("purge");
    try {
      await purgeAll();
      setTrash([]);
      setConfirm(null);
      setToast(
        count === 1
          ? "1 customer deleted permanently"
          : `${count} customers deleted permanently`,
      );
    } catch (err) {
      setToast(err?.message || "Could not delete.");
    } finally {
      setBulkBusy(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    clearCache();
    setCustomers([]);
    setQuery("");
    setSelected(null);
  }

  // ── render ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center text-muted">
        <Spinner size={26} />
      </div>
    );
  }

  if (!session) return <Login online={online} />;

  const listPane = loading ? (
    <div className="flex flex-col items-center gap-3 pt-24 text-muted">
      <Spinner size={24} />
      <p className="text-sm">Loading customers…</p>
    </div>
  ) : loadError ? (
    <div className="flex flex-col items-center px-8 pt-20 text-center animate-fade-in">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white text-muted shadow-card">
        <WifiOff size={26} />
      </div>
      <h2 className="font-display text-lg font-bold text-ink">Couldn’t load</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
        {loadError}
      </p>
      <button
        onClick={() => load({ force: true })}
        className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95"
      >
        Try again
      </button>
    </div>
  ) : !hasQuery ? (
    <EmptyState mode="idle" total={customers.length} />
  ) : results.length === 0 ? (
    <EmptyState mode="empty" />
  ) : (
    <ResultsList
      results={results}
      query={query}
      selectedId={selected?.id}
      onSelect={setSelected}
    />
  );

  return (
    <div className="mx-auto w-full max-w-lg px-4 sm:max-w-5xl">
      <Header
        total={customers.length}
        live={live}
        refreshing={refreshing}
        canEdit={canEdit}
        onRefresh={async () => {
          await load({ silent: true, force: true });
          setToast("List refreshed");
        }}
        onTrash={openTrash}
        onSignOut={handleSignOut}
        onAdd={() => setFormState({ mode: "add" })}
      />

      {/* ── Desktop: split view · Mobile: single column ── */}
      <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] sm:gap-5">
        {/* Left: tabs + active view */}
        <div className="sm:min-w-0">
          {/* Desktop segmented control */}
          <div className="hidden sm:block">
            <Tabs
              active={tab}
              onChange={setTab}
              counts={tabCounts}
              variant="segmented"
            />
          </div>

          {tab === "search" && (
            <>
              <SearchBar
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  if (!v.trim()) setSelected(null);
                }}
                resultCount={results.length}
                hasQuery={hasQuery}
              />
              {listPane}
            </>
          )}

          {tab === "expiring" && (
            <ExpiringView
              customers={customers}
              planName={planNameOf}
              onSelect={(c) => {
                selectFull(c);
                setTab("search");
              }}
            />
          )}

          {tab === "pending" && (
            <PendingView
              items={pending}
              loading={pendingLoading}
              busyId={pendingBusyId}
              total={outstandingTotal}
              onSelect={(c) => {
                selectFull(c);
                setTab("search");
              }}
              onMarkPaid={(r) => handleMarkPaid(r, true)}
            />
          )}
        </div>

        {/* Right (desktop only): persistent customer panel */}
        <aside className="hidden sm:block">
          <div className="sticky top-4 mt-3 max-h-[calc(100dvh-2rem)] overflow-y-auto scroll-thin rounded-3xl border border-hairline bg-card p-5 shadow-card">
            {selected ? (
              <CustomerDetail
                customer={selected}
                canEdit={canEdit}
                planName={planNameOf(selected)}
                rechargeCount={rechargeCountFor(selected)}
                onCopy={copy}
                onEdit={() =>
                  setFormState({ mode: "edit", customer: selected })
                }
                onDelete={() =>
                  setConfirm({ type: "delete", customer: selected })
                }
                onRecharge={() => setRechargeFor(selected)}
                onHistory={() => openHistory(selected)}
                onToggleSuspend={() => handleToggleSuspend(selected)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-muted shadow-card">
                  <User size={24} />
                </div>
                <p className="font-display font-bold text-ink">
                  No customer selected
                </p>
                <p className="mt-1 max-w-[15rem] text-sm text-muted">
                  Search on the left, then click a result to see their details
                  here.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile: floating Add / offline badge — only on the Search tab */}
      {!loading && !loadError && tab === "search" && (
        <div
          className="pointer-events-none fixed inset-x-0 z-30 mx-auto flex max-w-lg justify-end px-4 sm:hidden"
          style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
        >
          {canEdit ? (
            <button
              onClick={() => setFormState({ mode: "add" })}
              className="pointer-events-auto flex min-h-[52px] items-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-glow transition-transform active:scale-95"
              aria-label="Add customer"
            >
              <Plus size={20} strokeWidth={2.25} /> Add
            </button>
          ) : (
            <span className="pointer-events-auto flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2.5 text-[13px] font-medium text-muted shadow-card">
              <WifiOff size={15} /> Offline — viewing only
            </span>
          )}
        </div>
      )}

      {/* Mobile: bottom tab bar */}
      <Tabs active={tab} onChange={setTab} counts={tabCounts} variant="bar" />

      {/* Mobile: detail sheet */}
      {selected && (
        <CustomerSheet
          customer={selected}
          canEdit={canEdit}
          planName={planNameOf(selected)}
          rechargeCount={rechargeCountFor(selected)}
          onClose={() => setSelected(null)}
          onCopy={copy}
          onEdit={() => setFormState({ mode: "edit", customer: selected })}
          onDelete={() => setConfirm({ type: "delete", customer: selected })}
          onRecharge={() => setRechargeFor(selected)}
          onHistory={() => openHistory(selected)}
          onToggleSuspend={() => handleToggleSuspend(selected)}
        />
      )}

      {rechargeFor && (
        <RechargeSheet
          customer={rechargeFor}
          plans={plans}
          saving={saving}
          onCancel={() => setRechargeFor(null)}
          onSave={handleRecharge}
        />
      )}

      {historyFor && (
        <HistorySheet
          customer={historyFor}
          items={history}
          loading={historyLoading}
          busyId={historyBusyId}
          canEdit={canEdit}
          onClose={() => {
            setHistoryFor(null);
            setHistory([]);
          }}
          onMarkPaid={(r) => handleMarkPaid(r, false)}
        />
      )}

      {formState && (
        <CustomerForm
          initial={formState.mode === "edit" ? formState.customer : null}
          saving={saving}
          dict={dict}
          customers={customers}
          onCancel={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {trashOpen && (
        <TrashPanel
          items={trash}
          loading={trashLoading}
          busyId={trashBusyId}
          bulkBusy={bulkBusy}
          onClose={() => setTrashOpen(false)}
          onRestore={handleRestore}
          onPurge={(c) => setConfirm({ type: "purge", customer: c })}
          onRestoreAll={handleRestoreAll}
          onPurgeAll={() => setConfirm({ type: "purgeAll" })}
        />
      )}

      {confirm?.type === "delete" && (
        <ConfirmDialog
          title="Delete this customer?"
          message={`${
            confirm.customer.name || confirm.customer.marathiName
          } will be removed for everyone. You can restore them from Recently deleted.`}
          confirmLabel={saving ? "Deleting…" : "Delete"}
          busy={saving}
          onCancel={() => setConfirm(null)}
          onConfirm={handleDelete}
        />
      )}

      {confirm?.type === "purge" && (
        <ConfirmDialog
          title="Delete forever?"
          message={`${
            confirm.customer.name || confirm.customer.marathiName
          } will be permanently erased from the database. This cannot be undone.`}
          confirmLabel={trashBusyId ? "Deleting…" : "Delete forever"}
          busy={Boolean(trashBusyId)}
          onCancel={() => setConfirm(null)}
          onConfirm={handlePurge}
        />
      )}

      {confirm?.type === "purgeAll" && (
        <ConfirmDialog
          title="Delete all forever?"
          message={`All ${trash.length} customer${
            trash.length === 1 ? "" : "s"
          } in Recently deleted will be permanently erased from the database. This cannot be undone.`}
          confirmLabel={
            bulkBusy === "purge" ? "Deleting…" : `Delete all ${trash.length}`
          }
          busy={bulkBusy === "purge"}
          onCancel={() => setConfirm(null)}
          onConfirm={handlePurgeAll}
        />
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
