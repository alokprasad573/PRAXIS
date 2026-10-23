import { UserPlus, MoreHorizontal } from "lucide-react";
import { mockTeamMembers } from "../../../utils/dashboardData";

const TeamView = ({ members = mockTeamMembers, onToast }) => {

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            Engineering Team
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Manage platform contributors, RBAC roles, and approval authorization privileges.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onToast && onToast("Invitation sent to new collaborator", "success")
          }
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> Invite Member
        </button>
      </div>

      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-xs">
          <thead className="text-[10px] font-mono text-[#a89f91] uppercase bg-[#070709] border-b border-[#201d1a]">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Member</th>
              <th className="px-5 py-3 text-left font-semibold">Workspace Role</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-left font-semibold">Last Active</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#201d1a]">
            {members.map((m) => (
              <tr key={m.email} className="hover:bg-[#14151b] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3 font-mono">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-orange-400/30 shrink-0">
                      {m.initials}
                    </div>
                    <div>
                      <div className="text-[#faf7f0] font-bold text-xs">{m.name}</div>
                      <div className="text-[11px] text-[#8a7f70]">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-[11px] bg-[#181920] text-[#d6c5a8] border border-[#282420] px-2.5 py-1 rounded font-mono">
                    {m.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-mono ${
                      m.status === "active"
                        ? "text-emerald-400 font-bold"
                        : "text-amber-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        m.status === "active"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-amber-400"
                      }`}
                    />
                    {m.status === "active" ? "Active" : "Invited"}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-[#8a7f70] font-mono">
                  {m.last}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    className="text-[#8a7f70] hover:text-orange-400 p-1 rounded hover:bg-[#181920] transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamView;

export { TeamView };
