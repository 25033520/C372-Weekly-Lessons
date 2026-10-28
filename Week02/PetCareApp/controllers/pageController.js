function indexPage(req, res) {
  res.render('index', { session: req.session });
}

module.exports = { indexPage };
