"use client";

import { useRouter } from "next/navigation";
import { WalletButton } from "../solana/solana-provider";

export default function DashboardFeature() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-base-200 via-base-100 to-base-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="absolute h-full w-full bg-gradient-to-r from-transparent via-base-200/50 to-transparent blur-3xl" />
        <div className="w-full max-w-[1400px] mx-auto px-6 py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mt-8 mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                Attention Vault
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-base-content/70 mb-12 leading-relaxed max-w-3xl mx-auto">
              Revolutionizing influencer partnerships with autonomous, smart
              contract-powered payouts. Secure, transparent, and efficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => router.push("/company")}
                className="btn btn-primary btn-lg group relative overflow-hidden px-8"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                Launch Company Dashboard
              </button>
              <button
                onClick={() => router.push("/company")}
                className="btn btn-accent btn-lg group relative overflow-hidden px-8"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-white/20 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                View Influencer Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-base-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(var(--primary-rgb),0.1),transparent)]" />
        <div className="w-full max-w-[1400px] mx-auto px-6 py-24 relative">
          <h2 className="text-4xl font-bold text-center mb-16">
            Choose Your Dashboard
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Companies */}
            <div className="card bg-gradient-to-br from-base-200 to-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl border border-base-content/5">
              <div className="card-body p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h2 className="card-title text-3xl">For Companies</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">
                      Automate influencer payments with smart contracts
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">Set performance-based milestones</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">
                      Track campaign progress in real-time
                    </p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-10">
                  <button
                    onClick={() => router.push("/company")}
                    className="btn btn-primary btn-lg group relative overflow-hidden px-8"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    Launch Company Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* For Influencers */}
            <div className="card bg-gradient-to-br from-base-200 to-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl border border-base-content/5">
              <div className="card-body p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center backdrop-blur-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                      />
                    </svg>
                  </div>
                  <h2 className="card-title text-3xl">For Influencers</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">
                      Receive automatic payments upon reaching goals
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">
                      Monitor your earnings and milestones
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 backdrop-blur-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">
                      Transparent and secure payment system
                    </p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-10">
                  <button
                    onClick={() => router.push("/company")}
                    className="btn btn-accent btn-lg group relative overflow-hidden px-8"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-white/20 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    View Influencer Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-base-200 border-t border-base-300">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex flex-col items-center gap-6">
            <a
              href="https://twitter.com/AttentionVault"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-center">
              <p className="text-sm text-base-content/70">
                © {new Date().getFullYear()} Attention Vault. All rights
                reserved.
              </p>
              <span className="hidden md:inline text-base-content/70">•</span>
              <p className="text-sm text-base-content/70">
                Built with{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 inline-block align-text-bottom"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>{" "}
                for the Sonic SVM community
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
