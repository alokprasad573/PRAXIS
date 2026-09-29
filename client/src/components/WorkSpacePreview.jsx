import dashboardImage from "../assets/images/IMG-1.png";

const WorkSpacePreview = () => {
  return (
    <>
         {/* Product Showcase */}
        <div className="mx-auto mb-16 w-full max-w-6xl sm:mb-20">
          <div className="relative rounded-2xl border border-[#282420] bg-[#0b0c11] p-1.5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(249,115,22,0.14)] sm:p-2">
            {/* Browser Header */}
            <div className="flex items-center justify-between gap-2 rounded-t-xl border-b border-[#201d1a] bg-[#14151c] px-3 py-2.5 sm:px-4">
              <div className="flex shrink-0 items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
              </div>

              <div className="hidden max-w-[65%] truncate rounded-md border border-[#24211e] bg-[#08090d] px-4 py-1 font-mono text-[11px] text-[#b8ab97] sm:block">
                praxis.com/workspace/dashboard
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="hidden sm:inline">LIVE</span>
              </div>
            </div>

            {/* Dashboard Image */}
            <div className="overflow-hidden rounded-b-xl bg-[#070709]">
              <img
                src={dashboardImage}
                alt="PRAXIS Autonomous AI Command Center"
                className="block h-auto w-full select-none"
                loading="eager"
              />
            </div>
          </div>

          {/* Display Bottom Notch */}
          <div className="mx-auto h-1.5 w-28 rounded-b-md border-t border-[#12131a] bg-[#1c1d26] shadow-md" />
        </div>
    </>
  )
}

export default WorkSpacePreview;