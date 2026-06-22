import { app } from "./app";
import { environment } from "./config/environment";

app.listen(environment.PORT, () => {
  console.log(`Server running on http://localhost:${environment.PORT}`);
});
