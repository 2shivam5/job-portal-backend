import eventBus from "../eventBus.js";
import { sendMail } from "../../utils/sendMail.js";

console.log("emailListners.js loaded (listener registered)");

eventBus.on("SendMail", async ({ to, subject, text }) => {
  console.log("LISTENER RECEIVED SendMail:", { to, subject });

     const info = await sendMail({ to, subject, text });

});
