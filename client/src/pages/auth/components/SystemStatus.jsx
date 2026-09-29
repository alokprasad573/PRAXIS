const SystemStatus = () => {
  return (
    <>
       <div className="fixed bottom-4 left-4 flex items-center bg-dark-card/90 backdrop-blur-md border border-[#2a2520] px-3.5 py-1.5 rounded-full z-10 shadow-xl">
        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2.5 shadow-[0_0_8px_rgba(52,211,153,0.8)] relative">
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
        </div>
        <span className="text-xs font-mono text-cream-300">
          System Operational
        </span>
      </div>
    </>
  )
}

export default SystemStatus;