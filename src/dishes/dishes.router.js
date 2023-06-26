const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../utils/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass
router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route("/:dishId").get(controller.read).all(methodNotAllowed);

module.exports = router;
