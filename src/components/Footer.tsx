import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gradient-bloom mb-3">MomBloom</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Supporting mothers through every stage of their journey — from pregnancy to parenthood.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[["Pregnancy Tools", "/tools"], ["Shopping", "/shopping"], ["Articles", "/articles"], ["Postpartum", "/postpartum"]].map(([label, path]) => (
                <Link key={path} to={path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <div className="flex flex-col gap-2">
              {[["About Us", "/about"], ["Contact", "/contact"], ["Stress Relief", "/stress-relief"]].map(([label, path]) => (
                <Link key={path} to={path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by MomBloom &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
