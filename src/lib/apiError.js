/**
 * Centralised parser + dispatcher for RTK Query / fetchBaseQuery errors.
 *
 * Backend error payloads vary, so we normalise several common shapes into a
 * single `{ message, fieldErrors, status }` object:
 *
 *   { message: "Incorrect email or password" }
 *   { code: 400, message: "..." }
 *   { message: "...", errors: [{ field: "email", message: "..." }] }
 *   { message: "...", errors: { email: "...", password: ["..."] } }
 *
 * `parseApiError`    -> turn an error into normalised data.
 * `applyFieldErrors` -> push field errors onto a react-hook-form (returns
 *                       whether any were applied). General errors are rendered
 *                       by the <ApiErrorModal /> component via the useApiError hook.
 */

const NETWORK_MESSAGES = {
  FETCH_ERROR:
    'Unable to reach the server. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.',
  PARSING_ERROR: 'We received an unexpected response from the server.',
};

function statusFallback(status) {
  if (status >= 500) return 'Something went wrong on our end. Please try again shortly.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 401) return 'Your session is invalid. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  return 'Something went wrong. Please try again.';
}

export function parseApiError(error) {
  if (!error) {
    return { message: 'Something went wrong. Please try again.', fieldErrors: {}, status: null };
  }

  const status = error.status;

  // Network / client-side fetch failures carry a string status.
  if (typeof status === 'string') {
    return {
      message: NETWORK_MESSAGES[status] || 'Something went wrong. Please try again.',
      fieldErrors: {},
      status,
    };
  }

  const data = error.data ?? {};
  const fieldErrors = {};

  const collect = (key, val) => {
    if (!key || val == null) return;
    fieldErrors[key] = Array.isArray(val) ? val[0] : val;
  };

  // errors as an array: [{ field|param|path|key, message|msg }]
  if (Array.isArray(data.errors)) {
    data.errors.forEach((e) => collect(e.field || e.param || e.path || e.key, e.message || e.msg));
  } else if (data.errors && typeof data.errors === 'object') {
    // errors as an object map: { field: message | [messages] }
    Object.entries(data.errors).forEach(([k, v]) => collect(k, v));
  }

  // some APIs nest field errors under `fields`
  if (data.fields && typeof data.fields === 'object') {
    Object.entries(data.fields).forEach(([k, v]) => collect(k, v));
  }

  const message =
    (typeof data === 'string' && data) ||
    data.message ||
    data.error ||
    statusFallback(status);

  return { message, fieldErrors, status };
}

/**
 * Map an API error's field errors onto a react-hook-form. Returns `true` when
 * at least one field error was applied — so the caller can decide whether to
 * also surface the modal for a general (non-field) error.
 *
 * @param {unknown}  error         RTK Query error object
 * @param {Function} setFormError  react-hook-form `setError`
 * @param {string[]} [fields]      whitelist of valid form field names
 * @returns {boolean} whether any inline field error was applied
 */
export function applyFieldErrors(error, setFormError, fields) {
  const { fieldErrors } = parseApiError(error);

  let mapped = false;
  Object.entries(fieldErrors).forEach(([key, msg]) => {
    if (!setFormError) return;
    if (fields && !fields.includes(key)) return;
    setFormError(key, { type: 'server', message: msg });
    mapped = true;
  });

  return mapped;
}
