import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DailyStats {
  date: string;
  unique_sessions: number;
  playlists_created: number;
  unique_songs_added: number;
  avg_playlist_size: number;
  total_interactions: number;
}

interface PopularSong {
  track_id: string;
  track_name: string;
  artist_name: string;
  interaction_count: number;
  add_count: number;
  remove_count: number;
}

interface SearchTrend {
  query_text: string;
  search_count: number;
  avg_results: number;
  click_count: number;
}

interface SessionMetrics {
  total_sessions_today: number;
  avg_session_duration_seconds: number;
  mobile_sessions: number;
  desktop_sessions: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [popularSongs, setPopularSongs] = useState<PopularSong[]>([]);
  const [searchTrends, setSearchTrends] = useState<SearchTrend[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, songsRes, trendsRes, metricsRes] = await Promise.all([
        fetch(`/analytics/dashboard/daily-stats?days=${timeRange}`),
        fetch('/analytics/dashboard/popular-songs?limit=20'),
        fetch('/analytics/dashboard/search-trends?limit=20'),
        fetch('/analytics/dashboard/session-metrics')
      ]);

      if (statsRes.ok) setDailyStats(await statsRes.json());
      if (songsRes.ok) setPopularSongs(await songsRes.json());
      if (trendsRes.ok) setSearchTrends(await trendsRes.json());
      if (metricsRes.ok) setSessionMetrics(await metricsRes.json());
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const sessionsChartData = {
    labels: dailyStats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'Unique Sessions',
        data: dailyStats.map(stat => stat.unique_sessions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Playlists Created',
        data: dailyStats.map(stat => stat.playlists_created),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const interactionsChartData = {
    labels: dailyStats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'Total Interactions',
        data: dailyStats.map(stat => stat.total_interactions),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
      }
    ]
  };

  const deviceChartData = {
    labels: ['Mobile', 'Desktop'],
    datasets: [
      {
        data: sessionMetrics ? [sessionMetrics.mobile_sessions, sessionMetrics.desktop_sessions] : [0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track user engagement, playlist creation, and application performance
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sessions Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessionMetrics?.total_sessions_today || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Playlists</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dailyStats.reduce((sum, stat) => sum + stat.playlists_created, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4v2m0 0v2m0-2h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Session Duration</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessionMetrics ? formatDuration(sessionMetrics.avg_session_duration_seconds) : '0m 0s'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Searches</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {searchTrends.reduce((sum, trend) => sum + trend.search_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sessions and Playlists Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions & Playlists Over Time</h3>
            <Line 
              data={sessionsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          {/* Interactions Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Interactions</h3>
            <Bar 
              data={interactionsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Device Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Distribution (Today)</h3>
            <div className="w-64 mx-auto">
              <Doughnut 
                data={deviceChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Popular Songs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Songs</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {popularSongs.slice(0, 10).map((song, index) => (
                <div key={song.track_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{song.track_name}</p>
                      <p className="text-xs text-gray-500">{song.artist_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{song.interaction_count}</p>
                    <p className="text-xs text-gray-500">interactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Search Queries</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Searches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchTrends.map((trend) => (
                  <tr key={trend.query_text}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trend.query_text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trend.search_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trend.avg_results.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trend.click_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((trend.click_count / trend.search_count) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
