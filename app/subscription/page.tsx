"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ToastProvider, { useToastContext } from "@/app/components/ToastProvider";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { createMidtransCheckout, getMySubscriptionState, getSubscriptionPlans, SubscriptionPlan, SubscriptionState } from "@/services/subscription";

function SubscriptionContent() {
  const { showToast } = useToastContext();
  const searchParams = useSearchParams();
  const highlightedPlan = searchParams.get("plan");

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [state, setState] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const endAt = state?.subscription?.end_at ? new Date(state.subscription.end_at) : null;
  const isExpired = state?.subscription ? !state.is_active : false;

  const durationOptions = useMemo(() => [1, 6, 12], []);

  const refresh = async () => {
    setLoading(true);
    try {
      const [plansData, stateData] = await Promise.all([getSubscriptionPlans(), getMySubscriptionState()]);
      setPlans(plansData);
      setState(stateData);
    } catch (e: any) {
      showToast(e?.response?.data?.detail || "Failed to load subscription data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCheckout = async (planId: string, durationMonths: number) => {
    try {
      setCheckingOut(`${planId}-${durationMonths}`);
      const res = await createMidtransCheckout({ plan_id: planId, duration_months: durationMonths });
      window.location.href = res.redirect_url;
    } catch (e: any) {
      showToast(e?.response?.data?.detail || "Failed to create checkout", "error");
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10 animate-pulse"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-emerald-400 mx-auto rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6 animate-fade-in font-mono tracking-tight">
            Premium Chatbot Plans
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
            Unlock the power of advanced AI models with our enterprise-grade subscription plans. Scale your conversations with cutting-edge technology.
          </p>
          <button
            onClick={refresh}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold hover:from-cyan-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Syncing...
                </div>
              ) : (
                "🔄 Refresh Status"
              )}
            </div>
          </button>
        </div>

        {/* Status Card */}
        <div className="mb-16 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                <span className="ml-4 text-slate-300 text-lg">Loading your subscription...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full animate-pulse ${state?.subscription && !isExpired ? 'bg-emerald-400 shadow-emerald-400/50 shadow-lg' : 'bg-red-400 shadow-red-400/50 shadow-lg'}`}></div>
                    <span className="font-bold text-slate-200 text-xl font-mono">Subscription Status</span>
                  </div>
                  {state?.subscription ? (
                    <>
                      <div className={`text-2xl font-bold font-mono ${isExpired ? 'text-red-400' : 'text-emerald-400'} animate-pulse`}>
                        {isExpired ? "⚠️ Expired" : "✅ Active"}
                      </div>
                      <div className="text-slate-400">
                        Valid until: <span className="text-white font-semibold font-mono">{endAt ? endAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-red-400 font-mono animate-pulse">❌ No Active Subscription</div>
                      <div className="text-slate-400">Subscribe now to access premium chatbot models</div>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="font-bold text-slate-200 text-xl font-mono">Available Models</div>
                  <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex flex-wrap gap-2">
                      {(state?.effective_allowed_models || []).map((model) => (
                        <span key={model} className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-sm font-medium font-mono hover:scale-105 transition-transform duration-200 shadow-lg">
                          {model}
                        </span>
                      ))}
                      {(!state?.effective_allowed_models || state.effective_allowed_models.length === 0) && (
                        <span className="text-slate-500 font-mono">None available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isHighlighted = highlightedPlan === plan.plan_id;
            const isPopular = index === 1; // Assume middle plan is popular
            return (
              <div
                key={plan.plan_id}
                className={`group relative bg-slate-800/50 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:scale-105 hover:rotate-1 ${
                  isHighlighted ? 'border-yellow-400/50 ring-2 ring-yellow-400/20 shadow-yellow-500/20' : 'border-slate-700/50'
                } ${isPopular ? 'border-emerald-400/50 ring-1 ring-emerald-400/20' : ''} transform-gpu`}
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <div className="absolute inset-0 border border-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl animate-pulse"></div>
                
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-lg font-mono">
                      🔥 Most Popular
                    </span>
                  </div>
                )}
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg font-mono">
                      ⭐ Recommended
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl group-hover:animate-pulse group-hover:rotate-12 transition-transform duration-300">
                    {index === 0 ? '🤖' : index === 1 ? '🚀' : '⚡'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors font-mono group-hover:scale-105 transform duration-300">{plan.name}</h2>
                  </div>
                </div>

                <p className="text-slate-400 mb-8 leading-relaxed group-hover:text-slate-300 transition-colors relative z-10 font-light">{plan.description}</p>

                <div className="mb-8 relative z-10">
                  <div className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wide font-mono">Unlocked Models</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.allowed_models.map((model) => (
                      <span key={model} className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-full text-sm font-medium hover:bg-slate-600/50 transition-colors font-mono hover:scale-110 transform duration-200">
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wide font-mono">Choose Duration</div>
                  <div className="space-y-4">
                    {durationOptions.map((months) => {
                      const price = plan.prices_by_duration_months[String(months)];
                      const key = `${plan.plan_id}-${months}`;
                      const isCheckingOut = checkingOut === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleCheckout(plan.plan_id, months)}
                          disabled={loading || checkingOut !== null}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold hover:from-cyan-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 group-hover:animate-pulse relative overflow-hidden group/btn"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            {isCheckingOut ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <span className="text-lg font-mono">{months} Month{months > 1 ? 's' : ''}</span>
                                {typeof price === "number" && (
                                  <span className="font-bold text-xl font-mono">- Rp {price.toLocaleString("id-ID")}</span>
                                )}
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-slate-500 mt-6 text-center flex items-center justify-center gap-2 font-mono">
                    <span>🔒</span> Secure payment via Midtrans • Auto status updates
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <p className="text-slate-400 mb-4 font-mono">Need help choosing the right plan?</p>
            <button className="px-6 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 font-mono">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SubscriptionContent />
      </ToastProvider>
    </ProtectedRoute>
  );
}