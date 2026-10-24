import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- Yeh import add karein
import {
  UserPlus,
  Trash2,
  X,
  Loader2,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { workspaceApi } from "../../../utils/apiService";

const TeamView = ({ workspace, members = [], setMembers, onToast }) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "Staff Engineer",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roles = ["Staff Engineer", "DevOps Lead", "Security Auditor", "Member"];

  const fetchLiveMembers = async () => {
    setIsRefreshing(true);
    try {
      const res = await workspaceApi.getMembers();
      if (res.success && res.data && setMembers) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch fresh team members:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    workspaceApi
      .getMembers()
      .then((res) => {
        if (isMounted && res.success && res.data && setMembers) {
          setMembers(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch fresh team members:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [setMembers]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!inviteData.email || !inviteData.email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await workspaceApi.inviteMember(inviteData);
      if (res.success) {
        if (res.data && setMembers) setMembers(res.data);
        if (onToast)
          onToast(`Invitation sent to ${inviteData.email}`, "success");
        setIsInviteOpen(false);
        setInviteData({ name: "", email: "", role: "Staff Engineer" });
      } else {
        setErrorMsg(res.message || "Failed to invite member.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to invite collaborator to workspace.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName} from this workspace?`,
      )
    ) {
      return;
    }

    setDeletingId(memberId);
    try {
      const res = await workspaceApi.removeMember(memberId);
      if (res.success && res.data) {
        if (setMembers) setMembers(res.data);
        if (onToast) onToast(`${memberName} removed from workspace`, "info");
      } else {
        if (onToast) onToast(res.message || "Failed to remove member", "error");
      }
    } catch (err) {
      if (onToast) {
        onToast(
          err.response?.data?.message || "Error removing member",
          "error",
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeInUp font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight font-sans">
            Engineering Team
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            {workspace?.name || "Workspace"} • {members.length} platform
            contributor{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchLiveMembers}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-[#282420] text-[#a89f91] hover:text-white hover:bg-[#14151b] cursor-pointer transition-colors"
            title="Refresh Team List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
          </button>
          
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              setIsInviteOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite Member
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-xs">
          <thead className="text-[10px] font-mono text-[#a89f91] uppercase bg-dark-base border-b border-[#201d1a]">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Contributor</th>
              <th className="px-5 py-3 text-left font-semibold">
                Workspace Role
              </th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-left font-semibold">Joined</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#201d1a]">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-12 text-center text-[#8a7f70] text-xs font-mono"
                >
                  No contributors found in this workspace. Click &quot;Invite
                  Member&quot; to add team members.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const memberId = m.id || m.userId;
                const isDeleting = deletingId === memberId;

                return (
                  <tr
                    key={m.email || memberId}
                    className="hover:bg-[#14151b] transition-colors"
                  >
                    {/* User Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 font-mono">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-orange-400/30 shrink-0">
                          {m.initials || "MB"}
                        </div>
                        <div>
                          <div className="text-cream-100 font-bold text-xs flex items-center gap-1.5">
                            {m.name}
                            {m.isOwner && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                                OWNER
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8a7f70]">
                            {m.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="text-[11px] bg-[#181920] text-[#d6c5a8] border border-[#282420] px-2.5 py-1 rounded font-mono inline-flex items-center gap-1">
                        <Shield className="w-3 h-3 text-orange-400" />
                        {m.role || "Member"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 text-xs text-[#8a7f70] font-mono">
                      {m.joinedAt
                        ? new Date(m.joinedAt).toLocaleDateString()
                        : "Recently"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      {m.isOwner ? (
                        <span className="text-[10px] text-[#524c45] font-mono italic">
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(memberId, m.name)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-[#8a7f70] hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                          title="Remove member from workspace"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {/* Invite Member Modal (Screen Dead-Center via Portal) */}
      {isInviteOpen &&
        createPortal(
          <div
            id="modal-invite-member"
            onClick={(e) => {
              if (e.target.id === "modal-invite-member") setIsInviteOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-mono"
          >
            <div className="w-full max-w-md bg-[#0b0c10] border border-[#2a2520] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden m-auto relative z-10 animate-fadeInUp">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#201d1a] bg-[#101218]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-cream-100">
                      Invite Contributor
                    </h2>
                    <p className="text-[11px] text-[#8a7f70]">
                      Add member to {workspace?.name || "Workspace"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="text-[#8a7f70] hover:text-white p-1 rounded-lg hover:bg-[#1a1c24] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={handleInviteSubmit}
                className="p-5 space-y-4 text-xs"
              >
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={inviteData.name}
                    onChange={(e) =>
                      setInviteData({ ...inviteData, name: e.target.value })
                    }
                    className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    required
                    value={inviteData.email}
                    onChange={(e) =>
                      setInviteData({ ...inviteData, email: e.target.value })
                    }
                    className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                    Workspace Role
                  </label>
                  <select
                    value={inviteData.role}
                    onChange={(e) =>
                      setInviteData({ ...inviteData, role: e.target.value })
                    }
                    className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#78716c] mt-1">
                    Grants specific authorization gate approvals and workflow
                    capabilities.
                  </p>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#201d1a]">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-2 rounded-lg border border-[#282420] text-[#a89f91] hover:bg-[#14151b] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !inviteData.email}
                    className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TeamView;
export { TeamView };
