import { BarChart3 } from "lucide-react";
import authIllustration from "../assets/auth-illustration.png";

function AuthBrandPanel() {
  return (
    <div
      className="hidden lg:flex w-1/2 min-h-screen relative overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${authIllustration})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/35" />

      <div className="relative z-10 w-full px-16 pt-16">
        <div className="max-w-sm">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-sm">
            <BarChart3 size={25} />
          </div>

          <h1 className="text-4xl font-bold text-slate-900 leading-tight">
            Weekly Report <br /> Generator
          </h1>

          <p className="text-slate-600 mt-4 text-sm leading-6">
            Stay organized. Share progress. Drive results together.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthBrandPanel;