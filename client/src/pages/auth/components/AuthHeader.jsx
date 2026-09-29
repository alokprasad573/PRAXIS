import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


const AuthHeader = () => {
  return (
    <>
       <div className="mb-6 flex justify-between items-center text-base font-mono">
          <Link
            to="/"
            className="text-[#8a7f70] hover:text-orange-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Product
          </Link>
          <span className="text-sm text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            v2.0 Beta
          </span>
        </div>
    </>
  )
}

export default AuthHeader;