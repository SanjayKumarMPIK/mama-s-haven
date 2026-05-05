import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, Heart, Activity, Calendar, Baby, Utensils, Moon, Sun, Droplets, ShieldAlert } from "lucide-react";

const PostpartumDashboard = () => {
  const { profile } = useProfile();

  return (
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

        {/* Quick Actions */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link 
              to="/health-log"
              className="group bg-white rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Daily Log</h3>
                <p className="text-sm text-gray-600">Track your recovery</p>
              </div>
            </Link>

            <div className="group bg-white rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Exercises</h3>
                <p className="text-sm text-gray-600">Gentle recovery workouts</p>
              </div>
            </div>

            <div className="group bg-white rounded-xl p-6 border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Droplets className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Hydration</h3>
                <p className="text-sm text-gray-600">Track water intake</p>
              </div>
            </div>

            <div className="group bg-white rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Emergency</h3>
                <p className="text-sm text-gray-600">Quick help access</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Recovery Timeline */}
        <ScrollReveal delay={300}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recovery Timeline</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">First 24 Hours</h3>
                  <p className="text-sm text-gray-600">Rest, hydration, and basic monitoring</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">First Week</h3>
                  <p className="text-sm text-gray-600">Focus on healing, nutrition, and establishing routines</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Weeks 2-6</h3>
                  <p className="text-sm text-gray-600">Gradual return to activities and continued recovery</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">6+ Weeks</h3>
                  <p className="text-sm text-gray-600">Postpartum check-up and gradual return to normal activities</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default PostpartumDashboard;
