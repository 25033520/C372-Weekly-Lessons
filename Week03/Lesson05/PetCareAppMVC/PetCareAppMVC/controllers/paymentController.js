const services = require('../data/mockServices');

// Prepare payment details for a selected service
// GET /payments/prepare/:serviceId
function preparePayment(req, res) {
  const serviceId = Number(req.params.serviceId);
  const service = services.find((s) => s.id === serviceId);

  // Unknown service
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Price always comes from the catalogue, never from the client
  res.status(200).json({
    serviceId: service.id,
    serviceName: service.name,
    amount: service.price,
    currency: 'sgd',
    status: 'READY_FOR_PAYMENT'
  });
}

module.exports = { preparePayment };
