const TYPE_COLORS: Record<string, string> = {
  BOS: "bg-blue-900 text-blue-300",
  CHoCH: "bg-purple-900 text-purple-300",
  OB: "bg-orange-900 text-orange-300",
  FVG: "bg-yellow-900 text-yellow-300",
  LiqSweep: "bg-pink-900 text-pink-300",
};

const STATUS_COLORS: Record<string, string> = {
  ordered: "bg-green-900 text-green-300",
  validated: "bg-teal-900 text-teal-300",
  rejected: "bg-red-900 text-red-400",
  skipped_risk: "bg-orange-900 text-orange-300",
  pending: "bg-gray-800 text-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  ordered: "已下單",
  validated: "已驗證",
  rejected: "已拒絕",
  skipped_risk: "風控拒絕",
  pending: "待處理",
};

export function SignalTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        TYPE_COLORS[type] ?? "bg-gray-800 text-gray-300"
      }`}
    >
      {type}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        STATUS_COLORS[status] ?? "bg-gray-800 text-gray-400"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
