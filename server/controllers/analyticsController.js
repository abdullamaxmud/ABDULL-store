const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const DAY_MS = 24 * 60 * 60 * 1000;
const round2 = (n) => Math.round((n || 0) * 100) / 100;
const pctChange = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : null);

/**
 * Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD (inclusive, UTC days — the same days the charts group by). Defaults to the last 30 days.
 */
const parseRange = (query) => {
  const isDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const end = isDay(query.to) ? new Date(`${query.to}T23:59:59.999Z`) : new Date();
  const start = isDay(query.from) ? new Date(`${query.from}T00:00:00Z`) : new Date(end.getTime() - 29 * DAY_MS);
  start.setUTCHours(0, 0, 0, 0);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    const err = new Error('Invalid date range');
    err.statusCode = 400;
    throw err;
  }
  if (end - start > 3 * 366 * DAY_MS) {
    const err = new Error('Please choose a range of 3 years or less');
    err.statusCode = 400;
    throw err;
  }
  return { start, end };
};

const toKey = (d, byMonth) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return byMonth ? `${y}-${m}` : `${y}-${m}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

/** Revenue, orders, AOV and refunds for one window (used for the current and previous period). */
const periodSummary = async (start, end) => {
  const [row] = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        cancelled: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$totalPrice', 0] } },
        discounts: { $sum: { $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$discount', 0] } },
        shipping: { $sum: { $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$shippingPrice', 0] } },
        refunded: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Refunded'] }, '$totalPrice', 0] } },
        paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalPrice', 0] } },
        buyers: { $addToSet: '$user' },
      },
    },
  ]);
  const newCustomers = await User.countDocuments({ role: 'customer', createdAt: { $gte: start, $lte: end } });
  const validOrders = (row?.orders || 0) - (row?.cancelled || 0);
  return {
    revenue: round2(row?.revenue),
    orders: row?.orders || 0,
    validOrders,
    cancelled: row?.cancelled || 0,
    cancelRate: row?.orders ? Math.round((row.cancelled / row.orders) * 1000) / 10 : 0,
    avgOrderValue: validOrders ? round2(row.revenue / validOrders) : 0,
    discounts: round2(row?.discounts),
    shipping: round2(row?.shipping),
    refunded: round2(row?.refunded),
    collected: round2(row?.paid),
    buyers: row?.buyers?.length || 0,
    newCustomers,
  };
};

/**
 * @desc    Full sales analytics for a date range
 * @route   GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 * @access  Private/Admin
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const span = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - span);
    const byMonth = span > 92 * DAY_MS;

    const inRange = { createdAt: { $gte: start, $lte: end } };
    const notCancelled = { ...inRange, orderStatus: { $ne: 'Cancelled' } };

    const [
      current,
      previous,
      series,
      byStatus,
      byPayment,
      topProducts,
      categoryRevenue,
      topCustomers,
      coupons,
      repeatBuyers,
      lowStock,
      catalog,
    ] = await Promise.all([
      periodSummary(start, end),
      periodSummary(prevStart, prevEnd),
      Order.aggregate([
        { $match: notCancelled },
        {
          $group: {
            _id: { $dateToString: { format: byMonth ? '%Y-%m' : '%Y-%m-%d', date: '$createdAt', timezone: '+00:00' } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: inRange },
        { $group: { _id: '$orderStatus', count: { $sum: 1 }, value: { $sum: '$totalPrice' } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: notCancelled },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            name: { $first: '$orderItems.name' },
            image: { $first: '$orderItems.image' },
            quantity: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: notCancelled },
        { $unwind: '$orderItems' },
        { $lookup: { from: 'products', localField: 'orderItems.product', foreignField: '_id', as: 'p' } },
        { $unwind: { path: '$p', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'categories', localField: 'p.category', foreignField: '_id', as: 'c' } },
        { $unwind: { path: '$c', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$c.name', 'Uncategorized'] },
            quantity: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$totalPrice' } } },
        { $sort: { spent: -1 } },
        { $limit: 8 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $unwind: { path: '$u', preserveNullAndEmptyArrays: true } },
        { $project: { orders: 1, spent: 1, name: '$u.name', email: '$u.email', avatar: '$u.avatar' } },
      ]),
      Order.aggregate([
        { $match: { ...notCancelled, couponCode: { $nin: ['', null] } } },
        { $group: { _id: '$couponCode', uses: { $sum: 1 }, discount: { $sum: '$discount' }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { uses: -1 } },
      ]),
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: '$user', orders: { $sum: 1 } } },
        { $match: { orders: { $gt: 1 } } },
        { $count: 'n' },
      ]),
      Product.find({ isActive: true, stock: { $lte: 5 } }).select('name sku stock images soldCount').sort({ stock: 1 }).limit(10),
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } },
            stockValue: { $sum: { $multiply: ['$stock', { $cond: [{ $gt: ['$discountPrice', 0] }, '$discountPrice', '$price'] }] } },
          },
        },
      ]),
    ]);

    // Fill gaps so the chart shows every day (or month) in the range
    const seriesMap = new Map(series.map((s) => [s._id, s]));
    const timeline = [];
    const cursor = new Date(start);
    while (cursor <= end && timeline.length < 1200) {
      const key = toKey(cursor, byMonth);
      if (!timeline.length || timeline[timeline.length - 1].date !== key) {
        const hit = seriesMap.get(key);
        timeline.push({ date: key, revenue: round2(hit?.revenue), orders: hit?.orders || 0 });
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: {
        range: { from: toKey(start), to: toKey(end), groupedBy: byMonth ? 'month' : 'day' },
        summary: {
          ...current,
          repeatBuyers: repeatBuyers[0]?.n || 0,
          change: {
            revenue: pctChange(current.revenue, previous.revenue),
            orders: pctChange(current.orders, previous.orders),
            avgOrderValue: pctChange(current.avgOrderValue, previous.avgOrderValue),
            newCustomers: pctChange(current.newCustomers, previous.newCustomers),
          },
        },
        timeline,
        byStatus: byStatus.map((s) => ({ status: s._id, count: s.count, value: round2(s.value) })),
        byPayment: byPayment.map((p) => ({ method: p._id, count: p.count, revenue: round2(p.revenue) })),
        topProducts: topProducts.map((p) => ({ ...p, revenue: round2(p.revenue) })),
        categoryRevenue: categoryRevenue.map((c) => ({ name: c._id, quantity: c.quantity, revenue: round2(c.revenue) })),
        topCustomers: topCustomers.map((c) => ({ ...c, spent: round2(c.spent) })),
        coupons: coupons.map((c) => ({ code: c._id, uses: c.uses, discount: round2(c.discount), revenue: round2(c.revenue) })),
        lowStock,
        catalog: catalog[0]
          ? { total: catalog[0].total, active: catalog[0].active, outOfStock: catalog[0].outOfStock, stockValue: round2(catalog[0].stockValue) }
          : { total: 0, active: 0, outOfStock: 0, stockValue: 0 },
      },
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * @desc    Download orders in a date range as CSV (opens in Excel / Google Sheets)
 * @route   GET /api/admin/orders/export?from=YYYY-MM-DD&to=YYYY-MM-DD
 * @access  Private/Admin
 */
const exportOrdersCsv = async (req, res, next) => {
  try {
    const { start, end } = parseRange(req.query);
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20000)
      .lean();

    const header = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'City', 'Country', 'Items', 'Quantity', 'Subtotal', 'Shipping', 'Discount', 'Promo Code', 'Total', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = orders.map((o) => [
      o._id,
      new Date(o.createdAt).toISOString(),
      o.shippingAddress?.fullName || o.user?.name || '',
      o.shippingAddress?.email || o.user?.email || '',
      o.shippingAddress?.phone || '',
      o.shippingAddress?.city || '',
      o.shippingAddress?.country || '',
      (o.orderItems || []).map((i) => `${i.name} x${i.quantity}`).join('; '),
      (o.orderItems || []).reduce((n, i) => n + i.quantity, 0),
      o.subtotal,
      o.shippingPrice,
      o.discount,
      o.couponCode || '',
      o.totalPrice,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
    ]);

    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    const filename = `abdull-orders-${toKey(start)}-to-${toKey(end)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // BOM so Excel reads Somali/Arabic names correctly
    res.status(200).send(`﻿${csv}`);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = { getAnalytics, exportOrdersCsv };
