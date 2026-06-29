import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  Globe2,
  Inbox,
  MailCheck,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  exportCSV,
  getDashboardStats,
  getInquiries,
  getWeeklyInquiries,
} from '@/api/inquiries';
import {
  deleteContent,
  getAdminContent,
  updateContent,
} from '@/api/content';
import { onChatEvent } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';

const serviceBuckets = [
  {
    label: 'Client Interaction',
    keywords: ['client', 'customer', 'inquiry', 'chat', 'support', 'contact', 'interaction'],
    color: 'bg-[#E95520]',
  },
  {
    label: 'Automation',
    keywords: ['automation', 'automate', 'workflow', 'process', 'operation'],
    color: 'bg-[#F37A49]',
  },
  {
    label: 'Web Systems',
    keywords: ['web', 'website', 'application', 'dashboard', 'portal', 'system'],
    color: 'bg-slate-600',
  },
  {
    label: 'Consulting',
    keywords: ['consult', 'strategy', 'planning', 'advice', 'demo', 'meeting'],
    color: 'bg-slate-400',
  },
];

const statusOptions = ['new', 'read', 'replied', 'archived'];

const statusLabels = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

const statusClasses = {
  new: 'border-indigo-200 bg-indigo-50 text-indigo-600',
  read: 'border-slate-200 bg-slate-100 text-slate-600',
  replied: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  archived: 'border-slate-200 bg-white text-slate-500',
};

const statusChartColors = {
  new: '#E95520',
  read: '#94A3B8',
  replied: '#F3A261',
  archived: '#CBD5E1',
};

const emptyWeekData = [
  { label: 'Week 1', count: 0 },
  { label: 'Week 2', count: 0 },
  { label: 'Week 3', count: 0 },
  { label: 'Week 4', count: 0 },
];

