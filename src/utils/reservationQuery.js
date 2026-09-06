const { ROOM_TYPES, STATUSES } = require('../models/Reservation');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildReservationFilter(query = {}) {
  const filter = {};
  const { status, roomType, search, checkInFrom, checkInTo } = query;

  if (status && STATUSES.includes(status)) {
    filter.status = status;
  }

  if (roomType && ROOM_TYPES.includes(roomType)) {
    filter.roomType = roomType;
  }

  if (search && search.trim()) {
    filter.clientName = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }

  const from = checkInFrom ? parseDate(checkInFrom) : null;
  const to = checkInTo ? parseDate(checkInTo) : null;

  if (from || to) {
    filter.checkIn = {};
    if (from) filter.checkIn.$gte = from;
    if (to) {
      to.setHours(23, 59, 59, 999);
      filter.checkIn.$lte = to;
    }
  }

  return filter;
}

const SORT_FIELDS = new Set(['checkIn', 'checkOut', 'clientName', 'amount', 'createdAt']);
const DEFAULT_SORT = { checkIn: 1 };

function buildReservationSort(sortParam) {
  if (!sortParam) return DEFAULT_SORT;
  const desc = sortParam.startsWith('-');
  const field = desc ? sortParam.slice(1) : sortParam;
  if (!SORT_FIELDS.has(field)) return DEFAULT_SORT;
  return { [field]: desc ? -1 : 1 };
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function buildPagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = {
  buildReservationFilter,
  buildReservationSort,
  buildPagination,
  SORT_FIELDS,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
