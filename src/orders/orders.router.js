const methodNotAllowed = require("../utils/methodNotAllowed");
const controller = require("./orders.controller");
const router = require("express").Router();

// TODO: Implement the /orders routes needed to make the tests pass
router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router
    .route("/:orderId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete)
    .all(methodNotAllowed);

module.exports = router;
