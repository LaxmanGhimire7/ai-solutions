class InquiryService {
  constructor(inquiryRepository, emailUtil, socketUtil) {
    this.inquiryRepo = inquiryRepository;
    this.emailUtil = emailUtil;
    this.socketUtil = socketUtil;
  }

  /**
   * Submit a new contact inquiry.
   * Saves to DB, sends admin email notification, emits Socket.io event.
   */
  async create(data) {
    const inquiry = await this.inquiryRepo.create(data);

    // Real-time notification to admin dashboard
    this.socketUtil.emit('new_inquiry', {
      id: inquiry._id,
      name: inquiry.name,
      email: inquiry.email,
      jobTitle: inquiry.jobTitle,
      country: inquiry.country,
      createdAt: inquiry.createdAt,
    });

    // Email delivery runs separately so a blocked provider cannot delay the form response.
    this._deliverNotification(inquiry).catch((err) => {
      console.error(
        `Unable to finish notification workflow for inquiry ${inquiry._id}:`,
        err.message
      );
    });

    return inquiry;
  }

  /**
   * Get paginated list of inquiries (admin only).
   */
  async getAll(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const sortBy = ['createdAt', 'name', 'email', 'companyName', 'country', 'status'].includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';

    return this.inquiryRepo.findAll({
      search: query.search,
      status: query.status,
      page,
      limit,
      sortBy,
      order,
    });
  }

  /**
   * Get a single inquiry by ID (admin only).
   */
  async getById(id) {
    const inquiry = await this.inquiryRepo.findById(id);
    if (!inquiry) {
      const err = new Error('Inquiry not found');
      err.statusCode = 404;
      throw err;
    }
    // Auto-mark as read when admin views it
    if (inquiry.status === 'new') {
      await this.inquiryRepo.updateStatus(id, 'read');
      inquiry.status = 'read';
    }
    return inquiry;
  }

  /**
   * Update the status of an inquiry (admin only).
   */
  async updateStatus(id, status) {
    const inquiry = await this.inquiryRepo.updateStatus(id, status);
    if (!inquiry) {
      const err = new Error('Inquiry not found');
      err.statusCode = 404;
      throw err;
    }
    return inquiry;
  }

  /**
   * Soft delete an inquiry (admin only).
   */
  async delete(id) {
    const inquiry = await this.inquiryRepo.softDelete(id);
    if (!inquiry) {
      const err = new Error('Inquiry not found');
      err.statusCode = 404;
      throw err;
    }
    return inquiry;
  }

  /**
   * Get dashboard stats: total count + weekly chart data.
   */
  async getDashboardStats() {
    const [total, newCount, weeklyData] = await Promise.all([
      this.inquiryRepo.count(),
      this.inquiryRepo.count({ status: 'new' }),
      this.inquiryRepo.getWeeklyCounts(8),
    ]);

    return { total, newCount, weeklyData };
  }

  async getWeeklyInquiries() {
    return this.inquiryRepo.getWeeklyCounts(8);
  }

  /**
   * Export all inquiries as CSV string (admin only).
   */
  async exportCsv() {
    const inquiries = await this.inquiryRepo.findAllForExport();

    const headers = [
      'Name', 'Email', 'Phone', 'Company', 'Country',
      'Job Title', 'Job Details', 'Status', 'Submitted At',
    ];

    const escape = (val) => {
      const str = val == null ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = inquiries.map((i) => [
      escape(i.name),
      escape(i.email),
      escape(i.phone),
      escape(i.companyName),
      escape(i.country),
      escape(i.jobTitle),
      escape(i.jobDetails),
      escape(i.status),
      escape(new Date(i.createdAt).toISOString()),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  async _notifyAdmin(inquiry) {
    const template = this.emailUtil.newInquiryTemplate(inquiry);
    await this.emailUtil.send(template);
  }

  async _deliverNotification(inquiry) {
    let status = 'failed';

    try {
      await this._notifyAdmin(inquiry);
      status = 'sent';
    } catch (err) {
      console.error(
        `Admin email notification failed for inquiry ${inquiry._id}:`,
        err.code || err.message
      );
    }

    await this.inquiryRepo.updateNotificationStatus(inquiry._id, status);
  }
}

module.exports = InquiryService;
