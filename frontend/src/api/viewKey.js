import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

export function getViewKey() {
  let key = Cookies.get("viewKey");
  if (!key) {
    key = uuidv4();
    Cookies.set("viewKey", key, {
      expires: 365,
      path: "/",
      sameSite: "Lax",
    });
  }
  return key;
}
