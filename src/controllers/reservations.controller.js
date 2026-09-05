const { Reservation } = require('../models/Reservation');
const {
  createReservationSchema,
  updateReservationSchema,
  listQuerySchema,
} = require('../validators/reservation.validator');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const list = asyncHandler(async (req, res) => {
  const { status, roomType } = listQuerySchema.parse(req.query);
  const filter = {};
  if (status) filter.status = status;
  if (roomType) filter.roomType = roomType;

  const reservations = await Reservation.find(filter).sort({ checkIn: 1 });
  res.json(reservations);
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

module.exports = { list, getById, create, update, remove };
