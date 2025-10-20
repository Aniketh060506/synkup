import { useState, useEffect } from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend
} from 'recharts';
import {
  Flame,
  FileText,
  Database,
  BookOpen,
  Search,
  TrendingUp,
  Clock,
  Star,
  Plus,
  Target,
  Calendar,
  Zap,
  Activity,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { getRecentNotebooks, getFavoriteNotebooks } from '../utils/storage';

export default function Sidebar({ analytics, notebooks = [], onSearch, onSelectNotebook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const recentNotebooks = getRecentNotebooks(notebooks, 5);
  const favoriteNotebooks = getFavoriteNotebooks(notebooks);

  const getTrendIcon = () => {
    if (!analytics.weeklyInsights) return null;
    const { trend } = analytics.weeklyInsights;
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 h-screen bg-[#000000] border-r border-[rgba(255,255,255,0.1)] flex flex-col fixed left-0 top-0 z-30">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <h2 className="text-white font-semibold text-base">Quick Tools</h2>
          </div>
          <button className="w-8 h-8 rounded-full bg-[#1C1C1E] hover:bg-[#262626] flex items-center justify-center transition-all">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search everywhere..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-[rgba(255,255,255,0.1)] rounded-full text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1C1C1E] rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer" title="Notebooks">
            <div className="text-2xl font-bold text-white mb-1">{analytics?.notebookCount || 0}</div>
            <div className="text-xs text-gray-400">NB</div>
          </div>
          <div className="bg-[#1C1C1E] rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer" title="Todo Streak">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className={`w-5 h-5 ${(analytics?.streak || 0) > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
              <span className="text-2xl font-bold text-white">{analytics?.streak || 0}</span>
            </div>
            <div className="text-xs text-gray-400">Streak</div>
          </div>
          <div className="bg-[#1C1C1E] rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer" title="Storage Used">
            <div className="text-lg font-bold text-white mb-1">{(analytics?.storageMb || 0).toFixed(1)}</div>
            <div className="text-xs text-gray-400">MB</div>
          </div>
        </div>
        
        {/* Web Captures Row */}
        <div className="mt-3">
          <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer" title="Web Captures">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Web Clips</span>
              </div>
              <span className="text-lg font-bold text-white">{analytics?.webCaptures || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontal */}
      <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.1)] flex gap-2 flex-shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
          }`}
        >
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'recent'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
          }`}
        >
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Recent</span>
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
          }`}
        >
          <Star className="w-4 h-4 flex-shrink-0" />
          <span>Favorites</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-scroll overflow-x-hidden px-5 py-4 space-y-4 pb-8"
        onWheel={(e) => e.stopPropagation()}
        style={{ 
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {activeTab === 'analytics' && (
          <>
            {/* Activity Chart */}
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white" />
                  <h3 className="text-white font-medium text-sm">Activity (7 days)</h3>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-gray-400">Tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-gray-400">Notes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-gray-400">Clips</span>
                  </div>
                </div>
              </div>
              <div onWheel={(e) => e.stopPropagation()}>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart 
                    data={analytics?.activity || []} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      {/* Gradients for Areas */}
                      <linearGradient id="colorTodos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorCaptures" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    
                    {/* Grid for better readability */}
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255,255,255,0.05)" 
                      vertical={false}
                    />
                    
                    {/* Axes */}
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#888', fontSize: 11 }}
                      stroke="rgba(255,255,255,0.1)"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { weekday: 'short' })[0];
                      }}
                    />
                    <YAxis 
                      tick={{ fill: '#888', fontSize: 11 }}
                      stroke="rgba(255,255,255,0.1)"
                      width={30}
                    />
                    
                    {/* Tooltip */}
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#2C2C2E', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                      }}
                    />
                    
                    {/* Area charts with gradients */}
                    <Area 
                      type="monotone" 
                      dataKey="todos" 
                      fill="url(#colorTodos)" 
                      stroke="none"
                      animationDuration={1000}
                      animationBegin={0}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="notes" 
                      fill="url(#colorNotes)" 
                      stroke="none"
                      animationDuration={1000}
                      animationBegin={200}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="captures" 
                      fill="url(#colorCaptures)" 
                      stroke="none"
                      animationDuration={1000}
                      animationBegin={400}
                    />
                    
                    {/* Dynamic lines on top with glow effect */}
                    <Line 
                      type="monotone" 
                      dataKey="todos" 
                      stroke="#60A5FA" 
                      strokeWidth={3}
                      dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4, stroke: '#1C1C1E' }}
                      activeDot={{ r: 6, stroke: '#60A5FA', strokeWidth: 3 }}
                      animationDuration={1000}
                      animationBegin={0}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="notes" 
                      stroke="#34D399" 
                      strokeWidth={3}
                      dot={{ fill: '#34D399', strokeWidth: 2, r: 4, stroke: '#1C1C1E' }}
                      activeDot={{ r: 6, stroke: '#34D399', strokeWidth: 3 }}
                      animationDuration={1000}
                      animationBegin={200}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="captures" 
                      stroke="#A78BFA" 
                      strokeWidth={3}
                      dot={{ fill: '#A78BFA', strokeWidth: 2, r: 4, stroke: '#1C1C1E' }}
                      activeDot={{ r: 6, stroke: '#A78BFA', strokeWidth: 3 }}
                      animationDuration={1000}
                      animationBegin={400}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today's Productivity */}
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-white" />
                <h3 className="text-white font-medium text-sm">Today's Productivity</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{analytics?.todayStats?.notes || 0} notes created</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{analytics?.todayStats?.todos || 0} todos completed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{(analytics?.todayStats?.words || 0).toLocaleString()} words written</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{analytics?.todayStats?.captures || 0} web captures</span>
                </div>
              </div>
            </div>

            {/* Weekly Insights */}
            {analytics.weeklyInsights && (
              <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-white" />
                  <h3 className="text-white font-medium text-sm">Weekly Insights</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Most productive</span>
                    <span className="text-white font-medium">{analytics.weeklyInsights.mostProductiveDay}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg tasks/day</span>
                    <span className="text-white font-medium">{analytics.weeklyInsights.averageTasksPerDay}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Trend</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()}
                      <span className="text-white font-medium capitalize">{analytics.weeklyInsights.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Analytics */}
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-white" />
                <h3 className="text-white font-medium text-sm">Content Analytics</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">{(analytics?.content?.totalWords || 0).toLocaleString()} total words</span>
                </div>
                {(analytics?.content?.breakdown || []).slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 truncate max-w-[150px]">{item.name}</span>
                    <span className="text-white">{item.value.toLocaleString()} words</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Goals */}
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-[#EF4444]" />
                <h3 className="text-white font-medium text-sm">Streak & Goals</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current: {analytics?.goals?.currentStreak || 0} days</span>
                  <Flame className="w-4 h-4 text-[#EF4444]" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Best ever: {analytics?.goals?.bestStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">This month: {analytics?.goals?.monthlyProgress || 0}%</span>
                </div>
              </div>
            </div>

            {/* Storage Breakdown */}
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-white" />
                <h3 className="text-white font-medium text-sm">Storage Breakdown</h3>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-[#0A0A0A] rounded-full h-2 mb-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${((analytics?.storageMb || 0) / (analytics?.storageTotalMb || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{(analytics?.storageMb || 0).toFixed(1)}MB / {analytics?.storageTotalMb || 10}MB</span>
                </div>
                {(analytics?.storageBreakdown || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.name}: {item.value.toFixed(1)}MB</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-3">
            {recentNotebooks.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-white" />
                  <h3 className="text-white font-medium text-sm">Recently Accessed</h3>
                </div>
                {recentNotebooks.map((notebook) => (
                  <div
                    key={notebook.id}
                    onClick={() => onSelectNotebook && onSelectNotebook(notebook)}
                    className="bg-[#1C1C1E] rounded-xl p-3 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate">{notebook.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatTimeAgo(notebook.lastAccessed)}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">{notebook.wordCount.toLocaleString()} words</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-[#1C1C1E] rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] text-center">
                <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No recent notebooks</p>
                <p className="text-gray-600 text-xs mt-1">Open a notebook to see it here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-3">
            {favoriteNotebooks.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-white font-medium text-sm">Favorite Notebooks</h3>
                </div>
                {favoriteNotebooks.map((notebook) => (
                  <div
                    key={notebook.id}
                    onClick={() => onSelectNotebook && onSelectNotebook(notebook)}
                    className="bg-[#1C1C1E] rounded-xl p-3 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium text-sm truncate flex-1">{notebook.name}</h4>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{notebook.wordCount.toLocaleString()} words</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">Modified {formatTimeAgo(notebook.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-[#1C1C1E] rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] text-center">
                <Star className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No favorite notebooks</p>
                <p className="text-gray-600 text-xs mt-1">Star notebooks to add them here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
