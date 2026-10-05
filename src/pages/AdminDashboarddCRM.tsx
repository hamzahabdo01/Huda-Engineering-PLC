import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";

// --- Types & Interfaces ---
export type UnitStatus =
  | "available"
  | "reserved"
  | "unavailable"
  | "office"
  | "business"
  | "shop"
  | string;

export interface PaymentPlan {
  total_price?: number;
  down_payment?: number;
  installment_years?: number;
  monthly_installment?: number;
}

export interface UnitType {
  id: string;
  project_id: string;
  title: string;
  area: number;
}

export interface Floor {
  id: string;
  project_id: string;
  floor_name: string;
}

export interface Project {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
}

export interface PaymentRecord {
  id: string;
  payment_name: string;
  date: string;
  amount: number;
  receipt_url?: string | null;
}

export interface MarketerClient {
  id: string;
  marketer_name?: string;
  marketerName?: string;
  marketer_type?: string;
  marketerType?: string;
  client_name?: string;
  name?: string;
  phone: string;
  project_id?: string;
  project_name?: string;
  unit_title?: string;
  apartment_id?: string;
  apartmentId?: string;
  status?: string;
  source?: string;
  lead_source?: string;
  created_at?: string;
  total_payment?: number | string | null;
  down_payment?: number | string | null;
  payment_type?: string | null;
  installment_plan?: string | null;
  memo?: string | null;
  cpo_image?: string | null;
  cpoImage?: string | null;
  cpo_image_url?: string | null;
  cpoImageUrl?: string | null;
  cpo_file_url?: string | null;
  cpo_url?: string | null;
  cpo_file?: string | null;
  receipt_url?: string | null;
  receipt_image?: string | null;
  receipt_file?: string | null;
  receipt_status?: string | null;
  payment_history?: PaymentRecord[] | null;
  receipts_history?: any[] | null;
}

export interface MarketerAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  marketer_type?: string;
  role?: string;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string;
}

function getOrdinalPaymentName(index: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = index % 100;
  return `${index}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]} Payment`;
}

