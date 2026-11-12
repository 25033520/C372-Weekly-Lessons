const pool = require('../config/db');

// Create a pending booking and its pending payment in ONE transaction.
// callback(null, { bookingId, paymentId })  -> both records committed
// callback(null, null)                      -> pet not owned / service unavailable
// callback(err)                             -> database error
function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  pool.getConnection((err, conn) => {
    if (err) return callback(err);

    // Release the connection and call the callback exactly once
    const finish = (error, result) => {
      conn.release();
      callback(error, result);
    };

    // Undo everything in this transaction, then finish
    const rollback = (error, result) => {
      conn.rollback((rollbackErr) => {
        if (rollbackErr) console.error('Rollback failed:', rollbackErr);
        const finalErr = error || rollbackErr || null;
        finish(finalErr, finalErr ? undefined : result);
      });
    };

    conn.beginTransaction((err) => {
      if (err) return finish(err);

      // Insert ONLY if the pet belongs to this owner and the service is active.
      // The price comes from the services table, never from the request.
      const bookingSql = `
        INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date)
        SELECT p.id, s.id, 'pending', s.price, ?
        FROM pets p
        JOIN services s ON s.id = ? AND s.is_active = 1
        WHERE p.id = ? AND p.owner_id = ?`;

      conn.query(bookingSql, [bookingDate, serviceId, petId, ownerId], (err, result) => {
        if (err) return rollback(err);
        if (result.affectedRows !== 1) return rollback(null, null); // unavailable

        const bookingId = result.insertId;

        // Payment amount comes from the booking's stored price
        const paymentSql = `
          INSERT INTO payments (booking_id, amount, payment_status)
          SELECT id, booked_price, 'pending' FROM service_bookings WHERE id = ?`;

        conn.query(paymentSql, [bookingId], (err, payResult) => {
          if (err) return rollback(err);
          if (payResult.affectedRows !== 1) {
            return rollback(new Error('Payment record was not created'));
          }

          conn.commit((err) => {
            if (err) return rollback(err);
            finish(null, { bookingId, paymentId: payResult.insertId });
          });
        });
      });
    });
  });
}

// Booking history for pets owned by this user, newest first
function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT b.id AS booking_id,
           DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
           p.name AS pet_name,
           s.name AS service_name,
           b.booked_price,
           b.booking_status,
           pay.payment_status,
           pay.payment_reference,
           b.created_at
    FROM service_bookings b
    JOIN pets p ON p.id = b.pet_id
    JOIN services s ON s.id = b.service_id
    LEFT JOIN payments pay ON pay.booking_id = b.id
    WHERE p.owner_id = ?
    ORDER BY b.created_at DESC, b.id DESC`;
  pool.query(sql, [ownerId], callback);
}

module.exports = { createPendingBooking, getBookingsByOwner };
