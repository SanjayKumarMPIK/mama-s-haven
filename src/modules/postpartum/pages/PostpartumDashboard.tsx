import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, Heart, Activity, Calendar, Baby, Utensils, Moon, Sun, Droplets, ShieldAlert, Stethoscope, ChevronRight } from "lucide-react";

import { PostpartumGuard } from "../components/PostpartumGuard";
import PostpartumOverviewCard from "../components/PostpartumOverviewCard";
import RecoverySummaryCards from "../components/RecoverySummaryCards";
import { PostpartumRecoveryCard } from "../recovery/PostpartumRecoveryCard";
import { PostpartumTimeline } from "../recovery/PostpartumTimeline";
import NutritionTipsCard from "../components/NutritionTipsCard";
import ActiveAlertsCard from "../components/ActiveAlertsCard";
import VisualAnalytics from "@/components/dashboard/VisualAnalytics";
import { usePostpartumRecovery } from "../recovery/usePostpartumRecovery";
import { useHealthLog } from "@/hooks/useHealthLog";

const PostpartumDashboard = () => {
  const { profile } = useProfile();
  const { currentWeek } = usePostpartumRecovery();
  const { getPhaseLogs } = useHealthLog();

  const postpartumLogs = getPhaseLogs("postpartum");
  const mappedLogs = Object.entries(postpartumLogs).map(([date, entry]) => ({
    date,
    entry: entry as any,
  }));

  return (
    <PostpartumGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Postpartum Phase Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Page Title */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Postpartum Care
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your comprehensive guide to postpartum recovery, nutrition, and baby care
            </p>
          </div>
        </ScrollReveal>

        {/* Welcome Section */}
        <ScrollReveal delay={100}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Baby className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Postpartum Journey</h2>
                <p className="text-gray-600">Track your recovery and get personalized care recommendations</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Physical Recovery</h3>
                </div>
                <p className="text-sm text-gray-600">Monitor your healing progress and get recovery tips</p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Nutrition Support</h3>
                </div>
                <p className="text-sm text-gray-600">Postpartum meal plans and nutrition guidance</p>
              </div>
              
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-gray-900">Sleep & Rest</h3>
                </div>
                <p className="text-sm text-gray-600">Sleep tips and rest management strategies</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* --- NEW PREMIUM DASHBOARD SECTION --- */}
        
        {/* Metrics & Recovery */}
        <ScrollReveal delay={150}>
          <div className="mb-8">
            <RecoverySummaryCards />
          </div>
        </ScrollReveal>

        {/* Connect with a Doctor */}
        <ScrollReveal delay={160}>
          <Link
            to="/connect"
            className="block rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 via-cyan-50/60 to-sky-50/40 p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 group mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-200/50">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Connect with a Doctor</h3>
                <p className="text-sm text-gray-500">Send a connection request using your doctor's code</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </ScrollReveal>

        {/* Score & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
             <ScrollReveal delay={200} className="h-full">
               <PostpartumRecoveryCard />
             </ScrollReveal>
          </div>
          <div className="lg:col-span-2">
             <ScrollReveal delay={250} className="h-full">
               <PostpartumTimeline />
             </ScrollReveal>
          </div>
        </div>

        {/* Visual Analytics */}
        <ScrollReveal delay={300}>
          <div className="mb-8">
            <VisualAnalytics pubertyLogs={mappedLogs} />
          </div>
        </ScrollReveal>

        {/* Tips & Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ScrollReveal delay={350} className="h-full">
             <NutritionTipsCard />
          </ScrollReveal>
          <ScrollReveal delay={400} className="h-full">
             <ActiveAlertsCard />
          </ScrollReveal>
        </div>

        {/* Status Footer */}
        <ScrollReveal delay={450}>
          <div className="mb-8">
            <PostpartumOverviewCard />
          </div>
        </ScrollReveal>

      </div>
    </div>
    </PostpartumGuard>
  );
};

export default PostpartumDashboard;
