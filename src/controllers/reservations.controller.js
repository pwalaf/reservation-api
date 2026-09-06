const { Reservation } = require('../models/Reservation');
const {
  createReservationSchema,
  updateReservationSchema,
} = require('../validators/reservation.validator');
const {
  buildReservationFilter,
  buildReservationSort,
  buildPagination,
} = require('../utils/reservationQuery');
const { reservationsToCsv } = require('../utils/csv');
const { reservationsToPdf } = require('../utils/pdf');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const list = asyncHandler(async (req, res) => {
  const filter = buildReservationFilter(req.query);
  const sort = buildReservationSort(req.query.sort);
  const { page, limit, skip } = buildPagination(req.query);

  const [data, total] = await Promise.all([
    Reservation.find(filter).sort(sort).skip(skip).limit(limit),
    Reservation.countDocuments(filter),
  ]);

  res.json({
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const getById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new ApiError(404, 'reservation_introuvable');
  res.json(reservation);
});

const create = asyncHandler(async (req, res) => {
  const payload = createReservationSchema.parse(req.body);
  const reservation = await Reservation.create(payload);
  res.status(201).json(reservation);
});

const update = asyncHandler(async (req, res) => {
  const payload = updateReservationSchema.parse(req.body);
  const { status, ...rest } = payload;

  const updateOps = { $set: rest };
  if (status) {
    updateOps.$set.status = status;
    updateOps.$push = { statusHistory: { status, changedAt: new Date() } };
  }

  const reservation = await Reservation.findByIdAndUpdate(req.params.id, updateOps, {
    new: true,
    runValidators: true,
  });
  if (!reservation) throw new ApiError(404, 'reservation_introuvable');
  res.json(reservation);
});

const remove = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByIdAndDelete(req.params.id);
  if (!reservation) throw new ApiError(404, 'reservation_introuvable');
  res.status(204).send();
});

const stats = asyncHandler(async (req, res) => {
  const [result] = await Reservation.aggregate([
    {
      $facet: {
        revenuParMois: [
          { $match: { status: 'confirmee' } },
          {
            $group: {
              _id: { annee: { $year: '$checkIn' }, mois: { $month: '$checkIn' } },
              revenu: { $sum: '$amount' },
              nombreReservations: { $sum: 1 },
            },
          },
          { $sort: { '_id.annee': 1, '_id.mois': 1 } },
        ],
        occupationParTypeChambre: [
          { $match: { status: { $in: ['confirmee', 'en_attente'] } } },
          {
            $group: {
              _id: '$roomType',
              nombreReservations: { $sum: 1 },
              revenuTotal: { $sum: '$amount' },
            },
          },
          { $sort: { nombreReservations: -1 } },
        ],
        delaiMoyenConfirmationHeures: [
          { $match: { status: 'confirmee' } },
          { $unwind: '$statusHistory' },
          {
            $group: {
              _id: '$_id',
              creation: { $min: '$statusHistory.changedAt' },
              confirmation: {
                $min: {
                  $cond: [{ $eq: ['$statusHistory.status', 'confirmee'] }, '$statusHistory.changedAt', null],
                },
              },
            },
          },
          { $match: { confirmation: { $ne: null } } },
          {
            $project: {
              heures: { $divide: [{ $subtract: ['$confirmation', '$creation'] }, 1000 * 60 * 60] },
            },
          },
          { $group: { _id: null, moyenne: { $avg: '$heures' } } },
        ],
      },
    },
  ]);

  res.json({
    revenuParMois: result.revenuParMois,
    occupationParTypeChambre: result.occupationParTypeChambre,
    chambrePlusDemandee: result.occupationParTypeChambre[0]?._id ?? null,
    delaiMoyenConfirmationHeures: result.delaiMoyenConfirmationHeures[0]?.moyenne ?? null,
  });
});

const EXPORT_LIMIT = 1000;

const exportReservations = asyncHandler(async (req, res) => {
  const format = String(req.query.format ?? 'csv').toLowerCase();
  if (!['csv', 'pdf'].includes(format)) {
    throw new ApiError(400, 'format_export_invalide');
  }

  const filter = buildReservationFilter(req.query);
  const sort = buildReservationSort(req.query.sort);
  const reservations = await Reservation.find(filter).sort(sort).limit(EXPORT_LIMIT);

  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const csv = reservationsToCsv(reservations);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reservations-${timestamp}.csv"`);
    res.send(csv);
    return;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="reservations-${timestamp}.pdf"`);
  const doc = reservationsToPdf(reservations, { title: 'Réservations' });
  doc.pipe(res);
});

module.exports = { list, getById, create, update, remove, stats, exportReservations };
