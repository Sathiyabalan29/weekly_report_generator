function StatCard({ title, value, icon: Icon, helper }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon size={24} />
          </div>
        )}
      </div>

      {helper && <p className="text-xs text-slate-400 mt-4">{helper}</p>}
    </div>
  );
}

export default StatCard;