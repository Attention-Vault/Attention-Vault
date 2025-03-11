"use client";

import { useRouter } from "next/navigation";
import { WalletButton } from "../solana/solana-provider";

export default function DashboardFeature() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-base-200 to-base-100 border-b border-base-300">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
                Attention Vault
              </span>
            </h1>
            <p className="text-xl text-base-content/80 mb-8 leading-relaxed">
              Revolutionizing influencer partnerships with autonomous, smart
              contract-powered payouts. Secure, transparent, and efficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/company")}
                className="btn btn-primary"
              >
                Launch Company Dashboard
              </button>
              <button
                onClick={() => router.push("/company")}
                className="btn btn-accent"
              >
                View Influencer Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-base-100">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Dashboard
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Companies */}
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
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
                  <h2 className="card-title text-2xl">For Companies</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary"
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
                    <p>Automate influencer payments with smart contracts</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary"
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
                    <p>Set performance-based milestones</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary"
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
                    <p>Track campaign progress in real-time</p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-6">
                  <button
                    onClick={() => router.push("/company")}
                    className="btn btn-primary"
                  >
                    Launch Company Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* For Influencers */}
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-accent"
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
                  <h2 className="card-title text-2xl">For Influencers</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-accent"
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
                    <p>Receive automatic payments upon reaching goals</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-accent"
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
                    <p>Monitor your earnings and milestones</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-accent"
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
                    <p>Transparent and secure payment system</p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-6">
                  <button
                    onClick={() => router.push("/company")}
                    className="btn btn-accent"
                  >
                    View Influencer Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Wallet Section */}
      <div
        className="w-full bg-base-200 border-t border-base-300"
        style={{
          marginTop: "100px",
        }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-base-content/70 mb-6">
              Connect your wallet to start creating contracts or managing your
              earnings
            </p>
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
  );
}