export function AdminDashboardd() {
  // --- States ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [matrix, setMatrix] = useState<Record<string, UnitStatus>>({});
  const [marketerClients, setMarketerClients] = useState<MarketerClient[]>([]);
  const [marketerAccounts, setMarketerAccounts] = useState<MarketerAccount[]>(
    [],
  );
  const [marketersFetchError, setMarketersFetchError] = useState<string | null>(
    null,
  );

  // --- Pricing Sub-Tab State ---
  const [pricingSubTab, setPricingSubTab] = useState<"full" | "progressive">(
    "full",
  );

  // --- Payment Modal State ---
  const [selectedClientForPayment, setSelectedClientForPayment] =
    useState<MarketerClient | null>(null);
  const [clientPayments, setClientPayments] = useState<PaymentRecord[]>([]);

  // Add Payment Form States
  const [newPaymentDate, setNewPaymentDate] = useState<string>("");
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>("");

  // Receipt Selection Options: "marketer" | "upload" | "none"
  const [receiptSourceMode, setReceiptSourceMode] = useState<
    "marketer" | "upload" | "none"
  >("marketer");
  const [selectedMarketerReceiptUrl, setSelectedMarketerReceiptUrl] =
    useState<string>("");
  const [newReceiptFile, setNewReceiptFile] = useState<File | null>(null);
  const [newReceiptPreview, setNewReceiptPreview] = useState<string | null>(
    null,
  );
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);

  // --- Clients Search, Filter & Sort States ---
  const [selectedMarketerFilter, setSelectedMarketerFilter] =
    useState<string>("all");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [clientStatusFilter, setClientStatusFilter] = useState<string>("all");
  const [clientSortField, setClientSortField] = useState<
    "created_at" | "name" | "marketer_name" | "total_payment"
  >("created_at");
  const [clientSortOrder, setClientSortOrder] = useState<"asc" | "desc">(
    "desc",
  );

  // --- Marketers Search, Filter & Sort States ---
  const [marketerSearch, setMarketerSearch] = useState<string>("");
  const [marketerStatusFilter, setMarketerStatusFilter] =
    useState<string>("all");
  const [marketerSortField, setMarketerSortField] = useState<
    "name" | "email" | "created_at" | "status"
  >("created_at");
  const [marketerSortOrder, setMarketerSortOrder] = useState<"asc" | "desc">(
    "desc",
  );

  const [loading, setLoading] = useState<boolean>(true);

  // Floor Form States
  const [newFloorName, setNewFloorName] = useState("");
  const [typicalFloorCount, setTypicalFloorCount] = useState<number | "">("");

  // Unit Type Form States
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [newUnitArea, setNewUnitArea] = useState<number | "">("");

  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [customCellText, setCustomCellText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "matrix" | "pricing" | "clients" | "marketers"
  >("clients");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Helper to extract primary receipt URL
  const getReceiptUrl = useCallback(
    (client: MarketerClient & Record<string, any>): string | null => {
      let file =
        client.receipt_url ||
        client.receipt_image ||
        client.receipt_file ||
        client.receipt;

      // Search in payment_history if primary receipt field is empty
      if (
        !file &&
        Array.isArray(client.payment_history) &&
        client.payment_history.length > 0
      ) {
        const lastPayWithReceipt = [...client.payment_history]
          .reverse()
          .find((p) => p.receipt_url);
        if (lastPayWithReceipt) file = lastPayWithReceipt.receipt_url;
      }

      // Search in receipts_history array
      if (
        !file &&
        Array.isArray(client.receipts_history) &&
        client.receipts_history.length > 0
      ) {
        const lastRec = [...client.receipts_history]
          .reverse()
          .find((r: any) => r.receipt_url || r.file_url || r.url);
        if (lastRec)
          file = lastRec.receipt_url || lastRec.file_url || lastRec.url;
      }

      if (!file || typeof file !== "string" || file.trim() === "") {
        return null;
      }

      const cleanFile = file.trim();
      if (
        cleanFile.startsWith("http://") ||
        cleanFile.startsWith("https://") ||
        cleanFile.startsWith("data:")
      ) {
        return cleanFile;
      }

      const { data } = supabase.storage
        .from("cpo-files")
        .getPublicUrl(cleanFile);
      return data?.publicUrl || null;
    },
    [],
  );

  // Helper to extract all uploaded receipts by marketer for the modal dropdown
  const getAvailableMarketerReceipts = useCallback(
    (client: MarketerClient & Record<string, any>) => {
      const list: { label: string; url: string }[] = [];

      const rootReceipt = getReceiptUrl(client);
      if (rootReceipt) {
        list.push({
          label: "Primary Uploaded Receipt (الوصل الرئيسي)",
          url: rootReceipt,
        });
      }

      if (Array.isArray(client.payment_history)) {
        client.payment_history.forEach((p, idx) => {
          if (
            p.receipt_url &&
            !list.some((item) => item.url === p.receipt_url)
          ) {
            list.push({
              label: `Receipt from ${p.payment_name || `Payment ${idx + 1}`} (${p.date || "Marketer"})`,
              url: p.receipt_url,
            });
          }
        });
      }

      if (Array.isArray(client.receipts_history)) {
        client.receipts_history.forEach((r: any, idx: number) => {
          const url = r.receipt_url || r.file_url || r.url;
          if (url && !list.some((item) => item.url === url)) {
            list.push({
              label: `Marketer Receipt #${idx + 1} (${r.date || "History"})`,
              url: url,
            });
          }
        });
      }

      return list;
    },
    [getReceiptUrl],
  );

  useEffect(() => {
    fetchProjects();
    fetchMarketerClients();
    fetchMarketerAccounts();

    const leadsChannel = supabase
      .channel("realtime-leads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          fetchMarketerClients();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchProjectDetails = async (projectId: string) => {
      setLoading(true);
      await Promise.all([
        fetchFloors(projectId),
        fetchUnitTypes(projectId),
        fetchMatrixData(projectId),
      ]);
      setLoading(false);
    };

    fetchProjectDetails(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedClientForPayment) {
      setClientPayments(selectedClientForPayment.payment_history || []);
      setNewPaymentDate(new Date().toISOString().split("T")[0]);
      setNewPaymentAmount("");
      setNewReceiptFile(null);
      setNewReceiptPreview(null);

      // Extract existing receipts uploaded by marketer
      const receiptsList = getAvailableMarketerReceipts(
        selectedClientForPayment,
      );
      if (receiptsList.length > 0) {
        setReceiptSourceMode("marketer");
        setSelectedMarketerReceiptUrl(receiptsList[0].url);
      } else {
        setReceiptSourceMode("upload");
        setSelectedMarketerReceiptUrl("");
      }
    }
  }, [selectedClientForPayment, getAvailableMarketerReceipts]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*");
    if (!error && data && data.length > 0) {
      setProjects(data);
      setSelectedProjectId(data[0].id);
    }
    setLoading(false);
  };

  const fetchFloors = async (projectId: string) => {
    const { data } = await supabase
      .from("srm_floors")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (data) setFloors(data);
  };

  const fetchUnitTypes = async (projectId: string) => {
    const { data } = await supabase
      .from("srm_unit_types")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (data) setUnitTypes(data);
  };

  const fetchMatrixData = async (projectId: string) => {
    const { data } = await supabase
      .from("srm_matrix_cells")
      .select("*")
      .eq("project_id", projectId);

    if (data) {
      const matrixMap: Record<string, UnitStatus> = {};
      data.forEach((item) => {
        const key = `${item.floor_name}__${item.unit_type_id}`;
        matrixMap[key] = item.status as UnitStatus;
      });
      setMatrix(matrixMap);
    }
  };

  const fetchMarketerClients = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*, projects(name, title)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formattedData = data.map((item: any) => ({
        ...item,
        project_name:
          item.project_name ||
          item.projects?.name ||
          item.projects?.title ||
          null,
      }));
      setMarketerClients(formattedData);
    } else {
      const { data: rawData } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (rawData) setMarketerClients(rawData);
    }
  };

  const fetchMarketerAccounts = async () => {
    setMarketersFetchError(null);
    const { data, error } = await supabase
      .from("marketers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMarketersFetchError(error.message);
    } else if (data) {
      setMarketerAccounts(data);
    }
  };

  const handleUpdateClientStatus = async (
    clientId: string,
    newStatus: string,
  ) => {
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", clientId);

    if (error) {
      alert(`Error updating status: ${error.message}`);
    } else {
      setMarketerClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c)),
      );
      alert(`✅ Client status updated to ${newStatus}`);
    }
  };

  const getCpoUrl = (
    client: MarketerClient & Record<string, any>,
  ): string | null => {
    const file =
      client.cpo_image ||
      client.cpoImage ||
      client.cpo_image_url ||
      client.cpoImageUrl ||
      client.cpo_file_url ||
      client.cpo_url ||
      client.cpo_file ||
      client.cpo;

    if (!file || typeof file !== "string" || file.trim() === "") return null;

    const cleanFile = file.trim();
    if (
      cleanFile.startsWith("http://") ||
      cleanFile.startsWith("https://") ||
      cleanFile.startsWith("data:")
    ) {
      return cleanFile;
    }

    const { data } = supabase.storage.from("cpo-files").getPublicUrl(cleanFile);
    return data?.publicUrl || null;
  };

  const handleUpdateMarketerStatus = async (
    marketerId: string,
    newStatus: "approved" | "rejected",
  ) => {
    const { error } = await supabase
      .from("marketers")
      .update({ status: newStatus })
      .eq("id", marketerId);

    if (!error) {
      setMarketerAccounts((prev) =>
        prev.map((m) =>
          m.id === marketerId ? { ...m, status: newStatus } : m,
        ),
      );
      alert(`✅ Marketer status updated to ${newStatus}`);
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewReceiptFile(file);
      setNewReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPayment) return;
    if (!newPaymentDate || !newPaymentAmount || Number(newPaymentAmount) <= 0) {
      alert("Please enter a valid Date and Amount.");
      return;
    }

    setIsSavingPayment(true);
    let finalReceiptUrl: string | null = null;

    if (receiptSourceMode === "marketer") {
      finalReceiptUrl = selectedMarketerReceiptUrl || null;
    } else if (receiptSourceMode === "upload") {
      if (newReceiptFile) {
        const fileExt = newReceiptFile.name.split(".").pop();
        const fileName = `receipt_${selectedClientForPayment.id}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("cpo-files")
          .upload(fileName, newReceiptFile);

        if (!uploadError && uploadData) {
          const { data: publicData } = supabase.storage
            .from("cpo-files")
            .getPublicUrl(fileName);
          finalReceiptUrl = publicData?.publicUrl || null;
        }
      } else if (newReceiptPreview) {
        finalReceiptUrl = newReceiptPreview;
      }
    }

    const nextPaymentNumber = clientPayments.length + 1;
    const paymentName = getOrdinalPaymentName(nextPaymentNumber);

    const newEntry: PaymentRecord = {
      id: `pay_${Date.now()}`,
      payment_name: paymentName,
      date: newPaymentDate,
      amount: Number(newPaymentAmount),
      receipt_url: finalReceiptUrl,
    };

    const updatedPayments = [...clientPayments, newEntry];

    const { error: updateError } = await supabase
      .from("leads")
      .update({ payment_history: updatedPayments as any })
      .eq("id", selectedClientForPayment.id);

    setIsSavingPayment(false);

    if (updateError) {
      console.warn(
        "Notice updating payment_history column:",
        updateError.message,
      );
    }

    setClientPayments(updatedPayments);
    setMarketerClients((prev) =>
      prev.map((c) =>
        c.id === selectedClientForPayment.id
          ? { ...c, payment_history: updatedPayments }
          : c,
      ),
    );

    setNewPaymentAmount("");
    setNewReceiptFile(null);
    setNewReceiptPreview(null);
    alert(`✅ Successfully added ${paymentName}!`);
  };

  const getProjectName = useCallback(
    (client: MarketerClient) => {
      if (client.project_name && client.project_name !== "-")
        return client.project_name;
      if (client.project_id) {
        const match = projects.find((p) => p.id === client.project_id);
        if (match) return match.name || match.title || "-";
      }
      return "-";
    },
    [projects],
  );

  const availableMarketerReceiptsList = useMemo(() => {
    if (!selectedClientForPayment) return [];
    return getAvailableMarketerReceipts(selectedClientForPayment);
  }, [selectedClientForPayment, getAvailableMarketerReceipts]);

  const marketerOptions = Array.from(
    new Set([
      ...marketerAccounts.map((m) => m.name).filter(Boolean),
      ...marketerClients
        .map((c) => c.marketer_name || c.marketerName || "")
        .filter(Boolean),
    ]),
  );

  const filteredAndSortedClients = useMemo(() => {
    return marketerClients
      .filter((c) => {
        if (selectedMarketerFilter !== "all") {
          const mName = c.marketer_name || c.marketerName || "";
          if (mName !== selectedMarketerFilter) return false;
        }

        if (clientStatusFilter !== "all") {
          const status = c.status || "Reserved";
          if (status.toLowerCase() !== clientStatusFilter.toLowerCase())
            return false;
        }

        if (clientSearch.trim() !== "") {
          const query = clientSearch.toLowerCase();
          const mName = (c.marketer_name || c.marketerName || "").toLowerCase();
          const cName = (c.name || c.client_name || "").toLowerCase();
          const phone = (c.phone || "").toLowerCase();
          const projName = getProjectName(c).toLowerCase();

          if (
            !mName.includes(query) &&
            !cName.includes(query) &&
            !phone.includes(query) &&
            !projName.includes(query)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const valA: any = a.created_at || "";
        const valB: any = b.created_at || "";
        return clientSortOrder === "asc"
          ? valA < valB
            ? -1
            : 1
          : valA > valB
            ? -1
            : 1;
      });
  }, [
    marketerClients,
    selectedMarketerFilter,
    clientStatusFilter,
    clientSearch,
    clientSortOrder,
    getProjectName,
  ]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-left" dir="ltr">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ⚙️ Admin Portal - Real Estate Manager
          </h1>
          <p className="text-xs text-gray-500">
            Manage floors, pricing, payments & marketer client approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
            Active Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="p-2 bg-blue-50 border border-blue-300 font-bold text-blue-900 text-xs rounded-lg outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.title || "Untitled Project"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-300 pb-2">
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "clients"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          👥 Marketers & Clients ({marketerClients.length})
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "pricing"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          💳 Pricing & Payment Plans ({marketerClients.length})
        </button>
      </div>

      {/* TAB: MARKETERS & CLIENTS */}
      {activeTab === "clients" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                👥 Marketer Registered Clients
              </h2>
              <p className="text-xs text-gray-500">
                Review qualification requests, manage status, and view uploaded
                receipts/CPOs
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-300">
              <input
                type="text"
                placeholder="Search client, phone..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="p-1.5 text-xs border rounded-lg outline-none w-44"
              />

              <select
                value={selectedMarketerFilter}
                onChange={(e) => setSelectedMarketerFilter(e.target.value)}
                className="p-1.5 bg-white border font-bold text-gray-800 text-xs rounded-lg"
              >
                <option value="all">-- All Marketers --</option>
                {marketerOptions.map((name) => (
                  <option key={name} value={name}>
                    👤 {name}
                  </option>
                ))}
              </select>

              <select
                value={clientStatusFilter}
                onChange={(e) => setClientStatusFilter(e.target.value)}
                className="p-1.5 bg-white border text-xs rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="Request for Qualification">
                  Request for Qualification
                </option>
                <option value="Qualified">Qualified</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={fetchMarketerClients}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border rounded-lg text-xs font-bold"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                <tr>
                  <th className="p-3 border">Marketer Name</th>
                  <th className="p-3 border">Client Name</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Project Name</th>
                  <th className="p-3 border">Unit / Details</th>
                  <th className="p-3 border">Status & Actions</th>
                  <th className="p-3 border text-center">Receipt File</th>
                  <th className="p-3 border text-center">CPO Document</th>
                  <th className="p-3 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-6 text-center text-gray-500 font-semibold"
                    >
                      No client records found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedClients.map((client) => {
                    const receiptUrl = getReceiptUrl(client);
                    const cpoUrl = getCpoUrl(client);
                    const currentStatus = (
                      client.status || "Reserved"
                    ).toLowerCase();
                    const isQualificationRequest =
                      currentStatus.includes("qualification") ||
                      currentStatus.includes("request") ||
                      currentStatus === "pending" ||
                      currentStatus === "new";

                    return (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border font-bold text-blue-800">
                          {client.marketer_name ||
                            client.marketerName ||
                            "Unknown"}
                        </td>
                        <td className="p-3 border font-semibold">
                          {client.name || client.client_name}
                        </td>
                        <td className="p-3 border">{client.phone}</td>
                        <td className="p-3 border font-semibold text-gray-800">
                          {getProjectName(client)}
                        </td>
                        <td className="p-3 border font-medium text-amber-900">
                          {client.apartment_id || client.apartmentId || "-"}
                        </td>

                        {/* Status & Conditional Actions Column */}
                        <td className="p-3 border">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-full text-[10px] uppercase ${
                                currentStatus === "closed"
                                  ? "bg-slate-800 text-white"
                                  : currentStatus === "qualified"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : currentStatus === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {client.status || "Reserved"}
                            </span>

                            {/* Show Approve/Reject action buttons conditionally when decision is needed */}
                            {isQualificationRequest ? (
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  onClick={() =>
                                    handleUpdateClientStatus(
                                      client.id,
                                      "Qualified",
                                    )
                                  }
                                  className="px-2.5 py-1 rounded font-bold text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateClientStatus(
                                      client.id,
                                      "Rejected",
                                    )
                                  }
                                  className="px-2.5 py-1 rounded font-bold text-[10px] bg-red-600 hover:bg-red-700 text-white transition shadow-sm cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 mt-1 opacity-80 hover:opacity-100">
                                <button
                                  onClick={() =>
                                    handleUpdateClientStatus(
                                      client.id,
                                      "Qualified",
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    currentStatus === "qualified"
                                      ? "bg-emerald-700 text-white"
                                      : "bg-gray-200 text-gray-600 hover:bg-emerald-100"
                                  }`}
                                >
                                  Qualified
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateClientStatus(
                                      client.id,
                                      "Rejected",
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    currentStatus === "rejected"
                                      ? "bg-red-700 text-white"
                                      : "bg-gray-200 text-gray-600 hover:bg-red-100"
                                  }`}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* View Receipt Column (Checks both direct fields and payment history) */}
                        <td className="p-3 border text-center">
                          {receiptUrl ? (
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[10px] shadow-sm transition"
                            >
                              📄 View Receipt
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              —
                            </span>
                          )}
                        </td>

                        {/* View CPO Column */}
                        <td className="p-3 border text-center">
                          {cpoUrl ? (
                            <a
                              href={cpoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-bold text-[10px] shadow-sm transition"
                            >
                              📜 View CPO
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              —
                            </span>
                          )}
                        </td>

                        <td className="p-3 border text-gray-500 whitespace-nowrap">
                          {client.created_at
                            ? new Date(client.created_at).toLocaleDateString(
                                "en-US",
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Payment Manager & Flexible Receipt Selection */}
      {selectedClientForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  📋 Payment Manager -{" "}
                  {selectedClientForPayment.name ||
                    selectedClientForPayment.client_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unit:{" "}
                  <span className="text-amber-300 font-semibold">
                    {selectedClientForPayment.apartment_id || "N/A"}
                  </span>{" "}
                  | Project:{" "}
                  <span className="text-blue-300 font-semibold">
                    {getProjectName(selectedClientForPayment)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForPayment(null)}
                className="text-slate-400 hover:text-white text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Payments Schedule Table */}
                <div className="lg:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                    <span>📊 Payment History Schedule</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black">
                      {clientPayments.length} Payments Saved
                    </span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200 bg-white">
                      <thead className="bg-slate-800 text-white uppercase font-bold text-[11px]">
                        <tr>
                          <th className="p-2.5 border">Payment #</th>
                          <th className="p-2.5 border">Date</th>
                          <th className="p-2.5 border">Amount (ETB)</th>
                          <th className="p-2.5 border text-center">
                            Receipt File
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientPayments.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-6 text-center text-slate-400 italic"
                            >
                              No installment payments entered yet.
                            </td>
                          </tr>
                        ) : (
                          clientPayments.map((pay, idx) => (
                            <tr
                              key={pay.id || idx}
                              className="border-b hover:bg-slate-100"
                            >
                              <td className="p-2.5 border font-extrabold text-purple-900">
                                {pay.payment_name ||
                                  getOrdinalPaymentName(idx + 1)}
                              </td>
                              <td className="p-2.5 border font-medium text-slate-700">
                                {pay.date}
                              </td>
                              <td className="p-2.5 border font-bold text-emerald-700">
                                {Number(pay.amount).toLocaleString()} ETB
                              </td>
                              <td className="p-2.5 border text-center">
                                {pay.receipt_url ? (
                                  <a
                                    href={pay.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] inline-flex items-center gap-1 transition"
                                  >
                                    📄 View
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">
                                    No Receipt
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Add Payment Form with Enhanced Receipt Selection */}
                <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-amber-400 text-sm mb-1">
                      ➕ Add Payment Entry
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-4">
                      Next entry will save as:{" "}
                      <span className="text-emerald-300 font-extrabold underline">
                        {getOrdinalPaymentName(clientPayments.length + 1)}
                      </span>
                    </p>

                    <form
                      onSubmit={handleAddPaymentSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          1. Date (Calendar) *
                        </label>
                        <input
                          type="date"
                          value={newPaymentDate}
                          onChange={(e) => setNewPaymentDate(e.target.value)}
                          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          2. Amount (ETB) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 500000"
                          value={newPaymentAmount}
                          onChange={(e) => setNewPaymentAmount(e.target.value)}
                          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold text-emerald-400"
                          required
                        />
                      </div>

                      {/* Flexible Receipt Selection (From Marketer OR Device Upload) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          3. Receipt Selection (وصل الاستلام)
                        </label>
                        <div className="space-y-2">
                          <select
                            value={receiptSourceMode}
                            onChange={(e) => {
                              const val = e.target.value as
                                | "marketer"
                                | "upload"
                                | "none";
                              setReceiptSourceMode(val);
                              if (
                                val === "marketer" &&
                                availableMarketerReceiptsList.length > 0
                              ) {
                                setSelectedMarketerReceiptUrl(
                                  availableMarketerReceiptsList[0].url,
                                );
                              }
                            }}
                            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white outline-none focus:ring-2 focus:ring-amber-500 font-semibold cursor-pointer"
                          >
                            <option value="marketer">
                              📋 Select from Marketer Uploads (اختيار من إدخالات
                              الماركتر)
                            </option>
                            <option value="upload">
                              📁 Upload New File from Device (رفع ملف جديد من
                              الجهاز)
                            </option>
                            <option value="none">
                              🚫 No Receipt (لا يوجد وصل استلام)
                            </option>
                          </select>

                          {/* Sub-option 1: Select Marketer Uploaded Receipts */}
                          {receiptSourceMode === "marketer" && (
                            <div className="space-y-1.5 pt-1">
                              {availableMarketerReceiptsList.length > 0 ? (
                                <>
                                  <select
                                    value={selectedMarketerReceiptUrl}
                                    onChange={(e) =>
                                      setSelectedMarketerReceiptUrl(
                                        e.target.value,
                                      )
                                    }
                                    className="w-full p-2 bg-slate-800 border border-indigo-500 rounded-lg text-xs text-white outline-none focus:ring-2 focus:ring-indigo-400"
                                  >
                                    {availableMarketerReceiptsList.map(
                                      (item, idx) => (
                                        <option key={idx} value={item.url}>
                                          {item.label}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                  {selectedMarketerReceiptUrl && (
                                    <a
                                      href={selectedMarketerReceiptUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded transition mt-1"
                                    >
                                      👁️ Preview Marketer Receipt
                                    </a>
                                  )}
                                </>
                              ) : (
                                <p className="text-[11px] text-amber-400 italic">
                                  ⚠️ No receipts were previously uploaded by the
                                  marketer for this lead.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Sub-option 2: Upload File From Device */}
                          {receiptSourceMode === "upload" && (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleReceiptFileChange}
                                className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                              />

                              {newReceiptPreview && (
                                <a
                                  href={newReceiptPreview}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-md whitespace-nowrap transition flex items-center gap-1 shadow-sm"
                                >
                                  👁️ View
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingPayment}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-2"
                      >
                        {isSavingPayment
                          ? "⏳ Saving..."
                          : `Save as ${getOrdinalPaymentName(clientPayments.length + 1)}`}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedClientForPayment(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardd;
