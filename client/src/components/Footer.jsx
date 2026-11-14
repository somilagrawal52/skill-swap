import { Link } from "react-router-dom";
import { ArrowLeftRight, Heart, Github, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">SkillSwap</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier open-source peer-to-peer skill barter platform. Trade your expertise, learn anything, and connect with a passionate community without money.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  Explore Marketplace
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition">
                  Community Directory
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Exchange Dashboard
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-white transition">
                  List Your Skills
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?category=Development %26 IT" className="hover:text-white transition">
                  Development & IT
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Design %26 Creative" className="hover:text-white transition">
                  Design & Creative
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Languages" className="hover:text-white transition">
                  Languages & Translation
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Marketing %26 Business" className="hover:text-white transition">
                  Marketing & Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Principles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Why Barter?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Knowledge is meant to be shared. By trading hours and mentorship reciprocal-style, we eliminate financial barriers to personal and career mastery.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Smart Barter Matching Engine Active</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SkillSwap Community. Built for open knowledge exchange.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered with care</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for learners worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
