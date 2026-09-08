export function MetricCard({ title, value, sub, trend, icon }: { title:string, value:string|number, sub?:string, trend?:string, icon?:string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{title}</div>
          <div className="text-2xl font-bold text-[#1a1a1a] mt-1">{value}</div>
          {sub && <div className="text-sm text-gray-500 mt-1">{sub}</div>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#EDF4F2] text-[#2C5F2D] grid place-items-center">{icon||'•'}</div>
      </div>
      {trend && <div className="mt-3 text-xs font-medium text-[#2C5F2D] bg-[#EDF4F2] inline-block px-2 py-1 rounded-full">{trend}</div>}
    </div>
  );
}
