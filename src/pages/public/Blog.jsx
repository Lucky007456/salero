import React from 'react';
import { Calendar, User, ArrowRight, TrendingUp, ShieldCheck, Globe2 } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "The Rising Demand for Premium Cavendish Bananas in Europe",
    excerpt: "Global market trends show a significant shift towards organic and sustainably sourced Cavendish varieties. Here's why Indian exports are leading the charge.",
    author: "Alpha Admin",
    date: "April 20, 2026",
    category: "Market Trends",
    image: "🍌",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Ensuring Quality: Our Cold Chain Logistics Process",
    excerpt: "How we maintain the 'Fresh from Farm' quality across thousands of miles using state-of-the-art climate-controlled shipping.",
    author: "Logistics Team",
    date: "April 15, 2026",
    category: "Operations",
    image: "🚚",
    readTime: "4 min read"
  },
  {
    id: 3,
    title: "Why Sustainable Agro-Exports are the Future of Farming",
    excerpt: "Exploring the impact of eco-friendly farming practices on international trade and consumer trust in the global market.",
    author: "Sustainability Dept",
    date: "April 10, 2026",
    category: "Sustainability",
    image: "🌱",
    readTime: "6 min read"
  }
];

export default function Blog() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16 slide-up">
        <h1 className="text-4xl md:text-5xl font-bold text-green-100 mb-6">
          Market <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Insights</span>
        </h1>
        <p className="text-lg text-gray-400">
          Stay updated with the latest trends in global agro-exports, logistics innovations, and sustainable farming practices.
        </p>
      </div>

      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-green-950/20 border border-green-900/30 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Market Growth</p>
            <p className="text-xl font-bold text-white">+14% YoY</p>
          </div>
        </div>
        <div className="bg-green-950/20 border border-green-900/30 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
            <Globe2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Regions</p>
            <p className="text-xl font-bold text-white">25+ Countries</p>
          </div>
        </div>
        <div className="bg-green-950/20 border border-green-900/30 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Quality Assurance</p>
            <p className="text-xl font-bold text-white">ISO Certified</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post, index) => (
          <article 
            key={post.id} 
            className="group bg-[#030f05] rounded-3xl border border-green-900/30 overflow-hidden hover:border-green-500/50 transition-all duration-300 slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Post Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-green-900/40 to-emerald-900/20 flex items-center justify-center relative overflow-hidden">
              <span className="text-6xl filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">{post.image}</span>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-500 text-[#020a04] text-[10px] font-bold uppercase tracking-wider">
                {post.category}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-green-500/60 font-medium">{post.readTime}</span>
                <button className="flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition-colors">
                  Read More <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter Section */}
      <div className="mt-20 p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Ahead of the Market</h2>
          <p className="text-gray-400 mb-8">Subscribe to our monthly newsletter for exclusive insights into the global agro-export market and seasonal harvest updates.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500/50 transition-colors"
            />
            <button className="px-8 py-4 bg-green-500 hover:bg-green-400 text-[#020a04] font-bold rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