const formatDate = (value) => {
  if (!value) return 'Not available';

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getInquiryText = (inquiry) =>
  `${inquiry.jobTitle || ''} ${inquiry.jobDetails || ''} ${inquiry.companyName || ''} ${inquiry.country || ''}`.toLowerCase();

const getPercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

const chartTooltipStyle = {
  backgroundColor: '#0B0B0B',
  border: '1px solid rgba(233, 85, 32, 0.28)',
  borderRadius: '12px',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
  color: '#F5ECE6',
};

const chartTooltipLabelStyle = {
  color: '#A89D96',
};

const chartTooltipItemStyle = {
  color: '#F37A49',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [analyticsInquiries, setAnalyticsInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('weekly');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewActionId, setReviewActionId] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [statsResponse, weeklyResponse, analyticsResponse] = await Promise.all([
          getDashboardStats(),
          getWeeklyInquiries(),
          getInquiries({
            sortBy: 'createdAt',
            order: 'desc',
            page: 1,
            limit: 50,
          }),
        ]);

        if (!active) return;

        setStats(statsResponse.data);
        setWeekly(weeklyResponse.data || []);
        setAnalyticsInquiries(analyticsResponse.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Unable to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!token) return undefined;

    return onChatEvent('new_inquiry', () => {
      setReloadKey((value) => value + 1);
      toast.success('A new customer inquiry has arrived');
    }, token);
  }, [token]);

  useEffect(() => {
    let active = true;

    const loadPendingReviews = async () => {
      try {
        const response = await getAdminContent('testimonials', {
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          order: 'desc',
        });

        if (active) {
          setPendingReviews(
            (response.data || []).filter(
              (review) => review.submissionSource === 'customer' && !review.published
            )
          );
        }
      } catch (error) {
        if (active) {
          toast.error(error.message || 'Unable to load pending customer reviews');
        }
      }
    };

    loadPendingReviews();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handlePublishReview = async (review) => {
    setReviewActionId(review._id);
    try {
      await updateContent('testimonials', review._id, { published: true });
      setPendingReviews((current) => current.filter((item) => item._id !== review._id));
      toast.success('Customer review published');
    } catch (error) {
      toast.error(error.message || 'Unable to publish review');
    } finally {
      setReviewActionId('');
    }
  };

  const handleDeleteReview = async (review) => {
    const confirmed = window.confirm(`Delete the review submitted by "${review.authorName}"?`);
    if (!confirmed) return;

    setReviewActionId(review._id);
    try {
      await deleteContent('testimonials', review._id);
      setPendingReviews((current) => current.filter((item) => item._id !== review._id));
      toast.success('Customer review deleted');
    } catch (error) {
      toast.error(error.message || 'Unable to delete review');
    } finally {
      setReviewActionId('');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inquiries.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV export ready');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to export CSV');
    }
  };

  const handleRefresh = () => {
    setReloadKey((value) => value + 1);
    toast.success('Dashboard refreshed');
  };

  const dailyChartData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const count = analyticsInquiries.filter((inquiry) => {
        const createdAt = new Date(inquiry.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length;

      return {
        label: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        count,
      };
    });
  }, [analyticsInquiries]);

  const weeklyChartData = useMemo(() => {
    if (!weekly.length) return emptyWeekData;

    return weekly.map((item) => ({
      label: item.week ? item.week.replace('-', ' ') : 'Week',
      count: item.count || 0,
    }));
  }, [weekly]);

  const chartData = chartMode === 'weekly' ? weeklyChartData : dailyChartData;
  const hasChartData = chartData.some((item) => item.count > 0);

  const statusDistribution = useMemo(() => {
    return statusOptions.map((status) => ({
      status,
      name: statusLabels[status],
      value: analyticsInquiries.filter((inquiry) => inquiry.status === status).length,
      color: statusChartColors[status],
    }));
  }, [analyticsInquiries]);

  const countryChartData = useMemo(() => {
    const countryCounts = analyticsInquiries.reduce((acc, inquiry) => {
      const country = inquiry.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [analyticsInquiries]);

  const serviceInterest = useMemo(() => {
    const totalRecords = analyticsInquiries.length || 1;

    return serviceBuckets.map((bucket) => {
      const count = analyticsInquiries.filter((inquiry) => {
        const text = getInquiryText(inquiry);
        return bucket.keywords.some((keyword) => text.includes(keyword));
      }).length;

      return {
        ...bucket,
        count,
        value: getPercent(count, totalRecords),
      };
    });
  }, [analyticsInquiries]);

  const metrics = useMemo(() => {
    const loadedTotal = analyticsInquiries.length;
    const repliedCount = statusDistribution.find((item) => item.status === 'replied')?.value || 0;
    const archivedCount = statusDistribution.find((item) => item.status === 'archived')?.value || 0;
    const weekStart = getStartOfWeek();
    const thisWeekCount = analyticsInquiries.filter((inquiry) => new Date(inquiry.createdAt) >= weekStart).length;
    const replyRate = getPercent(repliedCount, loadedTotal);
    const activeClients = new Set(analyticsInquiries.map((inquiry) => inquiry.email).filter(Boolean)).size;

    return {
      total: stats?.total || 0,
      newCount: stats?.newCount || 0,
      thisWeekCount,
      replyRate,
      archivedCount,
      activeClients,
    };
  }, [analyticsInquiries, stats, statusDistribution]);

  const topCountry = countryChartData[0]?.country || 'No data';
  const topService = [...serviceInterest].sort((a, b) => b.count - a.count)[0];
  const topServiceLabel = topService?.count > 0 ? topService.label : 'No data';

  const metricCards = [
    {
      label: 'Total Inquiries',
      value: metrics.total.toLocaleString(),
      helper: 'Active records in MongoDB',
      icon: Inbox,
      tone: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'New Inquiries',
      value: metrics.newCount.toLocaleString(),
      helper: metrics.newCount > 0 ? 'Needs admin review' : 'Inbox is clear',
      icon: Zap,
      tone: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'This Week',
      value: metrics.thisWeekCount.toLocaleString(),
      helper: 'From loaded inquiry records',
      icon: TrendingUp,
      tone: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Reply Rate',
      value: `${metrics.replyRate}%`,
      helper: 'Replied inquiries in current data',
      icon: MailCheck,
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020706] text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#020706]/90 backdrop-blur-xl">
        <div className="flex min-h-20 flex-col gap-3 px-4 py-4 sm:px-6 md:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#F37A49]">Analytics dashboard</p>
            <p className="mt-1 text-sm text-[#A89D96]">Monitor inquiry trends, status, service interest, and regions.</p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => toast.info(metrics.newCount > 0 ? `${metrics.newCount} new inquiries need review` : 'No new notifications')}
              className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {metrics.newCount > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/inquiries')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E95520] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#C94316] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              Open Inquiries
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Live admin reporting
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Inquiry Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
              Monitor client inquiries, follow-up status, service demand, and regional interest from one admin workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              New Request
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`rounded-xl p-3 ${card.tone}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    Real data
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {loading ? '-' : card.value}
                </p>
                <p className="mt-2 text-xs text-slate-500">{card.helper}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-950">Pending Customer Reviews</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                  {pendingReviews.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Approve reviews before they appear on the public Testimonials page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/content')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Open Content Manager
            </button>
          </div>

          {pendingReviews.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {pendingReviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{review.authorName}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {[review.authorTitle, review.authorCompany].filter(Boolean).join(' · ') ||
                          'Customer submission'}
                      </p>
                    </div>
                    <div className="flex gap-1 text-[#E95520]" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating ? 'fill-current' : 'text-slate-300'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">"{review.quote}"</p>
                  <p className="mt-3 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      disabled={reviewActionId === review._id}
                      onClick={() => handlePublishReview(review)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                    >
                      Publish Review
                    </button>
                    <button
                      type="button"
                      disabled={reviewActionId === review._id}
                      onClick={() => handleDeleteReview(review)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
              No customer reviews are waiting for approval.
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Inquiry Trend</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {chartMode === 'weekly' ? 'Weekly totals from dashboard API' : 'Daily totals from loaded records'}
                </p>
              </div>
              <div className="flex w-fit rounded-lg bg-slate-100 p-1">
                <button
                  className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                    chartMode === 'daily' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
                  }`}
                  type="button"
                  onClick={() => setChartMode('daily')}
                >
                  Daily
                </button>
                <button
                  className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                    chartMode === 'weekly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
                  }`}
                  type="button"
                  onClick={() => setChartMode('weekly')}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="relative mt-8 h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inquiryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E95520" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#E95520" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(245,236,230,0.10)" vertical={false} />
                  <XAxis dataKey="label" stroke="#8F847D" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#746C67" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(233,85,32,0.32)', strokeWidth: 1 }}
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#E95520"
                    strokeWidth={3}
                    fill="url(#inquiryGradient)"
                    activeDot={{ r: 5, fill: '#E95520' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {!loading && !hasChartData && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-xl border border-slate-200 bg-white/90 px-5 py-3 text-sm text-slate-500 shadow-sm">
                    No chart data yet. Submit an inquiry to populate this chart.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Status Distribution</h2>
                <p className="mt-1 text-sm text-slate-500">Follow-up pipeline by inquiry state.</p>
              </div>
              <Clock3 className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>

            <div className="mt-5 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusDistribution.map((item) => (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => navigate(`/admin/inquiries?status=${item.status}`)}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-slate-500">{item.name}</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{item.value}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr_0.85fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Service Interest</h2>
                <p className="mt-1 text-sm text-slate-500">Keyword analysis from inquiry details.</p>
              </div>
              <Users className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>

            <div className="mt-8 space-y-6">
              {serviceInterest.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <span className="text-slate-500">
                      {item.count} inquiry{item.count === 1 ? '' : 'ies'} - {item.value}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
              Highest interest: <span className="font-semibold">{topServiceLabel}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Top Countries</h2>
                <p className="mt-1 text-sm text-slate-500">Regional demand from inquiry forms.</p>
              </div>
              <Globe2 className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>

            <div className="mt-8 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData} layout="vertical" margin={{ top: 0, right: 20, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(245,236,230,0.10)" horizontal={false} />
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="country"
                    width={92}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#8F847D', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(233, 85, 32, 0.08)' }}
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                  <Bar dataKey="count" fill="#E95520" radius={[0, 8, 8, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Top region: <span className="font-semibold text-slate-900">{topCountry}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Action Summary</h2>
              <p className="mt-1 text-sm text-slate-500">Operational snapshot for the admin.</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <Zap className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">Needs review</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-950">{metrics.newCount}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">Reply rate</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-950">{metrics.replyRate}%</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <Archive className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">Archived</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-950">{metrics.archivedCount}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-medium text-indigo-700">{metrics.activeClients} unique client email(s)</p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-600">
                This helps show how many individual contacts are represented in the loaded inquiry data.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
