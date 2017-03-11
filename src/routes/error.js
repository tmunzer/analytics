module.exports.render = function(error, currentPage, req, res) {
    console.error("ERROR:", error);
    res.render("error", {
        current_page: currentPage,
        error: error,
        user: req.user,
        session: req.session
    });
};