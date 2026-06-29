import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Filter, MoreHorizontal, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import {
  deleteInquiry,
  exportCSV,
  getInquiries,
  updateInquiryStatus,
} from '@/api/inquiries';

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

const formatDate = (value) => {
  if (!value) return 'Not available';

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AI';

const Inquiries = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = statusOptions.includes(searchParams.get('status'))
    ? searchParams.get('status')
    : 'all';
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingInquiryId, setDeletingInquiryId] = useState('');

  const tableParams = useMemo(
    () => ({
      search,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sortBy: 'createdAt',
      order: sortOrder,
      page: 1,
      limit: 50,
    }),
    [search, statusFilter, sortOrder]
  );

  useEffect(() => {
    const status = searchParams.get('status');
    if (statusOptions.includes(status)) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    const loadInquiries = async () => {
      setLoading(true);
      try {
        const response = await getInquiries(tableParams);
        if (active) setInquiries(response.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Unable to load inquiries');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInquiries();

    return () => {
      active = false;
    };
  }, [reloadKey, tableParams]);

  const handleRefresh = () => {
    setReloadKey((value) => value + 1);
    toast.success('Inquiries refreshed');
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV export ready');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to export CSV');
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedInquiry) return;

    setUpdatingStatus(true);
    try {
      const response = await updateInquiryStatus(selectedInquiry._id, status);
      const updatedInquiry = response.data;

      setSelectedInquiry(updatedInquiry);
      setInquiries((current) =>
        current.map((item) => (item._id === updatedInquiry._id ? updatedInquiry : item))
      );
      toast.success('Inquiry status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteInquiry = async (inquiry) => {
    if (!inquiry) return;

    const confirmed = window.confirm(
      `Delete the inquiry from "${inquiry.companyName || inquiry.name}"?`
    );
    if (!confirmed) return;

    setDeletingInquiryId(inquiry._id);
    try {
      await deleteInquiry(inquiry._id);
      setInquiries((current) => current.filter((item) => item._id !== inquiry._id));
      setSelectedInquiry((current) => (current?._id === inquiry._id ? null : current));
      toast.success('Inquiry deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to delete inquiry');
    } finally {
      setDeletingInquiryId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#020706] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-white/10 bg-[#090a09] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] md:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase text-[#F37A49]">Inquiry workspace</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Inquiry Handling</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#A89D96]">
                View full customer inquiries, update follow-up status, and remove old records.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-[#F5ECE6] transition-colors hover:bg-white/[0.08]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-[#F5ECE6] transition-colors hover:bg-white/[0.08]"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search inquiries, clients, countries, or job titles..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white py-2 pl-12 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Search inquiries"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600">
                <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                  aria-label="Filter by inquiry status"
                >
                  <option value="all">All status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Sort inquiries"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="px-6 py-4 font-medium md:px-8">Client</th>
                  <th className="px-6 py-4 font-medium">Inquiry Type</th>
                  <th className="px-6 py-4 font-medium">Country</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium md:px-8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-6 py-5 md:px-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-semibold text-indigo-600">
                          {getInitials(inquiry.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-950">{inquiry.companyName || inquiry.name}</div>
                          <div className="mt-1 truncate text-xs text-slate-500">{inquiry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-900">{inquiry.jobTitle || 'Project Inquiry'}</td>
                    <td className="px-6 py-5 text-slate-600">{inquiry.country || 'Unknown'}</td>
                    <td className="px-6 py-5 text-slate-600">{formatDate(inquiry.createdAt)}</td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClasses[inquiry.status] || statusClasses.read}`}>
                        {statusLabels[inquiry.status] || inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 md:px-8">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          View
                        </button>
                        <button
                          type="button"
                          disabled={deletingInquiryId === inquiry._id}
                          onClick={() => handleDeleteInquiry(inquiry)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && inquiries.length === 0 && (
              <div className="px-8 py-12 text-center text-sm text-slate-500">
                No inquiries found for the selected search or filter.
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        title={selectedInquiry?.companyName || selectedInquiry?.name || 'Inquiry details'}
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-400">Contact</p>
                <p className="mt-1 font-medium text-slate-900">{selectedInquiry.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="mt-1 font-medium text-slate-900">{selectedInquiry.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="mt-1 font-medium text-slate-900">{selectedInquiry.phone}</p>
              </div>
              <div>
                <p className="text-slate-400">Country</p>
                <p className="mt-1 font-medium text-slate-900">{selectedInquiry.country}</p>
              </div>
              <div>
                <p className="text-slate-400">Company</p>
                <p className="mt-1 font-medium text-slate-900">{selectedInquiry.companyName}</p>
              </div>
              <div>
                <p className="text-slate-400">Submitted</p>
                <p className="mt-1 font-medium text-slate-900">{formatDate(selectedInquiry.createdAt)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400">Job Title</p>
                <p className="mt-1 font-medium text-slate-900">{selectedInquiry.jobTitle}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400">Job Details</p>
                <p className="mt-1 leading-relaxed text-slate-700">{selectedInquiry.jobDetails}</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-900">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(status)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 ${
                      selectedInquiry.status === status
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {selectedInquiry.status === status && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-slate-400">
                Deleting an inquiry removes it from this admin workspace.
              </p>
              <button
                type="button"
                disabled={deletingInquiryId === selectedInquiry._id}
                onClick={() => handleDeleteInquiry(selectedInquiry)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete Inquiry
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inquiries;
