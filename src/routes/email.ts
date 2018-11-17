import express from "express";
import Mail from "../mail";

const router = express.Router();

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  const data = { ...req.body, ...req.query };

  try {
    const response = await Mail.send({
      templateName: email,
      templateData: data,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
    });

    res.setHeader("content-type", "application/json");
    res.send(response);
  } catch (error) {
    console.log(error); // tslint:disable-line
    res.status(500).send({ error: error.toString() });
  }
});

export default router;
