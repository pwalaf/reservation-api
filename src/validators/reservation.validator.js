const { z } = require('zod');
const { ROOM_TYPES, STATUSES } = require('../models/Reservation');

const baseReservationSchema = z.object({
  clientName: z.string().min(2, 'Le nom du client est trop court'),
  clientPhone: z.string().optional(),
  roomType: z.enum(ROOM_TYPES),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.enum(STATUSES).optional(),
  amount: z.number().nonnegative('Le montant ne peut pas être négatif'),
  notes: z.string().optional(),
});

const checkOutAfterCheckIn = (data, ctx) => {
  if (data.checkIn && data.checkOut && data.checkOut <= data.checkIn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'checkOut doit être postérieur à checkIn',
      path: ['checkOut'],
    });
  }
};

const createReservationSchema = baseReservationSchema.superRefine(checkOutAfterCheckIn);
const updateReservationSchema = baseReservationSchema.partial().superRefine(checkOutAfterCheckIn);

const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  roomType: z.enum(ROOM_TYPES).optional(),
});

module.exports = { createReservationSchema, updateReservationSchema, listQuerySchema };
