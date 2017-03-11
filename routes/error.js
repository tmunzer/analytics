module.exports.render = function(error, currentPage, req, res) {
    console.error("\x1b[31mERROR\x1b[0m:", error);
    res.render("error", {
        current_page: currentPage,
        error: error,
        user: req.user,
        session: req.session
    });
};