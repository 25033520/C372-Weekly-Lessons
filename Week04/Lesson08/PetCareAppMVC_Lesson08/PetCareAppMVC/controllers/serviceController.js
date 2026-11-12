const petModel = require('../models/petModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');

// Today's LOCAL date as YYYY-MM-DD (not UTC)
function getToday() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Positive whole number only: 1, 2, 3 ... (rejects 0, -1, 1.5, abc, empty)
function isPositiveInt(value) {
  return /^[1-9]\d*$/.test(String(value === undefined ? '' : value));
}

// Real calendar date in YYYY-MM-DD (rejects 2026-02-30)
function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// GET /services
function listServices(req, res) {
  const ownerId = req.session.user.id;

  petModel.getPetsByOwner(ownerId, (err, pets) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to load pets.');
    }

    serviceModel.getActiveServices((err2, services) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send('Unable to load services.');
      }

      // Preselect a pet only if it belongs to this user
      const requested = req.query.petId;
      const owned = pets.some((p) => String(p.id) === String(requested));
      const selectedPetId = owned ? String(requested) : '';

      res.render('services', {
        pets,
        services,
        selectedPetId,
        today: getToday(),
        messages: req.flash('success'),
        errors: req.flash('error'),
        session: req.session
      });
    });
  });
}

// POST /services/book
function createBooking(req, res) {
  const ownerId = req.session.user.id; // owner always from the session
  const { petId, serviceId, bookingDate } = req.body || {};

  const validIds = isPositiveInt(petId) && isPositiveInt(serviceId);
  const validDate = isRealDate(bookingDate) && bookingDate >= getToday();

  if (!validIds || !validDate) {
    req.flash('error', 'Choose a pet, service, and valid booking date.');
    return res.redirect('/services');
  }

  serviceBookingModel.createPendingBooking(
    ownerId, Number(petId), Number(serviceId), bookingDate,
    (err, result) => {
      if (err) {
        console.error(err);
        req.flash('error', 'Unable to create the booking. Please try again.');
        return res.redirect(`/services?petId=${encodeURIComponent(petId)}`);
      }

      if (!result) {
        req.flash('error', 'That pet or service is unavailable for booking.');
        return res.redirect('/services');
      }

      req.flash('success', 'Booking created. Payment is pending; no payment has been processed.');
      return res.redirect('/bookings');
    }
  );
}

// GET /bookings
function listBookings(req, res) {
  const ownerId = req.session.user.id;

  serviceBookingModel.getBookingsByOwner(ownerId, (err, bookings) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to load booking history.');
    }

    res.render('bookings', {
      bookings,
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
}

module.exports = { listServices, createBooking, listBookings };
