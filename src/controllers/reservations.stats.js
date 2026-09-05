const { Reservation } = require('../models/Reservation');
const { asyncHandler } = require('../middleware/asyncHandler');

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

module.exports = { stats };
