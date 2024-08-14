import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";
import { isString } from 'lodash';

const toastError = (err) => {
  let errorMsg = '';

  if (err.response && err.response.data && err.response.data.error) {
    errorMsg = err.response.data.error;
    if (i18n.exists(`backendErrors.${errorMsg}`)) {
      errorMsg = i18n.t(`backendErrors.${errorMsg}`);
    }
  } else if (isString(err)) {
    errorMsg = err;
  } else {
    errorMsg = "An error occurred!"; // Consider adding a unique code or identifier
  }

  toast.error(errorMsg, {
    toastId: errorMsg, // Consider using a more unique ID if necessary
    autoClose: 5000, // Adjusted autoClose for better user experience
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};

export default toastError;
