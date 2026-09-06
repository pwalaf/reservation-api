const mongoose = require('mongoose');

const ROOM_TYPES = ['simple', 'double', 'suite', 'dortoir'];
const STATUSES = ['en_attente', 'confirmee', 'annulee'];

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reservationSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, trim: true },
    roomType: { type: String, enum: ROOM_TYPES, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, enum: STATUSES, default: 'en_attente' },
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: () => [{ status: 'en_attente', changedAt: new Date() }],
    },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

reservationSchema.pre('validate', function guardDateRange(next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    next(new Error('checkOut doit être postérieur à checkIn'));
    return;
  }
  next();
});

reservationSchema.index({ status: 1, checkIn: 1 });
// Un index simple sur clientName n'accélère que les recherches ancrées en
// début de chaîne. La recherche ?search= est une sous-chaîne libre, donc
// elle scanne la collection quel que soit l'index — acceptable à ce volume.
reservationSchema.index({ clientName: 1 });

module.exports = {
  Reservation: mongoose.model('Reservation', reservationSchema),
  ROOM_TYPES,
  STATUSES,
};
