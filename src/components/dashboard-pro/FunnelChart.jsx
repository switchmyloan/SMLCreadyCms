const FunnelChart = ({ stages = [], title, showPercentage = true }) => {
  const maxValue = stages.length > 0 ? stages[0].value : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      {title && (
        <h4 className="text-base font-semibold text-gray-800 mb-4">{title}</h4>
      )}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercent = Math.max((stage.value / maxValue) * 100, 15);
          const conversionFromPrev =
            index > 0 && stages[index - 1].value > 0
              ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
              : null;

          return (
            <div key={stage.name}>
              {showPercentage && conversionFromPrev && (
                <div className="flex items-center gap-2 ml-4 mb-1">
                  <div className="w-px h-3 bg-gray-300" />
                  <span className="text-xs text-gray-400">
                    {conversionFromPrev}% conversion
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-600 font-medium truncate flex-shrink-0">
                  {stage.name}
                </div>
                <div className="flex-1 relative">
                  <div
                    className="h-9 rounded-lg flex items-center px-3 transition-all"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: stage.color || '#6366f1',
                      opacity: 1 - index * 0.1,
                    }}
                  >
                    <span className="text-white text-sm font-semibold">
                      {stage.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelChart;
