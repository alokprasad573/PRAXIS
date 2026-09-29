import logo from "../assets/images/logo.svg";

const Logo = () => {
  return (
    <>
      {/* <!-- Brand Logo --> */}
      <a href="#" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-[#090a0e] border border-orange-500/30 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:border-orange-400/60 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all">
          <img src={logo} alt="PRAXIS" className="w-full h-full" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
            PRAXIS
            <span className="text-[9px] font-mono font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
              v2.0 Beta
            </span>
          </span>
        </div>
      </a>
    </>
  );
};

export default Logo;
