import { useState } from "react";
import { Link } from "react-router-dom";
import PubertyGuide from "@/components/guidance/PubertyGuide";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowLeft, Calendar, Heart, Utensils, Activity, ChevronRight } from "lucide-react";

const Puberty = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Puberty Phase Active</span>
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
              Puberty Guide
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your personalized guide to navigating puberty with nutrition, lifestyle, and health insights
            </p>
          </div>
        </ScrollReveal>

        {/* Quick Navigation */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link 
              to="/puberty/nutrition-guide"
              className="group bg-white rounded-2xl p-6 border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Utensils className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Nutrition Guide</h3>
                  <p className="text-sm text-gray-600">Personalized diet plans and nutrition tips</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link 
              to="/health-log"
              className="group bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Health Tracking</h3>
                  <p className="text-sm text-gray-600">Track your cycle and symptoms</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link 
              to="/puberty/nutrition-guide/personalized-diet"
              className="group bg-white rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Personalized Diet</h3>
                  <p className="text-sm text-gray-600">Custom meal plans for your needs</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </ScrollReveal>

        {/* Main Puberty Guide Component */}
        <PubertyGuide />
      </div>
    </div>
  );
};

export default Puberty;
