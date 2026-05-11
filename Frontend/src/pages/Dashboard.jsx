import { useEffect, useMemo, useState } from 'react';
import { Download, Inbox, Search, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { exportCSV, getDashboardStats, getInquiries, getWeeklyInquiries } from '@/api/inquiries';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const params = useMemo(
    () => ({
      search,
      sortBy,
      order,
      page: 1,
      limit: 10,
    }),
    [search, sortBy, order]
  );

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsResponse, weeklyResponse, inquiryResponse] = await Promise.all([
          getDashboardStats(),
          getWeeklyInquiries(),
          getInquiries(params),
        ]);

        if (!active) return;

        setStats(statsResponse.data);
        setWeekly(weeklyResponse.data || []);
        setInquiries(inquiryResponse.data || []);
        setPagination(inquiryResponse.pagination || null);
      } catch (error) {
        toast.error(error.message || 'Unable to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [params]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((value) => (value === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
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
      toast.error(error.message || 'Unable to export CSV');
    }
  };

  const statCards = [
    { label: 'Total Inquiries', value: stats?.total || 0, icon: Inbox },
    { label: 'New Inquiries', value: stats?.newCount || 0, icon: Users },
    { label: 'Weeks Tracked', value: weekly.length, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Inquiry statistics, weekly trends, and contact submissions.</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{loading ? '-' : item.value}</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Weekly Inquiries</h2>
            <p className="mt-1 text-sm text-slate-500">Last eight weeks</p>
          </div>
          <Badge variant="accent">Chart Data</Badge>
        </div>
        <div className="mt-6 h-72">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Inquiries</h2>
            <p className="mt-1 text-sm text-slate-500">{pagination?.total || 0} records</p>
          </div>
          <Input
            aria-label="Search inquiries"
            placeholder="Search inquiries"
            className="md:w-72"
            leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                {[
                  ['name', 'Name'],
                  ['email', 'Email'],
                  ['country', 'Country'],
                  ['status', 'Status'],
                  ['createdAt', 'Submitted'],
                ].map(([field, label]) => (
                  <th key={field} className="py-3 pr-4 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort(field)}
                      className="rounded text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="border-b border-slate-100">
                  <td className="py-4 pr-4 font-medium text-slate-900">{inquiry.name}</td>
                  <td className="py-4 pr-4 text-slate-500">{inquiry.email}</td>
                  <td className="py-4 pr-4 text-slate-500">{inquiry.country}</td>
                  <td className="py-4 pr-4">
                    <Badge variant={inquiry.status === 'new' ? 'accent' : 'default'}>{inquiry.status}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-slate-500">
                    {new Date(inquiry.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && inquiries.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">No inquiries found.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
